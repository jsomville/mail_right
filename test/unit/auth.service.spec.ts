import { expect } from "chai";
import bcrypt from "bcrypt";
import sinon from "sinon";
import { AuthService } from "../../src/services/auth.service";
import { UnauthorizedError } from "../../src/errors/app-error";
import type { UserRepository } from "../../src/repositories/user.repository";
import type { User } from "@prisma/client";

function buildStoredUser(passwordHash: string): User {
  return {
    id: "user-1",
    email: "a@b.com",
    passwordHash,
    firstname: "A",
    lastname: "B",
    balance: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("AuthService", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("returns a signed token and a safe user payload on valid credentials", async () => {
    const passwordHash = await bcrypt.hash("secret123", 4);
    const userRepository = {
      findByEmail: sinon.stub().resolves(buildStoredUser(passwordHash)),
    } as unknown as UserRepository;
    const jwtSign = sinon.stub().returns("signed-token");

    const service = new AuthService(userRepository, jwtSign);
    const result = await service.login({ email: "a@b.com", password: "secret123" });

    expect(result.token).to.equal("signed-token");
    expect(result.user.email).to.equal("a@b.com");
    expect(result.user).to.not.have.property("passwordHash");
  });

  it("throws UnauthorizedError when the user does not exist", async () => {
    const userRepository = {
      findByEmail: sinon.stub().resolves(null),
    } as unknown as UserRepository;
    const jwtSign = sinon.stub();
    const service = new AuthService(userRepository, jwtSign);

    try {
      await service.login({ email: "missing@b.com", password: "x" });
      expect.fail("expected login to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(UnauthorizedError);
    }
  });

  it("throws UnauthorizedError when the password does not match", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 4);
    const userRepository = {
      findByEmail: sinon.stub().resolves(buildStoredUser(passwordHash)),
    } as unknown as UserRepository;
    const jwtSign = sinon.stub();
    const service = new AuthService(userRepository, jwtSign);

    try {
      await service.login({ email: "a@b.com", password: "wrong-password" });
      expect.fail("expected login to throw");
    } catch (error) {
      expect(error).to.be.instanceOf(UnauthorizedError);
    }
  });
});
