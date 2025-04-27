from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np

class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        
    def get_embedding(self, text: str) -> np.ndarray:
        """Get embedding for a single text"""
        return self.model.encode(text)
    
    def get_embeddings(self, texts: List[str]) -> np.ndarray:
        """Get embeddings for multiple texts"""
        return self.model.encode(texts)
    
    def get_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts"""
        emb1 = self.get_embedding(text1)
        emb2 = self.get_embedding(text2)
        return np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2)) 