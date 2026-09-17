/* ============================================================
   VIP CASCAVEL — Public Site
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ============================================================
     ACCESS GATE — verificação antes de entrar no site
     ============================================================ */
  const gate = document.getElementById('gateOverlay');
  const gateYes = document.getElementById('gateYes');
  const gateNo = document.getElementById('gateNo');

  if (gate && gateYes && gateNo) {
    const redirectAway = () => {
      window.location.replace('https://www.google.com');
    };

    const unlock = () => {
      gate.classList.add('closed');
      document.body.style.overflow = '';
    };

    try {
      if (sessionStorage.getItem('vipc_gate_declined') === '1') {
        redirectAway();
        return;
      }
    } catch (e) {}

    gateYes.addEventListener('click', unlock);

    gateNo.addEventListener('click', (e) => {
      e.preventDefault();
      try { sessionStorage.setItem('vipc_gate_declined', '1'); } catch (err) {}
      redirectAway();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !gate.classList.contains('closed')) {
        try { sessionStorage.setItem('vipc_gate_declined', '1'); } catch (err) {}
        redirectAway();
      }
    });
  }

  const settings = Store.getSettings();

  /* ---------- WhatsApp links ---------- */
  document.querySelectorAll('[data-whatsapp]').forEach(el => {
    el.href = `https://wa.me/${settings.whatsapp}`;
  });
  document.querySelectorAll('[data-whatsapp-text]').forEach(el => {
    el.href = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(el.dataset.whatsappText)}`;
  });

  document.querySelectorAll('[data-phone-display]').forEach(el => {
    el.textContent = settings.whatsappDisplay;
  });

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('mobileNav');
  const navBackdrop = document.getElementById('navBackdrop');

  if (burger && nav) {
    const closeMenu = () => {
      burger.classList.remove('open');
      nav.classList.remove('open');
      if (navBackdrop) navBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    };

    const openMenu = () => {
      burger.classList.add('open');
      nav.classList.add('open');
      if (navBackdrop) navBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    burger.addEventListener('click', () => {
      if (nav.classList.contains('open')) closeMenu();
      else openMenu();
    });

    if (navBackdrop) navBackdrop.addEventListener('click', closeMenu);

    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900 && nav.classList.contains('open')) closeMenu();
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  const header = document.getElementById('header');
  const onScroll = () => {
    if (header) {
      header.style.boxShadow = window.scrollY > 10 ? '0 8px 30px rgba(0,0,0,0.4)' : 'none';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ---------- Catalog ---------- */
  const catalogEl = document.getElementById('catalogGrid');
  const countEl = document.getElementById('catalogCount');

  function statusLabel(status) {
    return { available: 'Disponível', busy: 'Ocupada', unavailable: 'Indisponível' }[status] || 'Disponível';
  }

  function initials(name) {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  function renderCard(t) {
    const s = settings;
    const waNumber = t.whatsapp || s.whatsapp;
    const waMsg = `Olá! Vim pelo site da VIP Cascavel e gostaria de mais informações sobre a acompanhante *${t.stageName || t.name}*.`;

    const monogram = `<div class="avatar-monogram">${initials(t.name)}</div>`;
    const photos = Array.isArray(t.photos) ? t.photos : [];
    const cover = photos[0];
    const photoBadge = photos.length > 1
      ? `<span class="badge-photos">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
           ${photos.length}
         </span>`
      : '';

    return `
      <article class="card reveal" data-id="${t.id}" role="button" tabindex="0" aria-label="Ver detalhes de ${t.name}">
        <div class="card-media placeholder" style="background:${t.photoColor || '#1a1a1a'}">
          ${cover ? `<img src="${cover}" alt="${t.name}" loading="lazy" onerror="this.remove()">` : monogram}
          <span class="badge-status ${t.status}"><span class="dot"></span>${statusLabel(t.status)}</span>
          ${photoBadge}
        </div>
        <div class="card-body">
          <h3 class="card-name">${t.name}</h3>
          <div class="card-meta">
            <span title="Idade">${t.age} anos</span>
            <span title="Altura">${t.height || '—'}</span>
            <span title="Peso">${t.weight || '—'}</span>
          </div>
          <p class="card-bio">${t.bio || 'Sem descrição.'}</p>
          <div class="card-actions">
            <a class="btn-card whats" target="_blank" rel="noopener"
               href="https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Contratar
            </a>
            <button class="btn-card ghost-card btn-detail" type="button">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Detalhes
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function renderCatalog() {
    const list = Store.getTalents()
      .slice()
      .sort((a, b) => (a.order || 99) - (b.order || 99));

    countEl.textContent = `${list.length} acompanhante${list.length === 1 ? '' : 's'} no catálogo`;

    if (!list.length) {
      catalogEl.innerHTML = `
        <div class="card empty-state reveal">
          <p>Nenhuma acompanhante cadastrada.</p>
        </div>`;
      return;
    }

    catalogEl.innerHTML = list.map(t => renderCard(t)).join('');

    document.querySelectorAll('#catalogGrid .card').forEach(card => {
      const id = card.dataset.id;
      if (!id) return;
      card.addEventListener('click', (e) => {
        if (e.target.closest('.whats')) return;
        openDetailById(id);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDetailById(id);
        }
      });
    });

    revealObserverLoop();
  }

  function revealObserverLoop() {
    requestAnimationFrame(() => {
      document.querySelectorAll('#catalogGrid .reveal').forEach(el =>
        revealObserver.observe(el)
      );
    });
  }

  /* ---------- Talent detail modal ---------- */
  const modalTpl = document.getElementById('talentModal') || createDetailHolder();
  const closeBtn = modalTpl.querySelector('.modal-close-talent');
  const modalContent = modalTpl.querySelector('.modal-talent-content');

  function createDetailHolder() {
    const d = document.createElement('div');
    d.innerHTML = `
      <div class="modal-backdrop" id="talentModal">
        <div class="modal" style="max-width:560px">
          <div class="modal-head">
            <div class="modal-title">Perfil completo</div>
            <button class="modal-close modal-close-talent">&times;</button>
          </div>
          <div class="modal-body modal-talent-content"></div>
        </div>
      </div>
    `;
    document.body.appendChild(d.firstElementChild);
    return document.getElementById('talentModal');
  }

  let galleryApi = null;

  function openDetailById(id) {
    const talent = Store.getTalent(id);
    if (!talent) return;
    const s = Store.getSettings();
    const waNumber = talent.whatsapp || s.whatsapp;
    const waMsg = `Olá! Vim pelo site e gostaria de mais informações sobre a acompanhante *${talent.stageName || talent.name}*.`;

    const photos = Array.isArray(talent.photos) ? talent.photos : [];
    let cover;
    if (photos.length) {
      const nav = photos.length > 1
        ? `<button type="button" class="gallery-nav prev" aria-label="Foto anterior">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
           </button>
           <button type="button" class="gallery-nav next" aria-label="Próxima foto">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
           </button>
           <div class="gallery-count"><span class="cur">1</span>/${photos.length}</div>
           <div class="gallery-dots">
             ${photos.map((_, i) => `<button type="button" class="gallery-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="Ir para foto ${i + 1}"></button>`).join('')}
           </div>`
        : '';
      cover = `<div class="gallery">
        <div class="gallery-viewport">
          <div class="gallery-track">
            ${photos.map((p, i) => `
              <div class="gallery-slide">
                <img src="${p}" alt="${talent.name} — foto ${i + 1}" onerror="this.remove()">
              </div>`).join('')}
          </div>
          ${nav}
        </div>
      </div>`;
    } else {
      cover = `<div class="card-media placeholder" style="height:180px;border-radius:12px;margin-bottom:20px;background:${talent.photoColor}"><div class="avatar-monogram">${initials(talent.name)}</div></div>`;
    }

    modalContent.innerHTML = `
      ${cover}
      <h3 style="font-size:1.3rem;font-weight:800;margin-bottom:4px">${talent.name} <span style="color:var(--text-secondary);font-weight:500">(${talent.stageName || '—'})</span></h3>
      <div style="display:flex;flex-wrap:wrap;gap:6px 18px;font-size:0.86rem;color:var(--text-secondary);margin:12px 0">
        <span>■ ${talent.age} anos</span>
        <span>■ ${talent.height || '—'}</span>
        <span>■ ${talent.weight || '—'}</span>
      </div>
      <span class="badge-status ${talent.status}" style="position:static;margin-bottom:16px"><span class="dot"></span>${{ available: 'Disponível', busy: 'Ocupada', unavailable: 'Indisponível' }[talent.status]}</span>
      <p style="color:var(--text-secondary);font-size:0.95rem;line-height:1.6;margin:14px 0 22px">${talent.bio || 'Sem descrição disponível.'}</p>
      <div class="modal-actions" style="justify-content:flex-start;margin-top:0">
        <a class="btn btn-whatsapp" target="_blank" rel="noopener" href="https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}">
          Contratar
        </a>
      </div>
    `;

    galleryApi = initGallery(modalContent);

    modalTpl.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function initGallery(root) {
    const track = root.querySelector('.gallery-track');
    if (!track) return null;

    const dots = Array.from(root.querySelectorAll('.gallery-dot'));
    const curEl = root.querySelector('.gallery-count .cur');
    const total = track.querySelectorAll('.gallery-slide').length;
    if (!total) return null;
    let index = 0;

    const goTo = (i) => {
      index = Math.max(0, Math.min(total - 1, i));
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle('active', di === index));
      if (curEl) curEl.textContent = index + 1;
    };

    root.querySelector('.gallery-nav.prev')?.addEventListener('click', () => goTo(index - 1));
    root.querySelector('.gallery-nav.next')?.addEventListener('click', () => goTo(index + 1));
    dots.forEach(d => d.addEventListener('click', () => goTo(Number(d.dataset.i))));

    const viewport = root.querySelector('.gallery-viewport');
    let startX = 0, startY = 0, dragging = false;
    viewport.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dragging = true;
    }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
      if (!dragging) return;
      dragging = false;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        goTo(index + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });

    return { goTo, next: () => goTo(index + 1), prev: () => goTo(index - 1), get index() { return index; } };
  }

  modalTpl.addEventListener('click', (e) => {
    if (e.target === modalTpl || e.target.closest('.modal-close-talent')) {
      modalTpl.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!modalTpl.classList.contains('open')) return;
    if (e.key === 'Escape') {
      modalTpl.classList.remove('open');
      document.body.style.overflow = '';
    } else if (galleryApi && e.key === 'ArrowLeft') {
      galleryApi.prev();
    } else if (galleryApi && e.key === 'ArrowRight') {
      galleryApi.next();
    }
  });

  /* ---------- Footer year + dynamic info ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const email = document.getElementById('footerEmail');
  if (email && settings.email) email.textContent = settings.email;
  const cityEl = document.getElementById('footerCity');
  if (cityEl && settings.city) cityEl.textContent = settings.city;

  /* ---------- Warm init ---------- */
  renderCatalog();
});

/* ---------- Toast helper ---------- */
function toast(msg, type = '') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

window.toast = toast;