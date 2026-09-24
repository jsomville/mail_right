import { expect } from "chai";
import fs from "node:fs";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

describe("Sample UI logout behavior", () => {
  it("clears the stored token when the logout button is clicked", async () => {
    const homeJs = fs.readFileSync(path.join(__dirname, "../../public/js/home.js"), "utf-8");

    const virtualConsole = new VirtualConsole();
    // Swallow jsdom's "not implemented: navigation" noise triggered by window.location.href writes.
    virtualConsole.on("jsdomError", () => undefined);

    const dom = new JSDOM(
      `<!DOCTYPE html><html><body>
        <button id="logout-btn"></button>
        <button id="new-mail-btn"></button>
        <ul id="mail-list"></ul>
        <div id="account-initial"></div>
        <div id="account-name"></div>
        <div id="account-balance"></div>
        <textarea id="mail-input"></textarea>
        <textarea id="mail-output"></textarea>
        <button id="check-btn"></button>
        <div id="check-message"></div>
      </body></html>`,
      { url: "http://localhost/home.html", runScripts: "dangerously", virtualConsole },
    );

    dom.window.localStorage.setItem("token", "sample-jwt-token");
    dom.window.fetch = (() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            user: { id: "1", email: "a@b.com", firstname: "A", lastname: "B", balance: 0 },
            mails: [],
          }),
      })) as unknown as typeof fetch;

    const scriptEl = dom.window.document.createElement("script");
    scriptEl.textContent = homeJs;
    dom.window.document.body.appendChild(scriptEl);

    // Let the async loadHome() call settle before asserting.
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(dom.window.localStorage.getItem("token")).to.equal("sample-jwt-token");

    const logoutBtn = dom.window.document.getElementById("logout-btn") as HTMLButtonElement;
    logoutBtn.click();

    expect(dom.window.localStorage.getItem("token")).to.be.null;

    dom.window.close();
  });
});
