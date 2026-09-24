import type { CheckQuery, CheckResponse } from "../schemas/check.schema";
import { Agent } from "./agent";

export class CheckService {
  // Static/sample greeting; replace with real AI-based mail check logic later.
  async check(_query: CheckQuery): Promise<CheckResponse> {
    const NODE_ENV = process.env.NODE_ENV;

    if (NODE_ENV == "test") {
      return { message: "No response - no LLM call in test environment" };
    } else {
      const agent = new Agent();
      const result = await agent.check_mail(_query.style, _query.mail_input);

      //record cost
      const firstChoice = result.choices?.[0];
      if (firstChoice) {
        return { message: firstChoice.message.content };
      }
      return { message: "No response from agent" };
    }
  }
}
