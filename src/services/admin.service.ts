import type { MailRepository } from "../repositories/mail.repository";
import type { AdminHistoryResponse } from "../schemas/admin.schema";

export class AdminService {
  constructor(private readonly mailRepository: MailRepository) {}

  async getMailHistory(): Promise<AdminHistoryResponse> {
    const mails = await this.mailRepository.findAll();

    return {
      mails: mails.map((mail) => ({
        id: mail.id,
        mailInput: mail.mailInput,
        mailOutput: mail.mailOutput,
        promptTokens: mail.promptTokens,
        completionTokens: mail.completionTokens,
        cost: mail.cost,
        createdAt: mail.createdAt.toISOString(),
        user: {
          id: mail.user.id,
          email: mail.user.email,
          firstname: mail.user.firstname,
          lastname: mail.user.lastname,
        },
      })),
    };
  }
}
