import { GoogleGenerativeAI } from "@google/generative-ai";
 
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
 
export async function evaluateAnswer(question: string, answer: string, role: string = "Developer") {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
 
    const prompt = `You are an expert interviewer evaluating a candidate for a ${role} position.
Question: "${question}"
Candidate Answer: "${answer}"
 
Provide a structured evaluation in valid JSON format with the following keys:
- "score": A number out of 10 based on accuracy and completeness.
- "feedback": A concise, constructive 2-sentence feedback explaining the score and how to improve.
 
Return ONLY the raw JSON object, no markdown formatting.`;
 
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Remove markdown block backticks if present
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
 
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini API Evaluation Error:", error);
    return {
      score: 5,
      feedback: "Answer received. Unable to reach AI scoring service at the moment."
    };
  }
}
