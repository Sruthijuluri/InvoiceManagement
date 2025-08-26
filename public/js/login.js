document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:3000/users");
    const users = await res.json();

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      window.location.href = user.role === "manager" ? "manager_dashboard.html" : "employee_dashboard.html";
    } else {
      alert("Invalid email or password");
    }
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});
