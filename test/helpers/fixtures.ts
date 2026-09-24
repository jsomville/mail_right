import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";
import type { User } from "@prisma/client";

export const TEST_USER = {
  email: "test.user@mail-right.com",
  password: "Sup3rSecret!",
  firstname: "Test",
  lastname: "User",
};

export async function createTestUser(app: FastifyInstance): Promise<User> {
  // Low bcrypt cost factor keeps the test suite fast; production seed uses a higher cost.
  const passwordHash = await bcrypt.hash(TEST_USER.password, 4);

  return app.prisma.user.create({
    data: {
      email: TEST_USER.email,
      passwordHash,
      firstname: TEST_USER.firstname,
      lastname: TEST_USER.lastname,
      balance: 50,
    },
  });
}

export const TEST_ADMIN = {
  email: "test.admin@mail-right.com",
  password: "Sup3rSecret!",
  firstname: "Test",
  lastname: "Admin",
};

export async function createTestAdmin(app: FastifyInstance): Promise<User> {
  const passwordHash = await bcrypt.hash(TEST_ADMIN.password, 4);

  return app.prisma.user.create({
    data: {
      email: TEST_ADMIN.email,
      passwordHash,
      firstname: TEST_ADMIN.firstname,
      lastname: TEST_ADMIN.lastname,
      balance: 0,
      role: "ADMIN",
    },
  });
}
