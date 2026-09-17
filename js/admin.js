/* ============================================================
   VIP CASCAVEL — Admin Panel
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ============================================================
     AUTH GUARD
     ============================================================ */
  const loginScreen = document.getElementById('loginScreen');
  const appScreen = document.getElementById('adminApp');

  if (loginScreen) {
    if (Store.isAuthed()) {
      loginScreen.style.display = 'none';
      if (appScreen) appScreen.style.display = 'flex';
      initAdmin();
    } else {
      loginScreen.style.display = 'flex';
      afterLoginSetup();
    }
    return;
  }

  initAdmin();
});

function afterLoginSetup() {
  const form = document.getElementById('loginForm');
  const error = document.getElementById('loginError');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (Store.login(email, password)) {
      error.textContent = '';
      const loginScreen = document.getElementById('loginScreen');
      const appScreen = document.getElementById('adminApp');
      if (loginScreen) loginScreen.style.display = 'none';
      if (appScreen) appScreen.style.display = 'flex';
      initAdmin();
      toast('Bem-vindo(a) ao painel!', 'success');
    } else {
      error.textContent = 'E-mail ou senha inválidos.';
    }
  });
}

/* ============================================================
   ADMIN APP
   ============================================================ */
function initAdmin() {
  const settings = Store.getSettings();
  const me = Store.currentUser() || {};
  document.getElementById('adminUserEmail').textContent = me.email || settings.adminEmail;

  bindSidebar();
  bindLogout();

  loadTalentsList();
  loadDashMetrics();
  loadUsersList();
  loadSettings();

  bindTalentForm();
  bindUserForm();
  bindSettingsForm();
  bindModals();
}

function bindSidebar() {
  const sidebar = document.getElementById('adminSidebar');
  const backdrop = document.getElementById('adminSidebarBackdrop');
  const menuBtn = document.getElementById('adminMenuBtn');
  const closeBtn = document.getElementById('sidebarClose');

  const closeDrawer = () => {
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  };

  const openDrawer = () => {
    if (sidebar) sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  if (menuBtn) menuBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) closeDrawer();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeDrawer();
  });

  document.querySelectorAll('.side-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.section;
      if (!target) return;
      document.querySelectorAll('.side-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
      const section = document.getElementById('section-' + target);
      if (section) section.style.display = 'block';
      closeDrawer();
    });
  });
}

function bindLogout() {
  const btn = document.getElementById('logoutBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      Store.logout();
      location.reload();
    });
  }
}

/* ============================================================
   DASHBOARD METRICS
   ============================================================ */
function loadDashMetrics() {
  const talents = Store.getTalents();
  const total = talents.length;
  const available = talents.filter(t => t.status === 'available').length;
  const busy = talents.filter(t => t.status === 'busy').length;

  const el = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = v; };
  el('mTotalTalents', total);
  el('mAvailable', available);
  el('mBusy', busy);
}

/* ============================================================
   TALENTS LIST
   ============================================================ */
