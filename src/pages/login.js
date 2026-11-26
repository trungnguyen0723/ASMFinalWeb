import { mountNavbar } from "../components/navbar.js";
import { getCurrentUser, loginUser } from "../state/store.js";
import { showToast } from "../utils/dom.js";

mountNavbar({ activePage: "login" });

if (getCurrentUser()) {
  window.location.replace("profile.html");
}

const form = document.getElementById("login-form");
const emailInput = document.getElementById("l-email");
const pwInput = document.getElementById("l-password");
const msgEl = document.getElementById("login-msg");
const demoBtn = document.getElementById("demo-fill");

document.querySelectorAll(".pw-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.toggle);
    if (!input) return;
    const next = input.type === "password" ? "text" : "password";
    input.type = next;
    btn.textContent = next === "password" ? "Show" : "Hide";
  });
});

demoBtn?.addEventListener("click", () => {
  emailInput.value = "demo@phoneroom.store";
  pwInput.value = "phone2026";
  showToast("Demo credentials filled");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  msgEl.className = "form-msg";
  msgEl.textContent = "";

  const res = loginUser({
    email: emailInput.value,
    password: pwInput.value
  });

  if (!res.ok) {
    msgEl.className = "form-msg error";
    msgEl.textContent = res.error;
    return;
  }

  showToast(`Welcome back, ${res.user.name}`);
  setTimeout(() => {
    window.location.href = "profile.html";
  }, 350);
});
