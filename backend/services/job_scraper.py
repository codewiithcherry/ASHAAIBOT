import requests
from typing import List, Dict, Any
from datetime import datetime

class JobScraper:
    def __init__(self):
        self.base_url = "https://api.adzuna.com/v1/api/jobs"
        self.app_id = "1e9046a1"  # Replace with your actual app ID
        self.app_key = "d43f8b1c7c5e8a9b0f1d2e3c4b5a6d7e"  # Replace with your actual app key
        
    def search_jobs(self, query: str = None, location: str = None) -> List[Dict[str, Any]]:
        """Search for jobs using the Adzuna API"""
        try:
            params = {
                "app_id": self.app_id,
                "app_key": self.app_key,
                "results_per_page": 50,
                "content-type": "application/json"
            }
            
            if query:
                params["what"] = query
            if location:
                params["where"] = location
                
            response = requests.get(self.base_url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                jobs = data.get("results", [])
                
                # Format the jobs data
                formatted_jobs = []
                for job in jobs:
                    formatted_job = {
                        "title": job.get("title", ""),
                        "company": job.get("company", {}).get("display_name", ""),
                        "location": job.get("location", {}).get("display_name", ""),
                        "description": job.get("description", ""),
                        "salary_min": job.get("salary_min", 0),
                        "salary_max": job.get("salary_max", 0),
                        "salary_currency": job.get("salary_currency", ""),
                        "created": job.get("created", ""),
                        "redirect_url": job.get("redirect_url", ""),
                        "contract_type": job.get("contract_type", ""),
                        "category": job.get("category", {}).get("label", "")
                    }
                    formatted_jobs.append(formatted_job)
                    
                return formatted_jobs
            else:
                return []
                
        except Exception as e:
            print(f"Error searching jobs: {str(e)}")
            return [] 