function statusTag(status) {
  const labels = { available: 'Disponível', busy: 'Ocupada', unavailable: 'Indisponível' };
  return `<span class="tag ${status}"><span class="dot"></span>${labels[status] || status}</span>`;
}

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function loadTalentsList() {
  const tbody = document.getElementById('talentsTbody');
  const talents = Store.getTalents()
    .slice()
    .sort((a, b) => (a.order || 99) - (b.order || 99));

  if (!talents.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">Nenhuma acompanhante cadastrada. Clique em "Nova Acompanhante".</td></tr>`;
    const c = document.getElementById('talentsCount');
    if (c) c.textContent = '0 perfis';
    return;
  }

  const count = document.getElementById('talentsCount');
  if (count) count.textContent = `${talents.length} perfil${talents.length > 1 ? 'is' : ''}`;

  tbody.innerHTML = talents.map(t => `
    <tr>
      <td>
        <div class="td-user">
          ${(t.photos && t.photos.length)
            ? `<span class="td-avatar"><img src="${t.photos[0]}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.textContent='${initials(t.name)}'"></span>`
            : `<span class="td-avatar" style="background:${t.photoColor || 'var(--brand-soft)'}">${initials(t.name)}</span>`}
          <div>
            <strong>${t.stageName || t.name}</strong>
            <small>${t.name}${(t.photos && t.photos.length > 1) ? ` · ${t.photos.length} fotos` : ''}</small>
          </div>
        </div>
      </td>
      <td>
        <span style="color:var(--text-secondary)">${t.age} anos<br>${t.height || '—'} · ${t.weight || '—'}</span>
      </td>
      <td>${statusTag(t.status)}</td>
      <td>${t.whatsapp
        ? `<span style="color:var(--success);font-weight:600">${t.whatsapp}</span>`
        : `<span style="color:var(--text-secondary)">Geral</span>`}</td>
      <td>#${t.order || '—'}</td>
      <td>
        <div class="row-actions">
          <button class="btn-icon" title="Editar" data-edit-talent="${t.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
          </button>
          <button class="btn-icon danger" title="Excluir" data-del-talent="${t.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-edit-talent]').forEach(b => {
    b.addEventListener('click', () => openTalentModal(b.dataset.editTalent));
  });

  tbody.querySelectorAll('[data-del-talent]').forEach(b => {
    b.addEventListener('click', () => deleteTalent(b.dataset.delTalent));
  });
}

function deleteTalent(id) {
  const t = Store.getTalent(id);
  if (!t) return;
  if (confirm(`Excluir "${t.stageName || t.name}" do catálogo?`)) {
    Store.deleteTalent(id);
    toast('Acompanhante removida com sucesso.', 'success');
    loadTalentsList();
    loadDashMetrics();
  }
}

/* ============================================================
   TALENT FORM (create / edit)
   ============================================================ */
const TALENT_STATUS = [
  { value: 'available', label: 'Disponível' },
  { value: 'busy', label: 'Ocupada' },
  { value: 'unavailable', label: 'Indisponível' }
];

const MAX_PHOTOS = 5;
let currentPhotos = [];

function renderPhotoGrid() {
  const grid = document.getElementById('tPhotoGrid');
  const counter = document.getElementById('photoCounter');
  if (counter) counter.textContent = `${currentPhotos.length}/${MAX_PHOTOS}`;
  if (!grid) return;

  let html = currentPhotos.map((src, i) => `
    <div class="photo-thumb">
      <img src="${src}" alt="Foto ${i + 1}">
      ${i === 0 ? '<span class="cover-tag">Capa</span>' : ''}
      <button type="button" class="photo-remove" data-photo-idx="${i}" title="Remover">&times;</button>
    </div>
  `).join('');

  if (currentPhotos.length < MAX_PHOTOS) {
    html += `<button type="button" class="photo-add" id="tPhotoAdd">
      <span>+</span><span>Adicionar</span>
    </button>`;
  }

  grid.innerHTML = html;

  grid.querySelectorAll('.photo-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPhotos.splice(Number(btn.dataset.photoIdx), 1);
      renderPhotoGrid();
    });
  });

  const addBtn = document.getElementById('tPhotoAdd');
  if (addBtn) addBtn.addEventListener('click', () => document.getElementById('tPhoto').click());
}

function resizeImage(file, maxSize = 900, quality = 0.82) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round(height * (maxSize / width));
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round(width * (maxSize / height));
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function openTalentModal(id) {
  const form = document.getElementById('talentForm');
  const title = document.getElementById('talentModalTitle');
  form.reset();
  currentPhotos = [];
  form.dataset.id = '';

  if (id) {
    const t = Store.getTalent(id);
    if (!t) return;
    form.dataset.id = id;
    title.textContent = 'Editar acompanhante';
    document.getElementById('tName').value = t.name;
    document.getElementById('tStageName').value = t.stageName || '';
    document.getElementById('tAge').value = t.age || '';
    document.getElementById('tHeight').value = t.height || '';
    document.getElementById('tWeight').value = t.weight || '';
    document.getElementById('tBio').value = t.bio || '';
    document.getElementById('tOrder').value = t.order || 99;
    document.getElementById('tWhatsapp').value = t.whatsapp || '';
    document.getElementById('tColor').value = t.photoColor || '#1a1a1a';
    currentPhotos = Array.isArray(t.photos) ? [...t.photos] : [];
    const sel = document.getElementById('tStatus');
    sel.innerHTML = TALENT_STATUS.map(s =>
      `<option value="${s.value}" ${s.value === t.status ? 'selected' : ''}>${s.label}</option>`
    ).join('');
  } else {
    title.textContent = 'Novo acompanhante';
    document.getElementById('tStatus').innerHTML = TALENT_STATUS.map(s =>
      `<option value="${s.value}">${s.label}</option>`
    ).join('');
  }

  renderPhotoGrid();
  document.getElementById('talentModal').classList.add('open');
}

function bindTalentForm() {
  const form = document.getElementById('talentForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
      id: form.dataset.id || null,
      name: document.getElementById('tName').value.trim(),
      stageName: document.getElementById('tStageName').value.trim(),
      age: Number(document.getElementById('tAge').value) || 0,
      height: document.getElementById('tHeight').value.trim(),
      weight: document.getElementById('tWeight').value.trim(),
      bio: document.getElementById('tBio').value.trim(),
      status: document.getElementById('tStatus').value,
      order: Number(document.getElementById('tOrder').value) || 99,
      whatsapp: document.getElementById('tWhatsapp').value.replace(/\s/g, ''),
      photos: [...currentPhotos],
      photoColor: document.getElementById('tColor').value || '#1a1a1a'
    };

    if (!data.name) {
      toast('Informe o nome da acompanhante.', 'error');
      return;
    }

    try {
      Store.upsertTalent(data);
    } catch (err) {
      toast('Armazenamento cheio. Reduza o número de fotos ou remova perfis antigos.', 'error');
      return;
    }
    closeModal('talentModal');
    toast(data.id ? 'Acompanhante atualizada com sucesso.' : 'Acompanhante adicionada ao catálogo.', 'success');
    loadTalentsList();
    loadDashMetrics();
  });

  const fileInput = document.getElementById('tPhoto');
  fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const slots = MAX_PHOTOS - currentPhotos.length;
    if (slots <= 0) {
      toast(`Limite de ${MAX_PHOTOS} fotos atingido.`, 'error');
      fileInput.value = '';
      return;
    }

    const selected = files.slice(0, slots);
    if (files.length > slots) {
      toast(`Foram adicionadas apenas ${slots} foto(s) — limite de ${MAX_PHOTOS}.`, 'error');
    }

    for (const file of selected) {
      if (!file.type.startsWith('image/')) continue;
      const dataUrl = await resizeImage(file);
      if (dataUrl) currentPhotos.push(dataUrl);
    }

    renderPhotoGrid();
    fileInput.value = '';
  });
}

/* ============================================================
   ADMIN USERS
   ============================================================ */
function loadUsersList() {
  const tbody = document.getElementById('usersTbody');
  if (!tbody) return;

  const s = Store.getSettings();
  const users = Store.getUsers();
  const me = Store.currentUser() || {};
  const youTag = (email) =>
    me.email && me.email.toLowerCase() === String(email).toLowerCase()
      ? ' <span class="tag available" style="margin-left:8px"><span class="dot"></span>Você</span>'
      : '';

  const rows = [
    `<tr>
       <td><strong>${s.adminEmail}</strong>${youTag(s.adminEmail)}</td>
       <td><span class="tag available"><span class="dot"></span>Principal</span></td>
       <td><span style="color:var(--text-secondary);font-size:0.82rem">Não removível</span></td>
     </tr>`
  ];

  users.forEach(u => {
    rows.push(`
      <tr>
        <td><strong>${u.email}</strong>${youTag(u.email)}</td>
        <td><span class="tag">Administrador</span></td>
        <td>
          <div class="row-actions">
            <button class="btn-icon danger" title="Excluir" data-del-user="${u.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>`);
  });

  tbody.innerHTML = rows.join('');

  tbody.querySelectorAll('[data-del-user]').forEach(b => {
    b.addEventListener('click', () => {
      if (confirm('Remover este usuário administrador?')) {
        Store.deleteUser(b.dataset.delUser);
        loadUsersList();
        toast('Usuário removido.', 'success');
      }
    });
  });
}

