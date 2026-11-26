import { mountNavbar } from "../components/navbar.js";
import { getContactMessages, getCurrentUser, saveContactMessage } from "../state/store.js";
import { escapeHtml, showToast } from "../utils/dom.js";

mountNavbar({ activePage: "contact" });

const form = document.getElementById("contact-form");
const msgEl = document.getElementById("contact-msg");
const nameInput = document.getElementById("c-name");
const emailInput = document.getElementById("c-email");
const topicSelect = document.getElementById("c-topic");
const messageInput = document.getElementById("c-message");
const recentRoot = document.getElementById("recent-inquiries");

const user = getCurrentUser();
if (user) {
  nameInput.value = user.name;
  emailInput.value = user.email;
}

function renderRecent() {
  const msgs = getContactMessages();
  if (!msgs.length) {
    recentRoot.innerHTML = "";
    return;
  }
  recentRoot.innerHTML = `
    <h3 class="sheet-title" style="font-size:17px;">Recent inquiries from this browser</h3>
    <div class="info-list">
      ${msgs.slice(0, 4).map((m) => `
        <div class="order-row">
          <div class="order-top">
            <span>${escapeHtml(m.topic)}</span>
            <span class="row-meta">${escapeHtml(m.createdAt.slice(0, 10))}</span>
          </div>
          <p class="order-items">${escapeHtml(m.message)}</p>
        </div>
      `).join("")}
    </div>
  `;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  msgEl.className = "form-msg";
  msgEl.textContent = "";

  const emailVal = emailInput.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
    msgEl.className = "form-msg error";
    msgEl.textContent = "Please enter a valid email address so we can reply.";
    return;
  }

  const res = saveContactMessage({
    name: nameInput.value,
    email: emailVal,
    topic: topicSelect.value,
    message: messageInput.value
  });

  if (!res.ok) {
    msgEl.className = "form-msg error";
    msgEl.textContent = res.error;
    return;
  }

  msgEl.className = "form-msg ok";
  msgEl.textContent = "Thank you — our hardware desk received your inquiry.";
  messageInput.value = "";
  renderRecent();
  showToast("Inquiry sent");
});

renderRecent();
