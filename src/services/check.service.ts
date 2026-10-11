import type { CheckQuery, CheckResponse } from "../schemas/check.schema";
import { Agent } from "./agent";

export class CheckService {
  async check(query: CheckQuery): Promise<CheckResponse> {
    // Static message in test env so the suite never calls the LLM.
    if (process.env.NODE_ENV === "test") {
      return { message: "No response - no LLM call in test environment" };
    }

    const agent = new Agent();
    const result = await agent.check_mail(query.style, query.mail_input);

    const firstChoice = result.choices?.[0];
    return { message: firstChoice ? firstChoice.message.content : "No response from agent" };
  }
}
