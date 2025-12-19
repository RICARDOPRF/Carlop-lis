(function(){
  function normalize(href){
    try{
      const u = new URL(href, window.location.href);
      return (u.pathname.split('/').pop() || 'index.html') + (u.hash || '');
    }catch(e){
      return href || '';
    }
  }

  // Active nav highlight
  const currentFile = (window.location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('a[data-nav]').forEach(a=>{
    const h = normalize(a.getAttribute('href'));
    const file = h.split('#')[0] || 'index.html';
    if(file === currentFile){
      a.classList.add('text-primary');
    }
  });

  // Cart badge (localStorage)
  const CART_KEY = "carlopolis_cart_v1";
  function cartCount(){
    try{
      const items = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return items.reduce((s,it)=> s + (Number(it.qty)||1), 0);
    }catch(e){ return 0; }
  }
  function updateBadge(){
    const n = cartCount();
    document.querySelectorAll('[data-cart-count]').forEach(el=>{
      el.textContent = String(n);
      el.classList.toggle('hidden', n<=0);
    });
  }
  updateBadge();
  window.addEventListener('storage', updateBadge);

  // Mobile menu toggle
  const toggleBtn = document.querySelector('[data-mobile-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if(toggleBtn && menu){
    toggleBtn.addEventListener('click', ()=>{
      menu.classList.toggle('hidden');
    });
  }

  // Smooth scroll for hash links to index sections (when already on index)
  document.querySelectorAll('a[href*="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href') || '';
      const parts = href.split('#');
      if(parts.length < 2) return;
      const file = parts[0];
      const hash = '#'+parts[1];
      const onIndex = (currentFile === 'index.html' || currentFile === '');
      if(onIndex && (file === '' || file === 'index.html')){
        const el = document.querySelector(hash);
        if(el){
          e.preventDefault();
          el.scrollIntoView({behavior:'smooth', block:'start'});
          history.replaceState(null,'',hash);
        }
      }
    }, {passive:false});
  });

})();
