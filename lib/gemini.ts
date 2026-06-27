import {
  GoogleGenerativeAI,
  SchemaType,
  type GenerationConfig,
  type GenerativeModel,
  type Schema,
} from "@google/generative-ai";

export const GEMINI_MODELS = {
  FLASH: "gemini-2.0-flash-lite",
  FALLBACK: "gemini-1.5-flash",
} as const;

const MODEL_CHAIN = [
  process.env.GEMINI_MODEL,
  GEMINI_MODELS.FLASH,
  GEMINI_MODELS.FALLBACK,
  "gemini-2.0-flash",
].filter(
  (model, index, list): model is string =>
    Boolean(model) && list.indexOf(model) === index
);

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

function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("429") || msg.toLowerCase().includes("quota");
}

export function formatGeminiError(err: unknown, locale = "en"): string {
  const msg = err instanceof Error ? err.message : String(err);

  if (msg.includes("GEMINI_API_KEY is not configured")) {
    if (locale === "fr") return "Clé GEMINI_API_KEY non configurée sur le serveur.";
    if (locale === "ar") return "مفتاح GEMINI_API_KEY غير مُعد على الخادم.";
    return "GEMINI_API_KEY is not configured on the server.";
  }

  if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID")) {
    if (locale === "fr") {
      return "Clé Gemini invalide. Créez une clé sur Google AI Studio (format AIzaSy...).";
    }
    if (locale === "ar") return "مفتاح Gemini غير صالح. أنشئ مفتاحًا من Google AI Studio.";
    return "Invalid Gemini API key. Create one at Google AI Studio (AIzaSy... format).";
  }

  if (isQuotaError(err)) {
    if (locale === "fr") {
      return "Quota Gemini dépassé. Attendez 1 minute puis réessayez, ou vérifiez votre plan sur Google AI Studio.";
    }
    if (locale === "ar") return "تم تجاوز حصة Gemini. انتظر دقيقة ثم أعد المحاولة.";
    return "Gemini quota exceeded. Wait a minute and try again, or check your plan on Google AI Studio.";
  }

  if (locale === "fr") return "Erreur Gemini. Réessayez dans quelques instants.";
  if (locale === "ar") return "خطأ في Gemini. أعد المحاولة بعد قليل.";
  return "Gemini error. Please try again in a moment.";
}

function getModel(
  modelName: string,
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

function resolveModels(preferred?: string): string[] {
  if (preferred) {
    return [preferred, ...MODEL_CHAIN.filter((model) => model !== preferred)];
  }
  return MODEL_CHAIN;
}

async function withModelFallback<T>(
  preferredModel: string | undefined,
  run: (model: string) => Promise<T>
): Promise<T> {
  const models = resolveModels(preferredModel);
  let lastError: unknown;

  for (const model of models) {
    try {
      return await run(model);
    } catch (err) {
      lastError = err;
      if (!isQuotaError(err)) throw err;
    }
  }

  throw lastError ?? new Error("Gemini request failed");
}

export async function generateText(options: {
  model?: string;
  system?: string;
  prompt: string;
  maxOutputTokens?: number;
}): Promise<string> {
  return withModelFallback(options.model, async (modelName) => {
    const model = getModel(modelName, {
      systemInstruction: options.system,
      generationConfig: {
        maxOutputTokens: options.maxOutputTokens ?? 1024,
      },
    });

    const result = await model.generateContent(options.prompt);
    return result.response.text();
  });
}

export async function generateChatReply(options: {
  model?: string;
  system?: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  message: string;
  maxOutputTokens?: number;
}): Promise<string> {
  return withModelFallback(options.model, async (modelName) => {
    const model = getModel(modelName, {
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
  });
}

export async function* streamText(options: {
  model?: string;
  prompt: string;
  maxOutputTokens?: number;
}): AsyncGenerator<string> {
  let lastError: unknown;

  for (const modelName of resolveModels(options.model)) {
    try {
      const model = getModel(modelName, {
        generationConfig: {
          maxOutputTokens: options.maxOutputTokens ?? 1500,
        },
      });

      const result = await model.generateContentStream(options.prompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
      }
      return;
    } catch (err) {
      lastError = err;
      if (!isQuotaError(err)) throw err;
    }
  }

  throw lastError ?? new Error("Gemini stream failed");
}

export async function generateStructuredJson<T>(options: {
  model?: string;
  prompt: string;
  schema: Schema;
  maxOutputTokens?: number;
}): Promise<T> {
  return withModelFallback(options.model, async (modelName) => {
    const model = getModel(modelName, {
      generationConfig: {
        maxOutputTokens: options.maxOutputTokens ?? 512,
        responseMimeType: "application/json",
        responseSchema: options.schema,
      },
    });

    const result = await model.generateContent(options.prompt);
    const text = result.response.text();
    return JSON.parse(text) as T;
  });
}

export { SchemaType };
