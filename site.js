/* ===============================
   Café Carlópolis — site.js
   =============================== */

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initButtons();
  initCart();
  initLogin();
});

function initNavigation() {
  document.querySelectorAll("[data-link]").forEach(el => {
    el.addEventListener("click", () => {
      const page = el.dataset.link;
      if (page) window.location.href = page;
    });
  });
}

function initButtons() {
  document.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      const value = btn.dataset.value;

      switch (action) {
        case "add-cart":
          addToCart(value);
          break;
        case "go":
          window.location.href = value;
          break;
      }
    });
  });
}

function initCart() {
  updateCartCount();
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function addToCart(product) {
  const cart = getCart();
  cart.push({ name: product, qty: 1 });
  saveCart(cart);
  alert("☕ Produto adicionado ao carrinho!");
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  location.reload();
}

function updateCartCount() {
  const count = getCart().length;
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = count;
  });
}

function initLogin() {
  const user = localStorage.getItem("user");
  if (user) document.body.classList.add("logged");

  document.querySelectorAll("[data-login]").forEach(btn => {
    btn.addEventListener("click", () => {
      localStorage.setItem("user", "cliente");
      alert("Login realizado!");
      location.href = "minha-conta.html";
    });
  });

  document.querySelectorAll("[data-logout]").forEach(btn => {
    btn.addEventListener("click", () => {
      localStorage.removeItem("user");
      alert("Logout realizado!");
      location.href = "index.html";
    });
  });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href"))
      ?.scrollIntoView({ behavior: "smooth" });
  });
});
