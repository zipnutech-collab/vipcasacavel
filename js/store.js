/* ============================================================
   VIP CASCAVEL — Data Store (localStorage)
   ============================================================ */

const Store = (() => {
  const KEYS = {
    talents: 'vipc_talents',
    settings: 'vipc_settings',
    users: 'vipc_users',
    session: 'vipc_session'
  };

  const DEFAULT_SETTINGS = {
    whatsapp: '5545999699131',
    whatsappDisplay: '(45) 99969-9131',
    email: 'contato@vipcascavel.com.br',
    city: 'Cascavel - PR',
    adminEmail: 'admin@vipcascavel.com.br',
    adminPasswordHash: btoa(unescape(encodeURIComponent('admin123')))
  };

  const SEED_TALENTS = [
    {
      id: 't1',
      name: 'Juliana Ferreira',
      stageName: 'Juju Ferr',
      age: 24,
      height: '1,68 m',
      weight: '58 kg',
      bio: 'Modelo e recepcionista de eventos com experiência em congressos, feiras e cerimoniais de alto padrão.',
      status: 'available',
      order: 1,
      photos: [],
      photoColor: 'linear-gradient(135deg,#DC2626,#7f1d1d)'
    },
    {
      id: 't2',
      name: 'Caroline Mendes',
      stageName: 'Carol M.',
      age: 28,
      height: '1,74 m',
      weight: '62 kg',
      bio: 'Profissional para campanhas fotográficas, filmes publicitários e desfiles, com book e portfólio atualizados.',
      status: 'busy',
      order: 2,
      photos: [],
      photoColor: 'linear-gradient(135deg,#0ea5e9,#312e81)'
    },
    {
      id: 't3',
      name: 'Marina Souza',
      stageName: 'Marina S.',
      age: 22,
      height: '1,70 m',
      weight: '55 kg',
      bio: 'Atriz de figuração para produções audiovisuais, novelas e séries, com disponibilidade total de agenda.',
      status: 'available',
      order: 3,
      photos: [],
      photoColor: 'linear-gradient(135deg,#8b5cf6,#4c1d95)'
    },
    {
      id: 't4',
      name: 'Amanda Ribeiro',
      stageName: 'Ama R.',
      age: 26,
      height: '1,66 m',
      weight: '56 kg',
      bio: 'Perfil elegante para coquetéis, convenções e atendimento VIP em grandes marcas e empresas.',
      status: 'available',
      order: 4,
      photos: [],
      photoColor: 'linear-gradient(135deg,#f59e0b,#b45309)'
    },
    {
      id: 't5',
      name: 'Beatriz Alves',
      stageName: 'Bia Alves',
      age: 30,
      height: '1,72 m',
      weight: '60 kg',
      bio: 'Apresentadora e mestre de cerimônias para eventos corporativos, feiras e lançamentos de produtos.',
      status: 'unavailable',
      order: 5,
      photos: [],
      photoColor: 'linear-gradient(135deg,#10b981,#065f46)'
    },
    {
      id: 't6',
      name: 'Larissa Costa',
      stageName: 'Lari C.',
      age: 23,
      height: '1,63 m',
      weight: '52 kg',
      bio: 'Jovem talento com presença marcante para campanhas digitais, redes sociais e materiais institucionais.',
      status: 'available',
      order: 6,
      photos: [],
      photoColor: 'linear-gradient(135deg,#ec4899,#831843)'
    }
  ];

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      throw new Error('STORAGE_FULL');
    }
  }

  function uid() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- Talents ---------- */
  function getTalents() {
    const t = read(KEYS.talents, null);
    if (!t) {
      write(KEYS.talents, SEED_TALENTS);
      return SEED_TALENTS.map(normalizeTalent);
    }
    return t.map(normalizeTalent);
  }

  function normalizeTalent(t) {
    if (!Array.isArray(t.photos)) {
      t.photos = t.photo ? [t.photo] : [];
    }
    delete t.photo;
    return t;
  }

  function saveTalents(list) {
    write(KEYS.talents, list);
  }

  function getTalent(id) {
    return getTalents().find(t => t.id === id);
  }

  function upsertTalent(data) {
    const list = getTalents();
    if (data.id) {
      const idx = list.findIndex(t => t.id === data.id);
      if (idx !== -1) list[idx] = data;
    } else {
      data.id = uid();
      list.push(data);
    }
    saveTalents(list);
    return data;
  }

  function deleteTalent(id) {
    saveTalents(getTalents().filter(t => t.id !== id));
  }

  /* ---------- Users (additional administrators) ---------- */
  function getUsers() {
    return read(KEYS.users, []) || [];
  }

  function saveUsers(list) {
    write(KEYS.users, list);
  }

  function findUserByEmail(email) {
    const mail = String(email || '').trim().toLowerCase();
    return getUsers().find(u => String(u.email).toLowerCase() === mail);
  }

  function upsertUser(data) {
    const list = getUsers();
    if (data.id) {
      const i = list.findIndex(u => u.id === data.id);
      if (i !== -1) list[i] = data;
    } else {
      data.id = uid();
      list.push(data);
    }
    saveUsers(list);
    return data;
  }

  function deleteUser(id) {
    saveUsers(getUsers().filter(u => u.id !== id));
  }

  function hashPassword(password) {
    return btoa(unescape(encodeURIComponent(password)));
  }

  /* ---------- Settings ---------- */
  function getSettings() {
    const s = read(KEYS.settings, null);
    if (!s) {
      write(KEYS.settings, DEFAULT_SETTINGS);
      return { ...DEFAULT_SETTINGS };
    }
    return { ...DEFAULT_SETTINGS, ...s };
  }

  function saveSettings(s) {
    write(KEYS.settings, s);
  }

  /* ---------- Session / Auth ---------- */
  function login(email, password) {
    const s = getSettings();
    const mail = String(email || '').trim().toLowerCase();
    const hash = hashPassword(password);
    let account = null;

    if (mail === s.adminEmail.toLowerCase() && hash === s.adminPasswordHash) {
      account = { email: s.adminEmail, role: 'owner' };
    } else {
      const u = getUsers().find(
        x => String(x.email).toLowerCase() === mail && x.passwordHash === hash
      );
      if (u) account = { email: u.email, role: 'admin', id: u.id };
    }

    if (!account) return false;
    write(KEYS.session, { ...account, loginAt: Date.now() });
    return account;
  }

  function currentUser() {
    return read(KEYS.session, null);
  }

  function isAuthed() {
    return !!currentUser();
  }

  function logout() {
    localStorage.removeItem(KEYS.session);
  }

  return {
    getTalents,
    getTalent,
    upsertTalent,
    deleteTalent,
    getUsers,
    findUserByEmail,
    upsertUser,
    deleteUser,
    hashPassword,
    getSettings,
    saveSettings,
    login,
    currentUser,
    isAuthed,
    logout
  };
})();

window.Store = Store;