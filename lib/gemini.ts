import {
  GoogleGenerativeAI,
  SchemaType,
  type GenerationConfig,
  type GenerativeModel,
  type Schema,
} from "@google/generative-ai";

export const GEMINI_MODELS = {
  FLASH: "gemini-2.0-flash",
  PRO: "gemini-2.0-flash",
} as const;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenerativeAI(apiKey);
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function requireGemini() {
  if (!isGeminiConfigured()) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
}

function getModel(
  modelName: string = GEMINI_MODELS.FLASH,
  config?: {
    systemInstruction?: string;
    generationConfig?: GenerationConfig;
  }
): GenerativeModel {
  return getClient().getGenerativeModel({
    model: modelName,
    systemInstruction: config?.systemInstruction,
    generationConfig: config?.generationConfig,
  });
}

export async function generateText(options: {
  model?: string;
  system?: string;
  prompt: string;
  maxOutputTokens?: number;
}): Promise<string> {
  const model = getModel(options.model ?? GEMINI_MODELS.FLASH, {
    systemInstruction: options.system,
    generationConfig: {
      maxOutputTokens: options.maxOutputTokens ?? 1024,
    },
  });

  const result = await model.generateContent(options.prompt);
  return result.response.text();
}

export async function generateChatReply(options: {
  model?: string;
  system?: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  message: string;
  maxOutputTokens?: number;
}): Promise<string> {
  const model = getModel(options.model ?? GEMINI_MODELS.FLASH, {
    systemInstruction: options.system,
    generationConfig: {
      maxOutputTokens: options.maxOutputTokens ?? 1024,
    },
  });

  const chat = model.startChat({
    history: options.history.map((entry) => ({
      role: entry.role === "assistant" ? "model" : "user",
      parts: [{ text: entry.content }],
    })),
  });

  const result = await chat.sendMessage(options.message);
  return result.response.text();
}

export async function* streamText(options: {
  model?: string;
  prompt: string;
  maxOutputTokens?: number;
}): AsyncGenerator<string> {
  const model = getModel(options.model ?? GEMINI_MODELS.FLASH, {
    generationConfig: {
      maxOutputTokens: options.maxOutputTokens ?? 1500,
    },
  });

  const result = await model.generateContentStream(options.prompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

export async function generateStructuredJson<T>(options: {
  model?: string;
  prompt: string;
  schema: Schema;
  maxOutputTokens?: number;
}): Promise<T> {
  const model = getModel(options.model ?? GEMINI_MODELS.FLASH, {
    generationConfig: {
      maxOutputTokens: options.maxOutputTokens ?? 512,
      responseMimeType: "application/json",
      responseSchema: options.schema,
    },
  });

  const result = await model.generateContent(options.prompt);
  const text = result.response.text();
  return JSON.parse(text) as T;
}

export { SchemaType };
