const USERNAME = "demouser";
const PASSWORD = "demo@password123";

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  if (username === USERNAME && password === PASSWORD) {
    localStorage.setItem("loggedIn", "true");
    window.location.href = "index.html";
  } else {
    document.getElementById("loginError").style.display = "block";
  }
});
