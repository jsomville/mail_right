(function () {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/index.html";
    return;
  }

  const logoutBtn = document.getElementById("logout-btn");
  const backBtn = document.getElementById("back-btn");
  const adminMessage = document.getElementById("admin-message");
  const adminSummary = document.getElementById("admin-summary");
  const tableBody = document.getElementById("admin-table-body");

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/index.html";
  }

  function renderRows(mails) {
    tableBody.innerHTML = "";
    let totalCost = 0;

    mails.forEach((mail) => {
      totalCost += mail.cost;

      const tr = document.createElement("tr");

      const dateCell = document.createElement("td");
      dateCell.textContent = new Date(mail.createdAt).toLocaleString();

      const userCell = document.createElement("td");
      userCell.textContent = mail.user.firstname + " " + mail.user.lastname + " (" + mail.user.email + ")";

      const promptTokensCell = document.createElement("td");
      promptTokensCell.textContent = mail.promptTokens;

      const completionTokensCell = document.createElement("td");
      completionTokensCell.textContent = mail.completionTokens;

      const costCell = document.createElement("td");
      costCell.textContent = mail.cost.toFixed(4);

      tr.append(dateCell, userCell, promptTokensCell, completionTokensCell, costCell);
      tableBody.appendChild(tr);
    });

    adminSummary.textContent = "Total cost: " + totalCost.toFixed(4) + " across " + mails.length + " checks.";
  }

  async function loadHistory() {
    try {
      const response = await fetch("/api/admin/mails", {
        headers: { Authorization: "Bearer " + token },
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (response.status === 403) {
        window.location.href = "/home.html";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load mail history");
      }

      const data = await response.json();
      renderRows(data.mails);
    } catch (err) {
      adminMessage.textContent = "Unable to load mail history. Please try again.";
    }
  }

  logoutBtn.addEventListener("click", logout);
  backBtn.addEventListener("click", () => {
    window.location.href = "/home.html";
  });

  loadHistory();
})();
