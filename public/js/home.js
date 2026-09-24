(function () {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/index.html";
    return;
  }

  const logoutBtn = document.getElementById("logout-btn");
  const newMailBtn = document.getElementById("new-mail-btn");
  const mailList = document.getElementById("mail-list");
  const accountInitial = document.getElementById("account-initial");
  const accountName = document.getElementById("account-name");
  const accountBalance = document.getElementById("account-balance");
  const mailInput = document.getElementById("mail-input");
  const mailOutput = document.getElementById("mail-output");
  const checkBtn = document.getElementById("check-btn");
  const checkMessage = document.getElementById("check-message");
  const copyBtn = document.getElementById("copy-btn");

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/index.html";
  }

  function renderMailList(mails) {
    mailList.innerHTML = "";
    mails.forEach((mail) => {
      const li = document.createElement("li");
      const initial = (mail.mailInput || "?").trim().charAt(0).toUpperCase() || "?";
      li.innerHTML = '<span class="mail-avatar">' + initial + "</span><span>" + (mail.mailInput.length > 28
        ? mail.mailInput.slice(0, 28) + "..."
        : mail.mailInput) + "</span>";
      mailList.appendChild(li);
    });
  }

  async function loadHome() {
    try {
      const response = await fetch("/api/home", {
        headers: { Authorization: "Bearer " + token },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load home data");
      }

      const data = await response.json();

      accountName.textContent = data.user.firstname + " " + data.user.lastname;
      accountBalance.textContent = "Balance: " + data.user.balance.toFixed(2);
      accountInitial.textContent = (data.user.firstname || "?").charAt(0).toUpperCase();

      renderMailList(data.mails);
    } catch (err) {
      logout();
    }
  }

  async function checkMail() {
    checkMessage.textContent = "";
    const value = mailInput.value.trim();

    if (!value) {
      checkMessage.textContent = "Please enter a mail to check.";
      return;
    }

    try {
      const params = new URLSearchParams({ mail_input: value, style: "professional" });
      const response = await fetch("/api/check?" + params.toString(), {
        headers: { Authorization: "Bearer " + token },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        checkMessage.textContent = (data && data.error && data.error.message) || "Check failed.";
        return;
      }

      mailOutput.value = data.message;
      checkMessage.textContent = "Check complete.";
    } catch (err) {
      checkMessage.textContent = "Unable to reach the server. Please try again.";
    }
  }

  function newMail() {
    mailInput.value = "";
    mailOutput.value = "";
    checkMessage.textContent = "";
  }

  async function copyOutput() {
    if (!mailOutput.value) {
      return;
    }
    try {
      await navigator.clipboard.writeText(mailOutput.value);
      checkMessage.textContent = "Copied to clipboard.";
    } catch (err) {
      checkMessage.textContent = "Unable to copy to clipboard.";
    }
  }

  logoutBtn.addEventListener("click", logout);
  checkBtn.addEventListener("click", checkMail);
  newMailBtn.addEventListener("click", newMail);
  copyBtn.addEventListener("click", copyOutput);

  loadHome();
})();
