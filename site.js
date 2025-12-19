(() => {
  const fmt = (v) => (new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0));
  const CART_KEY = 'cc_cart_v1';
  const LAST_ORDER_KEY = 'cc_last_order_v1';
  const USER_KEY = 'cc_user_v1';

  const safeParse = (s, fallback) => {
    try { return JSON.parse(s); } catch { return fallback; }
  };

  const cart = {
    get() { return safeParse(localStorage.getItem(CART_KEY) || '[]', []); },
    set(items) { localStorage.setItem(CART_KEY, JSON.stringify(items || [])); ui.syncBadges(); },
    clear() { this.set([]); },
    add(item) {
      const items = this.get();
      const key = `${item.id}__${item.variant||''}`;
      const idx = items.findIndex(x => `${x.id}__${x.variant||''}` === key);
      if (idx >= 0) items[idx].qty = (items[idx].qty || 1) + (item.qty || 1);
      else items.push({ ...item, qty: item.qty || 1 });
      this.set(items);
      ui.toast('Adicionado ao carrinho ✅');
    },
    updateQty(index, qty) {
      const items = this.get();
      if (!items[index]) return;
      items[index].qty = Math.max(1, parseInt(qty || 1, 10));
      this.set(items);
    },
    remove(index) {
      const items = this.get();
      items.splice(index, 1);
      this.set(items);
    },
    totals() {
      const items = this.get();
      const sub = items.reduce((a, x) => a + (x.price || 0) * (x.qty || 1), 0);
      const ship = items.length ? 15 : 0;
      const disc = 0;
      const total = sub + ship - disc;
      return { sub, ship, disc, total };
    }
  };

  const user = {
    get() { return safeParse(localStorage.getItem(USER_KEY) || 'null', null); },
    set(u) { localStorage.setItem(USER_KEY, JSON.stringify(u || null)); },
    clear() { localStorage.removeItem(USER_KEY); }
  };

  const orders = {
    getLast() { return safeParse(localStorage.getItem(LAST_ORDER_KEY) || 'null', null); },
    setLast(o) { localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(o || null)); },
    clearLast() { localStorage.removeItem(LAST_ORDER_KEY); }
  };

  const ui = {
    syncBadges() {
      const count = cart.get().reduce((a, x) => a + (x.qty || 1), 0);
      document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = String(count));
    },
    toast(msg) {
      let t = document.getElementById('ccToast');
      if (!t) {
        t = document.createElement('div');
        t.id = 'ccToast';
        t.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] px-4 py-3 rounded-lg bg-[#150f09] border border-[#483623] text-white text-sm font-black shadow-xl opacity-0 pointer-events-none transition-opacity';
        document.body.appendChild(t);
      }
      t.textContent = msg;
      t.style.opacity = '1';
      clearTimeout(window.__ccToastTimer);
      window.__ccToastTimer = setTimeout(() => { t.style.opacity = '0'; }, 1600);
    },
    wireMobileMenu() {
      const btn = document.getElementById('ccMobileBtn');
      const menu = document.getElementById('ccMobileMenu');
      if (!btn || !menu) return;
      btn.addEventListener('click', () => menu.classList.toggle('hidden'));
    }
  };

  const pages = {
    cart: {
      render() {
        const wrap = document.getElementById('ccCartList');
        if (!wrap) return;
        const items = cart.get();
        if (!items.length) {
          wrap.innerHTML = `
            <div class="p-6 text-center">
              <p class="text-lg font-black">Seu carrinho está vazio.</p>
              <p class="text-[#c9ad92] mt-2">Escolha um café e comece agora ☕</p>
              <a href="produto-gourmet/" class="mt-5 inline-flex h-11 px-6 rounded-lg bg-[#d47311] text-white font-black items-center justify-center hover:bg-orange-600 transition-colors">Ver produtos</a>
            </div>`;
          document.getElementById('ccCartTotal')?.textContent = fmt(0);
          document.getElementById('ccShip')?.textContent = fmt(0);
          return;
        }

        wrap.innerHTML = items.map((x, i) => `
          <div class="p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div class="w-20 h-20 rounded-xl overflow-hidden border border-[#483623] bg-[#221910] shrink-0 bg-cover bg-center" style="background-image:url('${x.image||''}')"></div>
            <div class="flex-1">
              <p class="font-black">${x.name||'Produto'}</p>
              <p class="text-[#c9ad92] text-sm mt-1">${x.variant||''}</p>
              <p class="text-white font-black mt-2">${fmt((x.price||0))}</p>
            </div>
            <div class="flex items-center gap-2">
              <button data-dec="${i}" class="w-10 h-10 rounded-lg bg-[#221910] border border-[#483623] hover:bg-[#483623] transition-colors">−</button>
              <input data-qty="${i}" value="${x.qty||1}" class="w-16 h-10 text-center rounded-lg bg-[#221910] border border-[#483623] text-white font-black"/>
              <button data-inc="${i}" class="w-10 h-10 rounded-lg bg-[#221910] border border-[#483623] hover:bg-[#483623] transition-colors">+</button>
              <button data-rm="${i}" class="ml-2 w-10 h-10 rounded-lg bg-[#221910] border border-[#483623] hover:border-red-400 hover:text-red-300 transition-colors" title="Remover">✕</button>
            </div>
          </div>
        `).join('');

        const { sub, ship, total } = cart.totals();
        document.getElementById('ccShip')?.textContent = fmt(ship);
        document.getElementById('ccCartTotal')?.textContent = fmt(total);

        wrap.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => {
          const i = parseInt(b.getAttribute('data-inc'), 10);
          cart.updateQty(i, (cart.get()[i].qty || 1) + 1);
          pages.cart.render();
        }));
        wrap.querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => {
          const i = parseInt(b.getAttribute('data-dec'), 10);
          cart.updateQty(i, (cart.get()[i].qty || 1) - 1);
          pages.cart.render();
        }));
        wrap.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => {
          const i = parseInt(b.getAttribute('data-rm'), 10);
          cart.remove(i);
          pages.cart.render();
        }));
        wrap.querySelectorAll('[data-qty]').forEach(inp => inp.addEventListener('change', () => {
          const i = parseInt(inp.getAttribute('data-qty'), 10);
          cart.updateQty(i, inp.value);
          pages.cart.render();
        }));

        document.getElementById('ccClearCart')?.addEventListener('click', () => {
          cart.clear();
          pages.cart.render();
        });
      }
    },

    checkout: {
      init() {
        const list = document.getElementById('ccCheckoutItems');
        const form = document.getElementById('ccCheckoutForm');
        if (!list || !form) return;

        const items = cart.get();
        if (!items.length) { location.href = 'carrinho/'; return; }

        const { sub, ship, disc, total } = cart.totals();

        list.innerHTML = items.map(x => `
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-lg border border-[#483623] bg-cover bg-center" style="background-image:url('${x.image||''}')"></div>
              <div class="min-w-0">
                <p class="text-sm font-black truncate">${x.name}</p>
                <p class="text-xs text-[#c9ad92] truncate">${x.variant} • Qtd ${x.qty}</p>
              </div>
            </div>
            <p class="text-sm font-black">${fmt((x.price||0)*(x.qty||1))}</p>
          </div>
        `).join('');

        document.getElementById('ccSub')?.textContent = fmt(sub);
        document.getElementById('ccFrete')?.textContent = fmt(ship);
        document.getElementById('ccDesc')?.textContent = fmt(disc);
        document.getElementById('ccTotal')?.textContent = fmt(total);

        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const fd = new FormData(form);

          const cardRaw = (fd.get('card') || '').toString().replace(/\D/g,'');
          const last4 = cardRaw.slice(-4) || '0000';

          const orderNumber = '#'+Math.floor(10000 + Math.random()*89999);
          const now = new Date();
          const eta = new Date(now.getTime() + 4*24*60*60*1000);

          const order = {
            number: orderNumber,
            createdAt: now.toISOString(),
            eta: eta.toISOString(),
            customer: { name: fd.get('name'), email: fd.get('email') },
            address: { name: fd.get('name'), line: fd.get('address'), city: `${fd.get('city')} - ${fd.get('uf')}`, cep: fd.get('cep') },
            shipping: fd.get('shipping'),
            payment: { last4 },
            items,
            totals: { sub, ship, disc, total }
          };

          // save user too
          user.set({ name: fd.get('name'), email: fd.get('email') });

          orders.setLast(order);
          cart.clear();
          location.href = 'confirmacao/';
        });
      }
    },

    confirm: {
      render() {
        const order = orders.getLast();
        if (!order) { location.href = './'; return; }

        const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v ?? ''; };
        setText('ccCustomerName', order.customer?.name || 'Cliente');
        setText('ccCustomerEmail', order.customer?.email || '—');
        setText('ccOrderNumber', order.number || '#00000');
        setText('ccAddrName', order.address?.name || '—');
        setText('ccAddrLine', `${order.address?.line || '—'} • CEP ${order.address?.cep || '—'}`);
        setText('ccAddrCity', order.address?.city || '—');
        setText('ccShipMethod', order.shipping || '—');
        setText('ccCardLast4', order.payment?.last4 || '0000');

        const eta = order.eta ? new Date(order.eta) : new Date();
        setText('ccEta', eta.toLocaleDateString('pt-BR'));

        const itemsWrap = document.getElementById('ccConfirmItems');
        if (itemsWrap) {
          itemsWrap.innerHTML = (order.items||[]).map(x => `
            <div class="flex items-start gap-3">
              <div class="w-14 h-14 rounded-xl border border-[#483623] bg-cover bg-center shrink-0" style="background-image:url('${x.image||''}')"></div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-black truncate">${x.name}</p>
                <p class="text-xs text-[#c9ad92] truncate">${x.variant}</p>
                <div class="mt-1 flex justify-between text-xs text-[#c9ad92]">
                  <span>Qtd: ${x.qty}</span>
                  <span class="text-white font-black">${fmt((x.price||0)*(x.qty||1))}</span>
                </div>
              </div>
            </div>
          `).join('');
        }

        setText('ccCSub', fmt(order.totals?.sub || 0));
        setText('ccCShip', fmt(order.totals?.ship || 0));
        setText('ccCDesc', fmt(order.totals?.disc || 0));
        setText('ccCTotal', fmt(order.totals?.total || 0));

        document.getElementById('ccPrint')?.addEventListener('click', () => window.print());
      }
    },

    account: {
      render() {
        const u = user.get() || { name: 'Cliente', email: '—' };
        document.getElementById('ccUserName') && (document.getElementById('ccUserName').textContent = (u.name||'Cliente').toString().split(' ')[0]);
        document.getElementById('ccUserName2') && (document.getElementById('ccUserName2').textContent = u.name || '—');
        document.getElementById('ccUserEmail') && (document.getElementById('ccUserEmail').textContent = u.email || '—');

        const last = orders.getLast();
        document.getElementById('ccLastAddr') && (document.getElementById('ccLastAddr').textContent = last ? `${last.address?.line || ''} • ${last.address?.city || ''}` : '—');

        const wrap = document.getElementById('ccOrders');
        if (wrap) {
          if (!last) {
            wrap.innerHTML = `
              <div class="rounded-xl border border-[#483623] bg-[#221910] p-5">
                <p class="text-lg font-black">Nenhum pedido ainda.</p>
                <p class="text-[#c9ad92] mt-2">Quando você finalizar um checkout, ele aparece aqui.</p>
                <a href="produto-gourmet/" class="mt-4 inline-flex h-11 px-6 rounded-lg bg-[#d47311] text-white font-black items-center justify-center hover:bg-orange-600 transition-colors">Comprar agora</a>
              </div>`;
          } else {
            const d = new Date(last.createdAt || Date.now());
            wrap.innerHTML = `
              <div class="rounded-xl border border-[#483623] bg-[#221910] p-5">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-xs text-[#c9ad92] font-black uppercase tracking-wider">${last.number}</p>
                    <p class="text-sm text-[#c9ad92] mt-1">Realizado em ${d.toLocaleDateString('pt-BR')}</p>
                    <p class="text-white font-black mt-3">${(last.items||[]).length} item(ns)</p>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-[#c9ad92]">Total</p>
                    <p class="text-xl font-black text-primary">${fmt(last.totals?.total || 0)}</p>
                    <a href="confirmacao/" class="mt-3 inline-flex h-10 px-4 rounded-lg bg-[#332619] border border-[#483623] text-white font-black items-center justify-center hover:bg-[#483623] transition-colors">Ver detalhes</a>
                  </div>
                </div>
              </div>
            `;
          }
        }

        document.getElementById('ccLogout')?.addEventListener('click', () => {
          user.clear();
          location.href = './';
        });
      }
    }
  };

  // expose
  window.CC = { cart, user, orders, ui, pages };

  document.addEventListener('DOMContentLoaded', () => {
    ui.syncBadges();
    ui.wireMobileMenu();
  });
})();