from typing import List, Dict, Any
from datetime import datetime
import json
import os

class ConversationMemory:
    def __init__(self, max_history: int = 10):
        self.max_history = max_history
        self.memory_file = "data/conversation_memory.json"
        self._ensure_memory_file()
        
    def _ensure_memory_file(self):
        """Ensure memory file exists"""
        os.makedirs(os.path.dirname(self.memory_file), exist_ok=True)
        if not os.path.exists(self.memory_file):
            with open(self.memory_file, "w") as f:
                json.dump({"conversations": []}, f)
    
    def add_message(self, conversation_id: str, role: str, content: str, metadata: Dict[str, Any] = None):
        """Add a message to conversation history"""
        with open(self.memory_file, "r") as f:
            data = json.load(f)
            
        conversation = next(
            (c for c in data["conversations"] if c["id"] == conversation_id),
            {"id": conversation_id, "messages": []}
        )
        
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        conversation["messages"].append(message)
        
        # Keep only the last max_history messages
        if len(conversation["messages"]) > self.max_history:
            conversation["messages"] = conversation["messages"][-self.max_history:]
            
        # Update or add conversation
        if conversation not in data["conversations"]:
            data["conversations"].append(conversation)
        else:
            data["conversations"] = [
                conversation if c["id"] == conversation_id else c
                for c in data["conversations"]
            ]
            
        with open(self.memory_file, "w") as f:
            json.dump(data, f, indent=2)
    
    def get_conversation(self, conversation_id: str) -> List[Dict[str, Any]]:
        """Get conversation history"""
        with open(self.memory_file, "r") as f:
            data = json.load(f)
            
        conversation = next(
            (c for c in data["conversations"] if c["id"] == conversation_id),
            {"messages": []}
        )
        
        return conversation["messages"]
    
    def get_context(self, conversation_id: str, n_messages: int = 5) -> str:
        """Get recent conversation context"""
        messages = self.get_conversation(conversation_id)
        recent_messages = messages[-n_messages:]
        return "\n".join([
            f"{msg['role']}: {msg['content']}"
            for msg in recent_messages
        ]) 