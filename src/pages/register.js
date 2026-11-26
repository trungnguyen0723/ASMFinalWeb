import { mountNavbar } from "../components/navbar.js";
import { getCurrentUser, registerUser } from "../state/store.js";
import { showToast } from "../utils/dom.js";

mountNavbar({ activePage: "register" });

if (getCurrentUser()) {
  window.location.replace("profile.html");
}

const form = document.getElementById("register-form");
const nameInput = document.getElementById("r-name");
const emailInput = document.getElementById("r-email");
const brandSelect = document.getElementById("r-brand");
const pwInput = document.getElementById("r-password");
const confirmInput = document.getElementById("r-confirm");
const msgEl = document.getElementById("register-msg");

document.querySelectorAll(".pw-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.toggle);
    if (!input) return;
    const next = input.type === "password" ? "text" : "password";
    input.type = next;
    btn.textContent = next === "password" ? "Show" : "Hide";
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  msgEl.className = "form-msg";
  msgEl.textContent = "";

  const email = emailInput.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msgEl.className = "form-msg error";
    msgEl.textContent = "Please enter a valid email address.";
    return;
  }
  if (pwInput.value.length < 6) {
    msgEl.className = "form-msg error";
    msgEl.textContent = "Password must be at least 6 characters long.";
    return;
  }
  if (pwInput.value !== confirmInput.value) {
    msgEl.className = "form-msg error";
    msgEl.textContent = "Passwords do not match.";
    return;
  }

  const res = registerUser({
    name: nameInput.value,
    email,
    password: pwInput.value,
    brandPref: brandSelect.value
  });

  if (!res.ok) {
    msgEl.className = "form-msg error";
    msgEl.textContent = res.error;
    return;
  }

  showToast("Account created");
  setTimeout(() => {
    window.location.href = "profile.html";
  }, 350);
});
