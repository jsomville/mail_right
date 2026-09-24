import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";
import { UnauthorizedError } from "../errors/app-error";
import type { UserRepository } from "../repositories/user.repository";
import type { LoginBody, LoginResponse } from "../schemas/auth.schema";

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSign: FastifyInstance["jwt"]["sign"],
  ) {}

  async login({ email, password }: LoginBody): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = this.jwtSign({ sub: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        balance: user.balance,
      },
    };
  }
}
