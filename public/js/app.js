(function () {
  const newMailBtn = document.getElementById("new-mail-btn");
  const mailInput = document.getElementById("mail-input");
  const mailOutput = document.getElementById("mail-output");
  const checkBtn = document.getElementById("check-btn");
  const checkMessage = document.getElementById("check-message");
  const copyBtn = document.getElementById("copy-btn");
  const themeBtn = document.getElementById("theme-btn");
  const tabs = {
    original: { tab: document.getElementById("tab-original"), panel: document.getElementById("panel-original"), textarea: mailInput },
    checked: { tab: document.getElementById("tab-checked"), panel: document.getElementById("panel-checked"), textarea: mailOutput },
  };
  let activeTab = "original";

  function selectTab(name, focus) {
    activeTab = name;
    Object.keys(tabs).forEach((key) => {
      const selected = key === name;
      tabs[key].tab.setAttribute("aria-selected", String(selected));
      tabs[key].tab.tabIndex = selected ? 0 : -1;
      tabs[key].panel.hidden = !selected;
    });
    if (focus) {
      tabs[name].tab.focus();
    }
  }

  function onTabKeydown(event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      selectTab(activeTab === "original" ? "checked" : "original", true);
    }
  }

  function toggleTheme() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (err) {
      // Storage unavailable (private mode); the theme still applies for this visit.
    }
  }

  async function checkMail() {
    checkMessage.textContent = "";
    const value = mailInput.value.trim();

    if (!value) {
      checkMessage.textContent = "Please enter a mail to check.";
      return;
    }

    checkBtn.disabled = true;
    checkMessage.textContent = "Checking...";

    try {
      const params = new URLSearchParams({ mail_input: value, style: "professional" });
      const response = await fetch("/api/check?" + params.toString());
      const data = await response.json();

      if (!response.ok) {
        checkMessage.textContent = (data && data.error && data.error.message) || "Check failed.";
        return;
      }

      mailOutput.value = data.message;
      selectTab("checked");
      checkMessage.textContent = "Check complete.";
    } catch (err) {
      checkMessage.textContent = "Unable to reach the server. Please try again.";
    } finally {
      checkBtn.disabled = false;
    }
  }

  function newMail() {
    mailInput.value = "";
    mailOutput.value = "";
    checkMessage.textContent = "";
    selectTab("original");
    mailInput.focus();
  }

  // Copies the mail shown in the active tab.
  async function copyActive() {
    const text = tabs[activeTab].textarea.value;
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      checkMessage.textContent = "Copied to clipboard.";
    } catch (err) {
      checkMessage.textContent = "Unable to copy to clipboard.";
    }
  }

  checkBtn.addEventListener("click", checkMail);
  newMailBtn.addEventListener("click", newMail);
  copyBtn.addEventListener("click", copyActive);
  Object.keys(tabs).forEach((key) => {
    tabs[key].tab.addEventListener("click", () => selectTab(key));
    tabs[key].tab.addEventListener("keydown", onTabKeydown);
  });
  themeBtn.addEventListener("click", toggleTheme);
})();