function openUserModal() {
  const form = document.getElementById('userForm');
  form.reset();
  document.getElementById('userModal').classList.add('open');
}

function bindUserForm() {
  const form = document.getElementById('userForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('uEmail').value.trim();
    const password = document.getElementById('uPassword').value;
    const confirm = document.getElementById('uConfirm').value;
    const s = Store.getSettings();

    if (!email) {
      toast('Informe o e-mail do usuário.', 'error');
      return;
    }
    if (email.toLowerCase() === s.adminEmail.toLowerCase() || Store.findUserByEmail(email)) {
      toast('Este e-mail já está cadastrado.', 'error');
      return;
    }
    if (password.length < 6) {
      toast('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }
    if (password !== confirm) {
      toast('As senhas não coincidem.', 'error');
      return;
    }

    try {
      Store.upsertUser({ email, passwordHash: Store.hashPassword(password) });
    } catch (err) {
      toast('Armazenamento cheio. Não foi possível salvar o usuário.', 'error');
      return;
    }

    closeModal('userModal');
    loadUsersList();
    toast('Usuário administrador cadastrado.', 'success');
  });
}

/* ============================================================
   SETTINGS
   ============================================================ */
function loadSettings() {
  const s = Store.getSettings();
  document.getElementById('sWhatsapp').value = s.whatsapp;
  document.getElementById('sWhatsappDisplay').value = s.whatsappDisplay;
  document.getElementById('sEmail').value = s.email;
  document.getElementById('sCity').value = s.city;
}

function bindSettingsForm() {
  const form = document.getElementById('settingsForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const s = Store.getSettings();
    s.whatsapp = document.getElementById('sWhatsapp').value.replace(/\D/g, '');
    s.whatsappDisplay = document.getElementById('sWhatsappDisplay').value.trim();
    s.email = document.getElementById('sEmail').value.trim();
    s.city = document.getElementById('sCity').value.trim();
    Store.saveSettings(s);
    toast('Configurações salvas com sucesso.', 'success');
  });

  const pwForm = document.getElementById('passwordForm');
  pwForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const s = Store.getSettings();
    const me = Store.currentUser() || {};
    const current = document.getElementById('pwCurrent').value;
    const next = document.getElementById('pwNew').value;
    const confirm = document.getElementById('pwConfirm').value;

    const hashCurrent = Store.hashPassword(current);
    const isOwner = !me.role || me.role === 'owner';

    if (isOwner && hashCurrent !== s.adminPasswordHash) {
      toast('Senha atual incorreta.', 'error');
      return;
    }
    if (!isOwner && (!me.id || hashCurrent !== (Store.getUsers().find(u => u.id === me.id) || {}).passwordHash)) {
      toast('Senha atual incorreta.', 'error');
      return;
    }
    if (next.length < 6) {
      toast('A nova senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }
    if (next !== confirm) {
      toast('As senhas não coincidem.', 'error');
      return;
    }

    if (isOwner) {
      s.adminPasswordHash = Store.hashPassword(next);
      Store.saveSettings(s);
    } else {
      const user = Store.getUsers().find(u => u.id === me.id);
      if (user) {
        user.passwordHash = Store.hashPassword(next);
        Store.upsertUser(user);
      }
    }
    pwForm.reset();
    toast('Senha alterada com sucesso.', 'success');
  });
}

/* ============================================================
   MODAL HELPERS
   ============================================================ */
function bindModals() {
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal.id);
    });
    modal.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
      btn.addEventListener('click', () => closeModal(modal.id));
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => closeModal(m.id));
    }
  });

  const newTalentBtn = document.getElementById('newTalentBtn');
  if (newTalentBtn) newTalentBtn.addEventListener('click', () => openTalentModal(null));

  const newTalentBtn2 = document.getElementById('newTalentBtn2');
  if (newTalentBtn2) newTalentBtn2.addEventListener('click', () => openTalentModal(null));

  const newUserBtn = document.getElementById('newUserBtn');
  if (newUserBtn) newUserBtn.addEventListener('click', openUserModal);

  document.getElementById('btnGoCatalog').addEventListener('click', () => {
    window.open('index.html', '_blank');
  });
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ---------- Toast (defined in app.js; ensure availability) ---------- */
if (typeof window.toast !== 'function') {
  window.toast = function (msg, type = '') {
    let c = document.querySelector('.toast-container');
    if (!c) {
      c = document.createElement('div');
      c.className = 'toast-container';
      document.body.appendChild(c);
    }
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  };
}