export async function submitRodinJob(formData: FormData): Promise<any> {
  try {
    const response = await fetch("/api/rodin", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (error: any) {
    console.error("Error submitting Rodin job:", error)
    throw new Error(`Failed to submit Rodin job: ${error.message}`)
  }
}

export async function checkJobStatus(subscriptionKey: string): Promise<any> {
  try {
    const response = await fetch("/api/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subscription_key }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (error: any) {
    console.error("Error checking job status:", error)
    throw new Error(`Failed to check job status: ${error.message}`)
  }
}

export async function downloadModel(taskUuid: string): Promise<any> {
  try {
    const response = await fetch("/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task_uuid }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (error: any) {
    console.error("Error downloading model:", error)
    throw new Error(`Failed to download model: ${error.message}`)
  }
}

export async function getAIResponse(messages: any): Promise<string> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data.content
  } catch (error: any) {
    console.error("Error getting AI response:", error)
    throw new Error(`Failed to get AI response: ${error.message}`)
  }
}
