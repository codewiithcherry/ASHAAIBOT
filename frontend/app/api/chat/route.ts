import { NextResponse } from "next/server"
import { getAIResponse } from "@/lib/api-service"

export async function POST(request: Request) {
  try {
    // Get the message data from the request
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Get AI response using the service
    const responseText = await getAIResponse(messages)

    return NextResponse.json({
      role: "assistant",
      content: responseText,
    })
  } catch (error) {
    console.error("Error in Chat API route:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
