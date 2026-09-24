import type { PrismaClient, User } from "@prisma/client";

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async decrementBalance(userId: string, amount: number): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { balance: { decrement: amount } },
    });
  }
}
