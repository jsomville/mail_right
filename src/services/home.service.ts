import { NotFoundError } from "../errors/app-error";
import type { MailRepository } from "../repositories/mail.repository";
import type { UserRepository } from "../repositories/user.repository";
import type { HomeResponse } from "../schemas/home.schema";

export class HomeService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailRepository: MailRepository,
  ) {}

  async getHomeData(userId: string): Promise<HomeResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const mails = await this.mailRepository.findByUserId(userId);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        balance: user.balance,
      },
      mails: mails.map((mail) => ({
        id: mail.id,
        mailInput: mail.mailInput,
        mailOutput: mail.mailOutput,
        cost: mail.cost,
        createdAt: mail.createdAt.toISOString(),
      })),
    };
  }
}
