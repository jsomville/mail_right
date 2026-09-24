import "dotenv/config";
import { readFile } from "fs/promises";
import { resolve } from "node:path";

type ChatCompletionResponse = {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost?: number;
  };
};

export class Agent {
  async request(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `Request failed with ${response.status} ${response.statusText}`,
      );
    }

    return response;
  }

  async chat(model: string, message: string): Promise<ChatCompletionResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const response = await this.request(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: message }],
        }),
      },
    );

    return (await response.json()) as ChatCompletionResponse;
  }
  async check_mail(
    style: string,
    context: string,
  ): Promise<ChatCompletionResponse> {
    const model = process.env.MODEL || "openai/gpt-5.6-luna";

    const filePath = resolve(__dirname, "prompt.md");
    const content = await readFile(filePath, "utf8");
    const prompt = content.replace("{content}", context);
    const prompt2 = prompt.replace("{style}", style);

    return this.chat(model, prompt2);
  }
}
