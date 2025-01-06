"use server";

import OpenAI from "openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { currentUser } from "@clerk/nextjs/server";
import { google } from "googleapis";
import axios from "axios";
import { Readable } from "stream";

// Types
interface ChatOptions {
  maxContextLength?: number;
  model?: string;
  temperature?: number;
}

interface GoogleDriveFile {
  id: string;
  mimeType?: string;
  name?: string;
}

// Configuration
const DEFAULTS = {
  MAX_CONTEXT_LENGTH: 6000,
  MODEL: "gpt-4o-mini",
  TEMPERATURE: 0.7,
  MIME_TYPE: "application/pdf"
} as const;

// Initialize OpenAI client
const openai = new OpenAI();

// Google Drive service initialization
function createGoogleDriveClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.OAUTH2_REDIRECT_URI
  );
  
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth: oauth2Client });
}

// Clerk authentication
async function getGoogleAccessToken(): Promise<string> {
  const user = await currentUser();
  if (!user) throw new Error("Authentication required");

  const response = await axios({
    method: "get",
    url: `https://api.clerk.com/v1/users/${user.id}/oauth_access_tokens/oauth_google`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
  });

  const accessToken = response.data[0]?.token;
  if (!accessToken) throw new Error("Failed to retrieve Google access token");
  
  return accessToken;
}

// PDF handling
async function getPDFBufferFromGoogleDrive(fileId: string): Promise<Buffer> {
  try {
    const accessToken = await getGoogleAccessToken();
    const drive = createGoogleDriveClient(accessToken);

    // Verify file type
    const fileMetadata = await drive.files.get({
      fileId,
      fields: "mimeType, name",
    });

    if (fileMetadata.data.mimeType !== DEFAULTS.MIME_TYPE) {
      throw new Error(`Invalid file type. Expected PDF, got ${fileMetadata.data.mimeType}`);
    }

    // Download file
    const response = await drive.files.get(
      {
        fileId,
        alt: "media",
      },
      { responseType: "stream" }
    );

    return new Promise((resolve, reject) => {
      const buffers: Buffer[] = [];
      const stream = response.data as unknown as Readable;

      stream.on("data", (chunk) => buffers.push(Buffer.from(chunk)));
      stream.on("end", () => resolve(Buffer.concat(buffers)));
      stream.on("error", reject);
    });
  } catch (error) {
    console.error("Failed to fetch PDF from Google Drive:", error);
    throw new Error("Failed to retrieve PDF file");
  }
}

async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const blob = new Blob([pdfBuffer], { type: DEFAULTS.MIME_TYPE });
    const loader = new PDFLoader(blob);
    const docs = await loader.load();
    return docs.map((doc) => doc.pageContent).join("\n");
  } catch (error) {
    console.error("Failed to extract text from PDF:", error);
    throw new Error("Failed to process PDF content");
  }
}

// OpenAI chat completion
function createPrompt(userQuestion: string, pdfContext: string): string {
  return `Context from PDF:\n${pdfContext}\n\nBased on the above context, please answer this question:\n${userQuestion}`;
}

export async function chatGPT(
  userInput: string,
  file?: GoogleDriveFile | Buffer,
  options: ChatOptions = {}
): Promise<string> {
  try {
    let contextualPrompt = userInput;
    
    // Process file if provided
    if (file) {
      let pdfBuffer: Buffer;
      if (Buffer.isBuffer(file)) {
        pdfBuffer = file;
      } else if (file.id) {
        pdfBuffer = await getPDFBufferFromGoogleDrive(file.id);
      } else {
        throw new Error("Invalid file input");
      }

      const pdfText = await extractTextFromPDF(pdfBuffer);
      const truncatedContext = pdfText.slice(0, options.maxContextLength ?? DEFAULTS.MAX_CONTEXT_LENGTH);
      contextualPrompt = createPrompt(userInput, truncatedContext);
    }

    // Get completion from OpenAI
    const stream = await openai.chat.completions.create({
      model: options.model ?? DEFAULTS.MODEL,
      messages: [
        {
          role: "system",
          content: file 
            ? "You are a helpful assistant that answers questions based on the provided PDF context. If the answer cannot be found in the context, say so."
            : "You are a helpful assistant that answers questions based on your knowledge.",
        },
        {
          role: "user",
          content: contextualPrompt,
        },
      ],
      temperature: options.temperature ?? DEFAULTS.TEMPERATURE,
      stream: true,
    });

    // Process stream response
    let fullResponse = "";
    for await (const part of stream) {
      const content = part.choices[0]?.delta?.content ?? "";
      fullResponse += content;
    }

    return fullResponse;
  } catch (error) {
    console.error("Error in chatGPT:", error);
    throw new Error("Failed to process request");
  }
}