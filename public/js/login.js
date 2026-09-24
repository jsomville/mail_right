(function () {
  const form = document.getElementById("login-form");
  const errorEl = document.getElementById("form-error");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorEl.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        errorEl.textContent = (data && data.error && data.error.message) || "Login failed. Please try again.";
        return;
      }

      localStorage.setItem("token", data.token);
      window.location.href = "/home.html";
    } catch (err) {
      errorEl.textContent = "Unable to reach the server. Please try again.";
    }
  });
})();
