from typing import Dict, Any, List
from .vector_db import VectorDB
from .embeddings import EmbeddingService
from .memory import ConversationMemory
import requests
from dotenv import load_dotenv
import os

load_dotenv()

class AICore:
    def __init__(self):
        self.vector_db = VectorDB()
        self.embedding_service = EmbeddingService()
        self.memory = ConversationMemory()
        self.openrouter_api_key = "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"
        self.model = "nvidia/llama3.3-nemotron-super-49b-v1"
        
    def _call_openrouter(self, messages: List[Dict[str, str]]) -> str:
        """Make API call to OpenRouter"""
        headers = {
            "Authorization": f"Bearer {self.openrouter_api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1000,
            "top_p": 0.9,
            "frequency_penalty": 0.5,
            "presence_penalty": 0.5
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data
        )
        
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"]
        else:
            raise Exception(f"OpenRouter API error: {response.text}")
        
    def process_query(self, conversation_id: str, query: str) -> Dict[str, Any]:
        """Process a user query and generate a response"""
        # Get conversation context
        context = self.memory.get_context(conversation_id)
        
        # Get relevant knowledge from vector DB
        knowledge = self.vector_db.get_context(query)
        
        # Prepare the messages for the API call
        messages = [
            {
                "role": "system",
                "content": """You are ASHA, an AI career assistant powered by NVIDIA's Llama 3.3 Nemotron Super model. 
                Your role is to provide expert career guidance and support. Use the provided context and knowledge to 
                deliver accurate, helpful, and personalized responses."""
            },
            {
                "role": "user",
                "content": f"""
                Previous conversation:
                {context}
                
                Relevant knowledge:
                {knowledge}
                
                User query: {query}
                
                Please provide a comprehensive and helpful response based on the conversation context and relevant knowledge.
                """
            }
        ]
        
        # Generate response using OpenRouter
        answer = self._call_openrouter(messages)
        
        # Store the interaction in memory
        self.memory.add_message(conversation_id, "user", query)
        self.memory.add_message(conversation_id, "assistant", answer)
        
        return {
            "response": answer,
            "context": context,
            "knowledge_used": knowledge
        }
    
    def add_knowledge(self, documents: List[Dict[str, Any]]):
        """Add new knowledge to the vector database"""
        self.vector_db.add_documents(documents)
    
    def get_conversation_history(self, conversation_id: str) -> List[Dict[str, Any]]:
        """Get the full conversation history"""
        return self.memory.get_conversation(conversation_id)
    
    def clear_conversation(self, conversation_id: str):
        """Clear conversation history"""
        self.memory.add_message(conversation_id, "system", "Conversation cleared") 