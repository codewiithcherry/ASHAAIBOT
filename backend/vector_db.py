import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

class VectorDB:
    def __init__(self):
        self.client = chromadb.Client(Settings(
            chroma_db_impl="duckdb+parquet",
            persist_directory="data/vector_db"
        ))
        self.collection = self.client.get_or_create_collection(
            name="asha_knowledge",
            metadata={"hnsw:space": "cosine"}
        )

    def add_documents(self, documents: List[Dict[str, Any]]):
        """Add documents to the vector database"""
        ids = [str(i) for i in range(len(documents))]
        texts = [doc["content"] for doc in documents]
        metadatas = [{"source": doc.get("source", "unknown"), 
                     "type": doc.get("type", "text")} 
                    for doc in documents]
        
        self.collection.add(
            documents=texts,
            metadatas=metadatas,
            ids=ids
        )

    def search(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Search for relevant documents"""
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        return [{
            "content": doc,
            "metadata": meta,
            "distance": dist
        } for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        )]

    def get_context(self, query: str, n_results: int = 3) -> str:
        """Get relevant context for a query"""
        results = self.search(query, n_results)
        context = "\n".join([doc["content"] for doc in results])
        return context 