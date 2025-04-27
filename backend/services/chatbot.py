import requests
from typing import List, Dict, Any
from datetime import datetime
import json
import os
import re
from dotenv import load_dotenv
import time

load_dotenv()

class ChatbotService:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.model = "nvidia/llama-3.3-nemotron-super-49b-v1:free"
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/your-repo",
            "X-Title": "ASHA Career Assistant"
        }
        
    def _clean_response(self, text: str) -> str:
        """Clean up the response text by removing markdown and extra formatting"""
        # Remove markdown headers
        text = re.sub(r'#+\s*', '', text)
        # Remove bold/italic markdown
        text = re.sub(r'\*\*|\*|__|_', '', text)
        # Remove code blocks
        text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
        # Remove inline code
        text = re.sub(r'`.*?`', '', text)
        # Remove extra newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        # Remove extra spaces
        text = re.sub(r' +', ' ', text)
        # Remove leading/trailing whitespace
        text = text.strip()
        return text
        
    def _format_messages(self, conversation_history: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Format conversation history for the API"""
        formatted_messages = []
        for msg in conversation_history:
            formatted_messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        return formatted_messages
        
    def generate_response(self, conversation_history: List[Dict[str, str]], user_input: str) -> Dict[str, Any]:
        """Generate a response using the Llama 3.3 Nemotron Super model"""
        try:
            if not self.api_key:
                raise Exception("OpenRouter API key not found. Please set OPENROUTER_API_KEY in your environment variables.")
            
            # Add user input to conversation history
            conversation_history.append({
                "role": "user",
                "content": user_input,
                "timestamp": datetime.now().isoformat()
            })
            
            # Prepare messages for the API
            messages = self._format_messages(conversation_history)
            
            # Add system message if this is the first message
            if len(messages) == 1:
                messages.insert(0, {
                    "role": "system",
                    "content": """You are ASHA, an AI career assistant powered by NVIDIA's Llama 3.3 Nemotron Super model. 
                    Your role is to provide expert career guidance and support. You should:
                    1. Be friendly and professional in your responses
                    2. Provide clear, actionable advice
                    3. Ask relevant follow-up questions when needed
                    4. Maintain context throughout the conversation
                    5. Offer specific examples and resources when appropriate
                    6. Be empathetic and understanding of career challenges
                    7. Provide detailed explanations for technical terms
                    8. Help with job search strategies, resume building, and interview preparation
                    
                    Always maintain a professional, empathetic, and solution-oriented approach while focusing on the user's career goals and aspirations.
                    
                    IMPORTANT: Do not use markdown formatting, asterisks, or special characters in your responses. Use plain text only."""
                })
            
            data = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1000,
                "top_p": 0.9,
                "frequency_penalty": 0.5,
                "presence_penalty": 0.5
            }
            
            # Add retry logic
            max_retries = 3
            retry_count = 0
            last_error = None
            
            while retry_count < max_retries:
                try:
                    # Make API call
                    response = requests.post(
                        self.base_url,
                        headers=self.headers,
                        json=data,
                        timeout=30
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        assistant_response = result["choices"][0]["message"]["content"]
                        
                        # Clean up the response
                        assistant_response = self._clean_response(assistant_response)
                        
                        # Add assistant response to conversation history
                        conversation_history.append({
                            "role": "assistant",
                            "content": assistant_response,
                            "timestamp": datetime.now().isoformat()
                        })
                        
                        return {
                            "response": assistant_response,
                            "conversation_history": conversation_history,
                            "status": "success"
                        }
                    elif response.status_code == 429:  # Rate limit
                        retry_count += 1
                        if retry_count < max_retries:
                            time.sleep(2 ** retry_count)  # Exponential backoff
                            continue
                    else:
                        error_msg = f"API Error: {response.status_code} - {response.text}"
                        print(f"Error in generate_response: {error_msg}")
                        last_error = error_msg
                        break
                        
                except requests.exceptions.RequestException as e:
                    print(f"Request exception in generate_response: {str(e)}")
                    retry_count += 1
                    if retry_count < max_retries:
                        time.sleep(2 ** retry_count)  # Exponential backoff
                        continue
                    last_error = str(e)
                    break
            
            # If we get here, all retries failed
            error_response = f"I apologize, but I encountered an issue: {last_error or 'Unknown error'}. Please try rephrasing your question or try again later."
            conversation_history.append({
                "role": "assistant",
                "content": error_response,
                "timestamp": datetime.now().isoformat()
            })
            return {
                "response": error_response,
                "conversation_history": conversation_history,
                "status": "error"
            }
                
        except Exception as e:
            print(f"Exception in generate_response: {str(e)}")
            error_response = f"I apologize, but I encountered an issue: {str(e)}. Please try rephrasing your question or try again later."
            conversation_history.append({
                "role": "assistant",
                "content": error_response,
                "timestamp": datetime.now().isoformat()
            })
            return {
                "response": error_response,
                "conversation_history": conversation_history,
                "status": "error"
            }
            
    def get_conversation_summary(self, conversation_history: List[Dict[str, str]]) -> str:
        """Generate a summary of the conversation using the Llama 3.3 Nemotron Super model"""
        try:
            messages = self._format_messages(conversation_history)
            messages.append({
                "role": "user",
                "content": """Please provide a comprehensive summary of our conversation, including:
                1. Key career-related topics discussed
                2. Important decisions or insights shared
                3. Action items or next steps identified
                4. Any specific resources or recommendations mentioned
                
                Format the summary in a clear, organized manner that highlights the most important aspects of our discussion."""
            })
            
            data = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": 1000,
                "top_p": 0.9,
                "frequency_penalty": 0.5,
                "presence_penalty": 0.5
            }
            
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=data,
                timeout=30  # Add timeout
            )
            
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            else:
                error_msg = f"API Error: {response.status_code} - {response.text}"
                print(f"Error in get_conversation_summary: {error_msg}")  # Debug log
                raise Exception(error_msg)
                
        except Exception as e:
            print(f"Exception in get_conversation_summary: {str(e)}")  # Debug log
            return "I apologize, but I'm experiencing technical difficulties while trying to generate the summary." 