// Café Carlópolis — site.js (carrinho + contato centralizado)
// ✅ GitHub Pages-friendly (sem links começando com "/")

window.SITE_CONTACT = {
  "whatsappNumber": "5543997365965",
  "display": "(43) 99736-5965",
  "instagram": "https://www.instagram.com/cafecarlopolis",
  "facebook": "https://www.facebook.com/cafecarlopolis"
};

const CART_KEY = "cart";

const PRODUCTS = {
  gourmet: {
    id: "gourmet",
    name: "Café Gourmet 500g",
    subtitle: "Moído • 500g",
    price: 49.90,
    // troque para sua imagem real se quiser:
    image: "assets/cafe-gourmet.png"
  },
  premium: {
    id: "premium",
    name: "Café Premium 1kg",
    subtitle: "Em Grãos • 1kg",
    price: 85.00,
    image: "assets/cafe-premium.png"
  }
};

function money(v) {
  return (Number(v)||0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
}

function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(productId, qty=1) {
  const p = PRODUCTS[productId];
  if (!p) return;

  const cart = readCart();
  const idx = cart.findIndex(i => i.id === p.id);
  if (idx >= 0) cart[idx].qty += qty;
  else cart.push({ id: p.id, name: p.name, subtitle: p.subtitle, price: p.price, image: p.image, qty });
  writeCart(cart);
}

function removeFromCart(id) {
  const cart = readCart().filter(i => i.id !== id);
  writeCart(cart);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
}

function setQty(id, qty) {
  const cart = readCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, Number(qty)||1);
  writeCart(cart);
}

function cartSubtotal() {
  return readCart().reduce((s,i)=> s + (Number(i.price)||0)*(Number(i.qty)||1), 0);
}

function applySiteContact() {
  const c = window.SITE_CONTACT;
  if (!c) return;

  document.querySelectorAll('[data-contact="phone"]').forEach(el => {
    el.textContent = c.display;
    el.href = `tel:+${c.whatsappNumber}`;
  });

  document.querySelectorAll('[data-contact="whatsapp"]').forEach(el => {
    el.href = `https://wa.me/${c.whatsappNumber}`;
  });

  document.querySelectorAll('[data-contact="instagram"]').forEach(el => {
    el.href = c.instagram;
  });

  document.querySelectorAll('[data-contact="facebook"]').forEach(el => {
    el.href = c.facebook;
  });
}

window.buyNow = function(productId) {
  addToCart(productId, 1);
  window.location.href = "carrinho.html";
}

window.addAndStay = function(productId) {
  addToCart(productId, 1);
  toast("Adicionado ao carrinho ✅");
  updateMiniCart();
}

function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(()=> t.classList.add("show"));
  setTimeout(()=> {
    t.classList.remove("show");
    setTimeout(()=> t.remove(), 250);
  }, 1800);
}

function updateMiniCart() {
  const badge = document.querySelector("[data-cart-badge]");
  if (!badge) return;
  const count = readCart().reduce((s,i)=> s + (Number(i.qty)||0), 0);
  badge.textContent = count;
  badge.style.display = count > 0 ? "inline-flex" : "none";
}

function renderCartPage() {
  const list = document.querySelector("#cartList");
  if (!list) return;

  const cart = readCart();
  if (cart.length === 0) {
    list.innerHTML = `<div class="empty">Seu carrinho está vazio.</div>`;
    const sub = document.querySelector("#cartSubtotal");
    const total = document.querySelector("#cartTotal");
    if (sub) sub.textContent = money(0);
    if (total) total.textContent = money(0);
    updateMiniCart();
    return;
  }

  list.innerHTML = cart.map(item => {
    const line = (Number(item.price)||0)*(Number(item.qty)||1);
    return `
      <div class="row">
        <div class="prod">
          <div class="thumb" style="background-image:url('${item.image}')"></div>
          <div>
            <div class="name">${item.name}</div>
            <div class="sub">${item.subtitle||""}</div>
          </div>
        </div>

        <div class="price">${money(item.price)}</div>

        <div class="qty">
          <button type="button" class="qbtn" data-qty-minus="${item.id}">−</button>
          <span class="qval">${item.qty}</span>
          <button type="button" class="qbtn" data-qty-plus="${item.id}">+</button>
        </div>

        <div class="line">${money(line)}</div>

        <button type="button" class="trash" title="Excluir" data-remove="${item.id}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
  }).join("");

  const sub = cartSubtotal();
  const subEl = document.querySelector("#cartSubtotal");
  const totalEl = document.querySelector("#cartTotal");
  if (subEl) subEl.textContent = money(sub);
  if (totalEl) totalEl.textContent = money(sub);

  bindCartActions();
  updateMiniCart();
}

function bindCartActions() {
  document.querySelectorAll("[data-remove]").forEach(btn => {
    btn.onclick = () => {
      removeFromCart(btn.getAttribute("data-remove"));
      renderCartPage();
    };
  });

  const clearBtn = document.querySelector("[data-clear-cart]");
  if (clearBtn) clearBtn.onclick = () => {
    clearCart();
    renderCartPage();
  };

  document.querySelectorAll("[data-qty-minus]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-qty-minus");
      const cart = readCart();
      const item = cart.find(i => i.id === id);
      if (!item) return;
      setQty(id, Math.max(1, (Number(item.qty)||1) - 1));
      renderCartPage();
    };
  });

  document.querySelectorAll("[data-qty-plus]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-qty-plus");
      const cart = readCart();
      const item = cart.find(i => i.id === id);
      if (!item) return;
      setQty(id, (Number(item.qty)||1) + 1);
      renderCartPage();
    };
  });
}

function renderCheckoutSummary() {
  const sub = cartSubtotal();
  const subEl = document.querySelector("#sumSubtotal");
  const totalEl = document.querySelector("#sumTotal");
  if (subEl) subEl.textContent = money(sub);
  if (totalEl) totalEl.textContent = money(sub);
  updateMiniCart();
}

// Frete (placeholder): em site estático, integrações reais exigem proxy/back-end.
// Aqui mantemos UX funcional com link para calculadora externa.
window.calcFrete = function() {
  const cep = (document.querySelector("#cepDestino")?.value || "").replace(/\D/g,"");
  if (cep.length < 8) {
    toast("Digite um CEP válido (8 números)");
    return;
  }
  const hint = document.querySelector("#freteHint");
  if (hint) {
    hint.innerHTML = `Para calcular frete com precisão, use a calculadora (abre em nova aba): <a target="_blank" rel="noopener" href="https://www.superfrete.com/calculadora">SuperFrete</a>.`;
  }
  const freteEl = document.querySelector("#sumFrete");
  if (freteEl) freteEl.textContent = "A calcular";
}

document.addEventListener("DOMContentLoaded", () => {
  applySiteContact();
  updateMiniCart();
  renderCartPage();
  renderCheckoutSummary();
});