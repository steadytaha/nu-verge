"use server";
import OpenAI from "openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { getPDFBufferFromGoogleDrive } from "@/app/api/drive/route";
import { useAutoStore } from "@/store";

const client = new OpenAI();
const buffer = getPDFBufferFromGoogleDrive(
  useAutoStore.getState().selectedGoogleDriveFile?.id || ""
);

async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    const loader = new PDFLoader(blob);
    const docs = await loader.load();
    return docs.map((doc) => doc.pageContent).join("\n");
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
}

function createContextAwarePrompt(
  userQuestion: string,
  pdfContext: string
): string {
  return `Context from PDF:
    ${pdfContext}
  
    Based on the above context, please answer this question:
    ${userQuestion}`;
}

export async function chatGPTWithPDF(
    userQuestion: string,
    file?: any,
    options: {
      maxContextLength?: number;
      model?: string;
      temperature?: number;
    } = {}
  ) {
    try {
      let contextualPrompt = userQuestion;
  
      if (file) {
        const buffer = await getPDFBufferFromGoogleDrive(file.id);
        if (buffer) {
          const pdfText = await extractTextFromPDF(buffer);
          const maxContextLength = options.maxContextLength || 6000;
          const truncatedContext = pdfText.slice(0, maxContextLength);
          contextualPrompt = createContextAwarePrompt(
            userQuestion,
            truncatedContext
          );
        }
      }
  
      const stream = await client.chat.completions.create({
        model: options.model || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that answers questions based on the provided PDF context. If the answer cannot be found in the context, say so.",
          },
          {
            role: "user",
            content: contextualPrompt,
          },
        ],
        temperature: options.temperature || 0.7,
        stream: true,
      });
  
      let fullResponse = "";
      for await (const part of stream) {
        const content = part.choices[0]?.delta?.content || "";
        fullResponse += content;
        process.stdout.write(content);
      }
  
      return fullResponse;
    } catch (error) {
      console.error("Error in chatGPTWithPDF:", error);
      throw error;
    }
  }
