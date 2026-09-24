import type { MailRepository } from "../repositories/mail.repository";
import type { UserRepository } from "../repositories/user.repository";
import type { CheckQuery, CheckResponse } from "../schemas/check.schema";
import { Agent } from "./agent";

export class CheckService {
  constructor(
    private readonly mailRepository: MailRepository,
    private readonly userRepository: UserRepository,
    private readonly maxHistory: number,
  ) {}

  async check(userId: string, query: CheckQuery): Promise<CheckResponse> {
    const { message, promptTokens, completionTokens, cost } = await this.generateMessage(query);

    await this.mailRepository.create({
      userId,
      mailInput: query.mail_input,
      mailOutput: message,
      promptTokens,
      completionTokens,
      cost,
    });
    await this.mailRepository.trimHistory(userId, this.maxHistory);

    const user = await this.userRepository.decrementBalance(userId, cost);
    const mails = await this.mailRepository.findByUserId(userId, this.maxHistory);

    return {
      message,
      balance: user.balance,
      mails: mails.map((mail) => ({
        id: mail.id,
        mailInput: mail.mailInput,
        mailOutput: mail.mailOutput,
        cost: mail.cost,
        createdAt: mail.createdAt.toISOString(),
      })),
    };
  }

  // Static/sample greeting in test env; replace with real AI-based mail check logic otherwise.
  private async generateMessage(
    query: CheckQuery,
  ): Promise<{ message: string; promptTokens: number; completionTokens: number; cost: number }> {
    if (process.env.NODE_ENV === "test") {
      return {
        message: "No response - no LLM call in test environment",
        promptTokens: 0,
        completionTokens: 0,
        cost: 0,
      };
    }

    const agent = new Agent();
    const result = await agent.check_mail(query.style, query.mail_input);

    const firstChoice = result.choices?.[0];
    return {
      message: firstChoice ? firstChoice.message.content : "No response from agent",
      promptTokens: result.usage?.prompt_tokens ?? 0,
      completionTokens: result.usage?.completion_tokens ?? 0,
      cost: result.usage?.cost ?? 0,
    };
  }
}
