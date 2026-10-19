/* ============================================================
   Pilates na Parede · 21 Dias — App logic v2
   ============================================================ */

const STORAGE_KEY = 'pp21_state_v1';
const TOTAL_DAYS = 21;

const LEVELS = [
  { min: 0,    name: 'Iniciante',       tag: 'Nv 1' },
  { min: 300,  name: 'Praticante',      tag: 'Nv 2' },
  { min: 700,  name: 'Dedicada',        tag: 'Nv 3' },
  { min: 1200, name: 'Guerreira',       tag: 'Nv 4' },
  { min: 1900, name: 'Mestre da Parede', tag: 'Nv 5' }
];

const ACHIEVEMENTS = [
  { id: 'day_1',   name: 'Primeiro Passo',   desc: 'Complete o Dia 1',       icon: 'flag',    check: s => s.completedDays.length >= 1 },
  { id: 'day_3',   name: 'Trilogia',         desc: 'Complete 3 dias',        icon: 'sparkle', check: s => s.completedDays.length >= 3 },
  { id: 'day_7',   name: 'Uma Semana',       desc: 'Complete 7 dias',        icon: 'calendar',check: s => s.completedDays.length >= 7 },
  { id: 'day_11',  name: 'Meio Caminho',     desc: 'Complete 11 dias',       icon: 'compass', check: s => s.completedDays.length >= 11 },
  { id: 'day_14',  name: 'Duas Semanas',     desc: 'Complete 14 dias',       icon: 'gem',     check: s => s.completedDays.length >= 14 },
  { id: 'day_18',  name: 'Reta Final',       desc: 'Complete 18 dias',       icon: 'flame',   check: s => s.completedDays.length >= 18 },
  { id: 'day_21',  name: 'A Guerreira',      desc: 'Desafio completo',       icon: 'crown',   check: s => s.completedDays.length >= 21 },
  { id: 'streak_3',name: 'Constância',       desc: 'Sequência de 3 dias',    icon: 'lightning', check: s => s.maxStreak >= 3 },
  { id: 'streak_7',name: 'Semana Perfeita',  desc: 'Sequência de 7 dias',    icon: 'star',    check: s => s.maxStreak >= 7 }
];

const XP_BASE = 100;
const XP_MILESTONES = { 7: 200, 14: 400, 21: 1000 };

const CHALLENGES = [
  {
    id: 'sem-acucar',
    emoji: '🍩',
    banner: 1,
    days: 21,
    title: 'Sem açúcar',
    desc: 'Elimine o açúcar refinado por 21 dias. Sinta a diferença na energia, no sono e na pele.',
    participants: '72,2K participantes',
    price: 'R$ 39,90',
    features: ['Guia diário de substituições', 'Receitas doces sem açúcar', 'Diário de sintomas']
  },
  {
    id: 'barriga-tonificada',
    emoji: '🔥',
    banner: 2,
    days: 30,
    title: 'Barriga tonificada',
    desc: 'Exercícios abdominais focados em 30 dias pra uma cintura definida.',
    participants: '60,2K participantes',
    price: 'R$ 29,90',
    features: ['Vídeos guiados por dia', 'Plano de alimentação leve', 'Medições semanais']
  },
  {
    id: 'gluteos-14',
    emoji: '🍑',
    banner: 3,
    days: 14,
    title: 'Glúteos em fogo',
    desc: '14 dias focados em fortalecimento e volume dos glúteos.',
    participants: '45,8K participantes',
    price: 'R$ 24,90',
    features: ['3 níveis de intensidade', 'Bônus: alongamento pós-treino', 'Guia de progressão']
  },
  {
    id: 'meditacao-7',
    emoji: '🧘',
    banner: 4,
    days: 7,
    title: 'Meditação diária',
    desc: '7 dias de meditações guiadas de 10 minutos pra clareza mental.',
    participants: '38,4K participantes',
    price: 'R$ 14,90',
    features: ['Meditações em áudio', 'Diário de intenções', 'Exercícios de respiração']
  },
  {
    id: 'sono-restaurador',
    emoji: '🌙',
    banner: 5,
    days: 14,
    title: 'Sono restaurador',
    desc: 'Reprograme sua rotina noturna e durma como criança em 14 dias.',
    participants: '29,7K participantes',
    price: 'R$ 19,90',
    features: ['Ritual noturno guiado', 'Alongamentos pré-sono', 'Tracker de qualidade']
  }
];

// ---------- State ----------
const defaultState = () => ({
  onboardingDone: false,
  name: '',
  photoUrl: '',
  goal: null,
  fitnessLevel: null,
  weightCurrent: null,   // kg
  weightGoal: null,      // kg
  heightCm: null,
  weightHistory: [],     // [{date: 'YYYY-MM-DD', kg: 70.2}]
  waterLog: {},          // { 'YYYY-MM-DD': ml }
  calorieLog: {},        // { 'YYYY-MM-DD': { 'cafe': 350, 'almoco': 500, ... } }
  addedChallenges: [],   // [challengeId]
  favorites: [],         // [dayNumber]
  photoPosX: 50,         // % — horizontal object-position of profile photo
  photoPosY: 50,         // % — vertical object-position of profile photo
  startDate: null,
  completedDays: [],
  completionLog: {},     // { 'YYYY-MM-DD': dayNumber } — accurate weekly reports
  lastCompletedDate: null,
  xp: 0,
  streak: 0,
  maxStreak: 0,
  achievements: [],
  reminders: false,
  theme: 'light',        // 'light' | 'dark' | 'auto' — padrão claro
  createdAt: new Date().toISOString()
});

const State = {
  data: defaultState(),
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.data = { ...defaultState(), ...JSON.parse(raw) };
    } catch (e) {}
  },
  save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); },
  patch(updates) { this.data = { ...this.data, ...updates }; this.save(); },
  reset() { this.data = defaultState(); this.save(); }
};

// ---------- Helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const el = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};
const escape = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[m]));

const todayISO = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const daysBetween = (isoA, isoB) => {
  if (!isoA || !isoB) return 0;
  const [y1, m1, d1] = isoA.split('-').map(Number);
  const [y2, m2, d2] = isoB.split('-').map(Number);
  const dateA = new Date(y1, m1 - 1, d1);
  const dateB = new Date(y2, m2 - 1, d2);
  return Math.round((dateB - dateA) / 86400000);
};

const currentDay = () => Math.min(State.data.completedDays.length + 1, TOTAL_DAYS);
// Motivo do bloqueio: 'prereq' (falta terminar o dia anterior), 'time' (limita 1 dia por dia real), ou null (liberado)
const dayLockReason = (day) => {
  if (day === 1) return null;
  if (State.data.completedDays.includes(day)) return null; // dia concluído: sempre acessível pra rever
  if (!State.data.completedDays.includes(day - 1)) return 'prereq';
  if (State.data.lastCompletedDate === todayISO()) return 'time';
  return null;
};
const isDayAvailable = (day) => dayLockReason(day) === null;
const isDayDone = (day) => State.data.completedDays.includes(day);
// Retorna o Date em que o próximo dia libera (00:00 de amanhã, baseado em lastCompletedDate)
const nextDayUnlockDate = () => {
  if (!State.data.lastCompletedDate) return null;
  const [y, m, d] = State.data.lastCompletedDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 1);
  return date;
};

const currentLevel = () => {
  let lv = LEVELS[0];
  for (const l of LEVELS) if (State.data.xp >= l.min) lv = l;
  return lv;
};
const nextLevel = () => {
  const lv = currentLevel();
  const idx = LEVELS.indexOf(lv);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
};
const getLevelForXp = (xp) => {
  let lv = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) lv = l;
  return lv;
};

const initials = (name) => {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0].toUpperCase()).join('');
};

const goalLabels = {
  tone: 'Tonificar o corpo',
  lose: 'Perder peso',
  posture: 'Melhorar postura',
  energy: 'Mais energia'
};

const goalToDailyCalorieTarget = () => {
  const goal = State.data.goal;
  if (goal === 'lose') return 1400;
  if (goal === 'tone') return 1700;
  return 1800;
};
const DAILY_WATER_ML = 2000;
const CUP_ML = 250;

function isDarkMode() {
  const t = State.data.theme || 'auto';
  if (t === 'dark') return true;
  if (t === 'light') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
function applyTheme() {
  const t = State.data.theme || 'auto';
  const root = document.documentElement;
  if (t === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', t);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', isDarkMode() ? '#0E0E11' : '#FBFAFB');
}
function toggleTheme() {
  // Instant toggle: sets explicit opposite of current effective mode
  const next = isDarkMode() ? 'light' : 'dark';
  State.patch({ theme: next });
  applyTheme();
}
// Watch for system theme change while user is in auto
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    if ((State.data.theme || 'auto') === 'auto') applyTheme();
  });
}

const toast = (msg) => {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('is-visible');
  clearTimeout(toast._h);
  toast._h = setTimeout(() => t.classList.remove('is-visible'), 2400);
};

// ---------- Icons ----------
const ICON = {
  arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8V4z"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zM7 6H3v2a3 3 0 003 3M17 6h4v2a3 3 0 01-3 3"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18M8 17V9M13 17V5M18 17v-6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
  reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
  yoga: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="7" r="3"/><path d="M11 27h10M8 27c0-4 3-6 8-6s8 2 8 6M12 14c0 4-4 6-8 8M20 14c0 4 4 6 8 8"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>',
  crown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l3 10h12l3-10-5 4-4-8-4 8-5-4z"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4a5 5 0 015-1c3 0 3 2 6 2s5-1 5-1v11s-2 1-5 1-3-2-6-2a5 5 0 00-5 1"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  gem: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9l4-6zM12 22L2 9M12 22l10-13M2 9h20M12 22V3"/></svg>',
  lightning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
  water: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s6 6 6 12a6 6 0 01-12 0c0-6 6-12 6-12z"/></svg>',
  apple: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1-1 3-2 5 0M12 8c-3-2-7-1-8 3-1 5 3 10 8 10s9-5 8-10c-1-4-5-5-8-3z"/></svg>',
  dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5l11 11M21 21l-1-1M3 3l1 1M17.5 6.5l-11 11M6 3l3 3M18 21l3-3M18 3l3 3M3 18l3 3"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="12" r="4"/><path d="M12 8v3"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
  ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12l10-10 10 10-10 10zM4 12l3 3M8 12l2 2M12 12l3 3M16 12l2 2M20 12l-2-2"/></svg>',
  cup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l-1 15a3 3 0 01-3 3h-4a3 3 0 01-3-3z"/><path d="M6 8h12"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v9a1 1 0 001 1h12a1 1 0 001-1v-9M8 8a3 3 0 010-6c2 0 4 6 4 6M16 8a3 3 0 000-6c-2 0-4 6-4 6"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 012-2h14v18H6a2 2 0 01-2-2z"/><path d="M8 3v18"/></svg>',
  help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>',
  heartOutline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>',
  heartFilled: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>',
  sun:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
};

// ---------- Router ----------
const routes = {
  '/onboarding': renderOnboarding,
  '/plano':      renderHome,
  '/dia':        renderDayDetail,
  '/treinar':    renderTreinar,
  '/treinos':    renderTreinosCatalog,
  '/pilates':    renderTreinosPilates,
  '/favoritos':  renderFavoritos,
  '/progresso':  renderProgress,
  '/mais':       renderMais,
  '/perfil':     renderProfile,
  '/agua':       renderAgua,
  '/calorias':   renderCalorias,
  '/peso':       renderPeso,
  '/desafios':   renderDesafios
};

let previousRoute = null;
let backTargetForSubpage = '/mais'; // remembers the last "hub" route so subpages know where to return
const HUB_ROUTES = new Set(['/plano', '/treinos', '/progresso', '/mais']);

function router() {
  const hash = location.hash.replace('#', '') || '/';
  if (!State.data.onboardingDone && hash !== '/onboarding') {
    location.hash = '/onboarding';
    return;
  }
  if (State.data.onboardingDone && hash === '/onboarding') {
    location.hash = '/plano';
    return;
  }
  const [route, param] = hash.split('/').filter(Boolean);
  const key = '/' + (route || 'plano');
  // Reset home carousel scroll flag when arriving at /plano from another route
  if (key === '/plano' && previousRoute !== '/plano') {
    homeCarouselScrolled = false;
    selectedDayView = null; // reset day preview to today
  }
  // Track the last hub route so subpages can return to it
  if (HUB_ROUTES.has(key)) backTargetForSubpage = key;
  previousRoute = key;
  const handler = routes[key] || renderHome;
  document.getElementById('app').innerHTML = '';
  handler(param);
  window.scrollTo(0, 0);
}

const nav = (path) => { location.hash = path; };

// ---------- Bottom navigation ----------
function bottomNav(active) {
  const tabs = [
    { key: 'plano',     label: 'Plano',     icon: ICON.calendar },
    { key: 'treinos',   label: 'Treinos',   icon: ICON.dumbbell },
    { key: 'progresso', label: 'Progresso', icon: ICON.chart },
    { key: 'mais',      label: 'Mais',      icon: ICON.menu }
  ];
  const navEl = el(`
    <nav class="bottomnav">
      ${tabs.map(t => `
        <button class="bottomnav__tab ${active === t.key ? 'is-active' : ''}" data-tab="${t.key}">
          ${t.icon}
          <span>${t.label}</span>
        </button>
      `).join('')}
    </nav>
  `);
  navEl.querySelectorAll('[data-tab]').forEach(b => {
    b.addEventListener('click', () => nav('/' + b.dataset.tab));
  });
  return navEl;
}

// ---------- Shared components ----------
function avatarImgTag() {
  const x = State.data.photoPosX ?? 50;
  const y = State.data.photoPosY ?? 50;
  return `<img src="${escape(State.data.photoUrl)}" alt="" style="object-position: ${x}% ${y}%;"/>`;
}
function avatarContent(fallbackName) {
  if (State.data.photoUrl) return avatarImgTag();
  return escape(initials(fallbackName || State.data.name || '?'));
}
function avatarNode(size = 'sm') {
  const cls = size === 'lg' ? 'avatar-lg' : 'avatar--sm';
  return `<div class="${cls}">${avatarContent()}</div>`;
}

// ============================================================
// ONBOARDING (extended with weight/height slides)
// ============================================================

const OB_SLIDES = [
  'welcome', 'name', 'goal', 'height', 'weight', 'weightGoal', 'included', 'ready'
];

const OB_GOALS = [
  { id: 'tone',   title: 'Tonificar o corpo',        desc: 'Definição e firmeza',       icon: ICON.sparkle },
  { id: 'lose',   title: 'Perder peso',              desc: 'Queimar gordura em casa',   icon: ICON.flame },
  { id: 'posture',title: 'Melhorar postura',         desc: 'Costas fortes, alinhamento',icon: ICON.compass },
  { id: 'energy', title: 'Mais energia e disposição',desc: 'Sentir-se bem no dia a dia', icon: ICON.lightning }
];

let obStep = 0;
let obDraft = { name: '', goal: null, heightCm: 165, weightCurrent: 65, weightGoal: 60 };

function renderOnboarding() {
  obStep = 0;
  obDraft = { name: '', goal: null, heightCm: 165, weightCurrent: 65, weightGoal: 60 };
  renderObStep();
}

function renderObStep() {
  const app = $('#app');
  app.innerHTML = '';
  app.innerHTML = '';
  const slide = OB_SLIDES[obStep];
  const dots = OB_SLIDES.map((_, i) => `<span class="ob__dot ${i <= obStep ? 'is-active' : ''}"></span>`).join('');
  const wrapper = el(`
    <div class="ob">
      <div class="topbar" style="padding: 0;">
        <div class="topbar__side">
          ${obStep > 0 ? `<button class="iconbtn" data-back>${ICON.arrowLeft}</button>` : ''}
        </div>
        <div class="ob__dots">${dots}</div>
        <div class="topbar__side"></div>
      </div>
      <div class="ob__body"></div>
    </div>
  `);
  wrapper.querySelector('.ob__body').append(renderObSlide(slide));
  app.append(wrapper);
  const back = wrapper.querySelector('[data-back]');
  if (back) back.addEventListener('click', () => { obStep--; renderObStep(); });
}

function renderObSlide(key) {
  const map = {
    welcome: obWelcome, name: obName, goal: obGoal,
    height: obHeight, weight: obWeight, weightGoal: obWeightGoal,
    included: obIncluded, ready: obReady
  };
  return map[key]();
}

function obNext() {
  if (obStep < OB_SLIDES.length - 1) {
    obStep++;
    renderObStep();
  } else {
    State.patch({
      onboardingDone: true,
      name: obDraft.name || 'Você',
      goal: obDraft.goal,
      heightCm: obDraft.heightCm,
      weightCurrent: obDraft.weightCurrent,
      weightGoal: obDraft.weightGoal,
      weightHistory: [{ date: todayISO(), kg: obDraft.weightCurrent }]
    });
    nav('/plano');
  }
}

function obWelcome() {
  const c = el(`
    <div class="ob__hero">
      <div class="ob__illus">${ICON.yoga}</div>
      <h1 class="ob__title">Bem-vinda ao seu<br/>desafio de 21 dias</h1>
      <p class="ob__desc">Em 21 dias você vai transformar seu corpo e sua energia com Pilates na Parede — só precisa de você e uma parede.</p>
      <div class="ob__pillars">
        <div class="ob__pillar">
          <div class="ob__icon-wrap">${ICON.calendar}</div>
          <div class="n">21</div>
          <div class="l">dias de treino</div>
        </div>
        <div class="ob__pillar">
          <div class="ob__icon-wrap">${ICON.clock}</div>
          <div class="n">15</div>
          <div class="l">min por dia</div>
        </div>
      </div>
      <div class="ob__footer w-full">
        <button class="btn" data-next>Começar minha jornada</button>
      </div>
    </div>
  `);
  c.querySelector('[data-next]').addEventListener('click', obNext);
  return c;
}

function obName() {
  const c = el(`
    <div class="ob__hero">
      <h1 class="ob__title">Como podemos<br/>te chamar?</h1>
      <p class="ob__desc">Vamos personalizar sua jornada.</p>
      <div class="w-full mt-4">
        <input type="text" class="ob__input" placeholder="Seu primeiro nome" maxlength="20" value="${escape(obDraft.name)}" />
      </div>
      <div class="ob__footer w-full">
        <button class="btn" data-next>Continuar</button>
      </div>
    </div>
  `);
  const input = c.querySelector('input');
  setTimeout(() => input.focus(), 100);
  input.addEventListener('input', e => { obDraft.name = e.target.value.trim(); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') obNext(); });
  c.querySelector('[data-next]').addEventListener('click', obNext);
  return c;
}

function obGoal() {
  const c = el(`
    <div class="ob__hero" style="justify-content: flex-start; padding-top: 8px;">
      <h1 class="ob__title">Qual é o seu<br/>objetivo principal?</h1>
      <p class="ob__desc">Isso nos ajuda a te motivar melhor.</p>
      <div class="ob__options w-full mt-4">
        ${OB_GOALS.map(g => `
          <button class="ob__opt ${obDraft.goal === g.id ? 'is-selected' : ''}" data-goal="${g.id}">
            <div class="opt-icon">${g.icon}</div>
            <div style="flex:1;">
              <div class="ob__opt-title">${g.title}</div>
              <div class="ob__opt-desc">${g.desc}</div>
            </div>
            <div class="opt-check">${ICON.check}</div>
          </button>
        `).join('')}
      </div>
      <div class="ob__footer w-full">
        <button class="btn" data-next ${obDraft.goal ? '' : 'disabled'}>Continuar</button>
      </div>
    </div>
  `);
  c.querySelectorAll('[data-goal]').forEach(b => {
    b.addEventListener('click', () => {
      obDraft.goal = b.dataset.goal;
      renderObStep();
    });
  });
  c.querySelector('[data-next]').addEventListener('click', () => { if (obDraft.goal) obNext(); });
  return c;
}

function obNumberSlide({ title, desc, unit, min, max, field, next }) {
  const c = el(`
    <div class="ob__hero">
      <h1 class="ob__title">${title}</h1>
      <p class="ob__desc">${desc}</p>
      <div class="big-value w-full">
        <span class="num" data-display>${obDraft[field]}</span>
        <span class="unit">${unit}</span>
      </div>
      <input type="range" min="${min}" max="${max}" value="${obDraft[field]}" class="w-full" style="accent-color: var(--brand);" />
      <div class="ob__footer w-full">
        <button class="btn" data-next>${next}</button>
      </div>
    </div>
  `);
  const range = c.querySelector('input[type=range]');
  const display = c.querySelector('[data-display]');
  range.addEventListener('input', e => {
    const v = Number(e.target.value);
    obDraft[field] = v;
    display.textContent = v;
  });
  c.querySelector('[data-next]').addEventListener('click', obNext);
  return c;
}

function obHeight() {
  return obNumberSlide({
    title: 'Qual sua altura?',
    desc: 'Isso ajuda a calcular sua evolução.',
    unit: 'cm', min: 140, max: 200,
    field: 'heightCm', next: 'Continuar'
  });
}
function obWeight() {
  return obNumberSlide({
    title: 'Qual seu peso atual?',
    desc: 'Você pode atualizar depois na tela de peso.',
    unit: 'kg', min: 40, max: 130,
    field: 'weightCurrent', next: 'Continuar'
  });
}
function obWeightGoal() {
  return obNumberSlide({
    title: 'Qual sua meta de peso?',
    desc: 'Um alvo pra guiar sua jornada.',
    unit: 'kg', min: 40, max: 130,
    field: 'weightGoal', next: 'Continuar'
  });
}

function obIncluded() {
  const items = [
    { icon: ICON.calendar, text: 'Cronograma de 21 treinos guiados' },
    { icon: ICON.clock,    text: 'Apenas 12 a 25 minutos por dia' },
    { icon: ICON.water,    text: 'Rastreador de água diário' },
    { icon: ICON.apple,    text: 'Registro de calorias' },
    { icon: ICON.scale,    text: 'Acompanhamento de peso' },
    { icon: ICON.trophy,   text: 'Níveis, conquistas e desafios extras' }
  ];
  const c = el(`
    <div class="ob__hero">
      <div class="ob__illus">${ICON.yoga}</div>
      <h1 class="ob__title">O que está incluso</h1>
      <p class="ob__desc">Tudo o que você precisa para chegar do outro lado.</p>
      <div class="ob__list w-full mt-4">
        ${items.map(i => `
          <div class="ob__list-row">
            <div class="li-icon">${i.icon}</div>
            <div class="li-text">${i.text}</div>
            <div class="li-check">${ICON.check}</div>
          </div>
        `).join('')}
      </div>
      <div class="ob__footer w-full">
        <button class="btn" data-next>Próximo</button>
      </div>
    </div>
  `);
  c.querySelector('[data-next]').addEventListener('click', obNext);
  return c;
}

function obReady() {
  const first = (obDraft.name || 'Você').split(' ')[0];
  const c = el(`
    <div class="ob__hero">
      <div class="ob__illus" style="background: linear-gradient(160deg, #f2a2c1, #cf477e);">
        <div style="color:#fff;">${ICON.trophy}</div>
      </div>
      <h1 class="ob__title">Pronta, ${escape(first)}?</h1>
      <p class="ob__desc">Seu Dia 1 começa agora. Vamos juntas até o Dia 21 — um passo de cada vez.</p>
      <div class="ob__pillars">
        <div class="ob__pillar">
          <div class="n" style="color: var(--accent);">+100</div>
          <div class="l">XP por treino</div>
        </div>
        <div class="ob__pillar">
          <div class="n" style="color: var(--accent);">9</div>
          <div class="l">conquistas</div>
        </div>
      </div>
      <div class="ob__footer w-full">
        <button class="btn" data-next>Começar Dia 1</button>
      </div>
    </div>
  `);
  c.querySelector('[data-next]').addEventListener('click', obNext);
  return c;
}

// ============================================================
// HOME (Plano) — new layout
// ============================================================

let selectedDayView = null; // session-scoped: which day the user is previewing on /plano
let homeCarouselScrolled = false; // whether we've already done the initial scroll

function heroSectionHTML(day) {
  const w = window.WORKOUTS.find(x => x.day === day);
  const dayIsDone = isDayDone(day);
  const dayIsLocked = !isDayAvailable(day);
  const lockRequires = day - 1;
  const previewUrl = exerciseVideoUrl(w.exercises.find(e => e.video));
  return `
    <div class="big-hero ${dayIsDone ? 'is-done' : ''} ${dayIsLocked ? 'is-locked' : ''}" ${dayIsLocked ? '' : `data-open="${day}"`}>
      ${previewUrl
        ? `<video class="hero-video" src="${previewUrl}" autoplay muted loop playsinline webkit-playsinline preload="metadata"></video>`
        : `<div class="illus">${ICON.yoga}</div>`}
      <div class="overlay"></div>
      ${dayIsDone ? `
        <div class="center-badge">
          <div class="circle">${ICON.check}</div>
          <div class="lb">Concluído</div>
        </div>
      ` : ''}
      ${dayIsLocked ? `
        <div class="center-badge">
          <div class="circle">${ICON.lock}</div>
        </div>
      ` : ''}
      <div class="caption">
        <div class="name">${escape(w.title)}</div>
        <div class="meta">
          <span>${w.duration} min</span>
          <span>· ${escape(w.difficulty)}</span>
          <span>· ${escape(w.focus)}</span>
        </div>
      </div>
    </div>
  `;
}

function ctaSectionHTML(day) {
  const dayIsDone = isDayDone(day);
  const reason = dayLockReason(day);
  if (reason) {
    const msg = reason === 'time'
      ? `Você já treinou hoje. O Dia ${day} libera ${nextUnlockLabel()}.`
      : `Termine o Dia ${day - 1} primeiro para desbloquear.`;
    return `
      <button class="btn" disabled style="opacity: 0.55; cursor: not-allowed;">
        ${ICON.lock} Bloqueado
      </button>
      <div class="unlock-note">${msg}</div>
    `;
  }
  if (dayIsDone) {
    return `<button class="btn btn--ghost" data-view-day="${day}">Ver treino ${ICON.chevronRight}</button>`;
  }
  return `<button class="btn" data-start-day="${day}">Começar treino ${ICON.play}</button>`;
}

// "amanhã" / "em 2 dias" / data explícita como fallback
function nextUnlockLabel() {
  const d = nextDayUnlockDate();
  if (!d) return 'amanhã';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff <= 1) return 'amanhã';
  if (diff === 2) return 'depois de amanhã';
  return `em ${diff} dias`;
}

function bindHeroHandlers(container, day) {
  container.querySelector('[data-open]')?.addEventListener('click', () => {
    if (isDayAvailable(day)) nav('/dia/' + day);
  });
  // innerHTML nem sempre aplica o atributo muted — garante via propriedade
  const v = container.querySelector('.hero-video');
  if (v) { v.muted = true; v.play().catch(() => {}); }
}
function bindCtaHandlers(container, day) {
  container.querySelector('[data-start-day]')?.addEventListener('click', () => nav('/treinar/' + day));
  container.querySelector('[data-view-day]')?.addEventListener('click', () => nav('/dia/' + day));
}

function updateHeroSection(day, root) {
  const heroCont = root.querySelector('[data-hero-section]');
  const ctaCont = root.querySelector('[data-cta-section]');
  if (heroCont) {
    heroCont.innerHTML = heroSectionHTML(day);
    bindHeroHandlers(heroCont, day);
    const hero = heroCont.querySelector('.big-hero');
    if (hero) {
      hero.style.animation = 'heroSwap .28s ease';
      hero.addEventListener('animationend', () => { hero.style.animation = ''; }, { once: true });
    }
  }
  if (ctaCont) {
    ctaCont.innerHTML = ctaSectionHTML(day);
    bindCtaHandlers(ctaCont, day);
  }
}

function renderHome() {
  const app = $('#app');
  app.innerHTML = '';
  const cur = currentDay();
  const done = State.data.completedDays.length;
  const isChallengeDone = done >= TOTAL_DAYS;
  if (selectedDayView === null) {
    selectedDayView = isChallengeDone ? TOTAL_DAYS : cur;
  }
  const displayDay = selectedDayView;

  const goalLbl = goalLabels[State.data.goal] || '—';
  const weightGoalVal = State.data.weightGoal || '—';

  const screen = el(`
    <div class="screen screen--nav">
      <div class="brand-header">
        <div class="brand">Pilates na parede</div>
        <div class="actions">
          <button class="iconbtn theme-toggle" data-action="toggle-theme" aria-label="Alternar tema" title="Alternar tema">${isDarkMode() ? ICON.sun : ICON.moon}</button>
          <button class="iconbtn" data-action="logout" aria-label="Sair da conta" title="Sair da conta">${ICON.logout}</button>
          <button class="avatar--sm" data-nav="mais">${avatarContent()}</button>
        </div>
      </div>

      <div class="day-carousel-wrap">
        <div class="day-carousel" id="dayCarousel">
          ${window.WORKOUTS.map(w => {
            const base = isDayDone(w.day) ? 'is-done' : (isDayAvailable(w.day) ? '' : 'is-locked');
            const sel = w.day === selectedDayView ? ' is-today' : '';
            return `
              <button class="day-thumb ${base}${sel}" data-day="${w.day}">
                <div class="th">${ICON.yoga}</div>
                <div class="lbl">Dia ${w.day}</div>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <div class="obj-row">
        <div class="obj-col">
          <div class="k">Objetivo principal</div>
          <div class="v">${escape(goalLbl)}</div>
        </div>
        <div class="divider"></div>
        <div class="obj-col">
          <div class="k">Meta de peso</div>
          <div class="v">${weightGoalVal}<small> kg</small></div>
        </div>
      </div>

      <div class="counter-row">
        <div class="cnt"><b>${done}</b>de 21 treinos</div>
        <button class="link" data-nav="perfil">Configurações ${ICON.chevronRight}</button>
      </div>

      <div data-hero-section>
        ${heroSectionHTML(displayDay)}
      </div>

      <div data-cta-section style="margin-top: 14px;">
        ${ctaSectionHTML(displayDay)}
      </div>
    </div>
  `);

  // Tap on day thumb: update hero + carousel border in place, no full re-render
  screen.querySelectorAll('[data-day]').forEach(b => {
    b.addEventListener('click', () => {
      const d = Number(b.dataset.day);
      if (d === selectedDayView) return;
      selectedDayView = d;
      // Move green border to newly selected thumb
      screen.querySelectorAll('.day-thumb.is-today').forEach(el => el.classList.remove('is-today'));
      b.classList.add('is-today');
      // Swap only the hero section content
      updateHeroSection(d, screen);
    });
  });
  // Bind initial hero + CTA handlers
  const heroCont = screen.querySelector('[data-hero-section]');
  const ctaCont = screen.querySelector('[data-cta-section]');
  if (heroCont) bindHeroHandlers(heroCont, displayDay);
  if (ctaCont) bindCtaHandlers(ctaCont, displayDay);
  screen.querySelectorAll('[data-nav]').forEach(b => {
    b.addEventListener('click', () => nav('/' + b.dataset.nav));
  });
  screen.querySelector('[data-action="logout"]')?.addEventListener('click', showLogoutModal);
  screen.querySelector('[data-action="toggle-theme"]')?.addEventListener('click', () => {
    toggleTheme();
    renderHome();
  });

  app.append(screen);
  app.append(bottomNav('plano'));

  // Auto-scroll only on first visit — later re-renders preserve scroll
  const carousel = screen.querySelector('#dayCarousel');
  if (carousel && !homeCarouselScrolled) {
    const today = carousel.querySelector('.day-thumb.is-today');
    if (today) {
      // center the selected day for context (show prior days too)
      const offset = today.offsetLeft - (carousel.clientWidth / 2) + (today.offsetWidth / 2);
      carousel.scrollLeft = Math.max(0, offset);
    }
    homeCarouselScrolled = true;
  }
}

// ============================================================
// DAY DETAIL
// ============================================================

function renderDayDetail(dayParam) {
  const day = Number(dayParam);
  const w = window.WORKOUTS.find(x => x.day === day);
  if (!w) return nav('/plano');
  if (!isDayAvailable(day)) return nav('/plano');
  const done = isDayDone(day);
  const app = $('#app');
  app.innerHTML = '';

  const screen = el(`
    <div class="screen" style="padding-bottom: 120px;">
      <div class="topbar">
        <div class="topbar__side"><button class="iconbtn" data-back>${ICON.arrowLeft}</button></div>
        <div class="topbar__title">Dia ${day} de 21</div>
        <div class="topbar__side"></div>
      </div>

      <div class="detail-hero">
        <div class="k">${escape(w.focus)}</div>
        <div class="t">${escape(w.title)}</div>
        <div class="m">
          <span>${w.duration} min</span>
          <span>· ${escape(w.difficulty)}</span>
          <span>· ${w.exercises.length} exercícios</span>
        </div>
        <p style="color: rgba(245,230,206,0.85); font-size:14px; margin-top:14px; line-height:1.5;">${escape(w.intro)}</p>
      </div>

      <div class="block-title">Aquecimento</div>
      <div class="ex-list">${w.warmup.map((e, i) => renderExItem(i + 1, e)).join('')}</div>

      <div class="block-title">Treino principal</div>
      <div class="ex-list">${w.exercises.map((e, i) => renderExItem(i + 1, e)).join('')}</div>

      <div class="block-title">Volta à calma</div>
      <div class="ex-list">${w.cooldown.map((e, i) => renderExItem(i + 1, e)).join('')}</div>

      <div class="floating-cta">
        ${done
          ? `<button class="btn btn--ghost" data-back>Voltar ao cronograma</button>`
          : `
            <button class="btn" data-start-workout>Começar treino ${ICON.play}</button>
            <button class="secondary-link w-full" data-complete>${ICON.check} Já fiz esse treino</button>
          `
        }
      </div>
    </div>
  `);

  screen.querySelectorAll('[data-back]').forEach(b =>
    b.addEventListener('click', () => nav('/plano')));
  const cta = screen.querySelector('[data-complete]');
  if (cta) cta.addEventListener('click', () => completeDay(day));
  const startBtn = screen.querySelector('[data-start-workout]');
  if (startBtn) startBtn.addEventListener('click', () => nav('/treinar/' + day));

  app.append(screen);
}

function renderExItem(num, e) {
  return `
    <div class="ex-item">
      <div class="num">${num}</div>
      <div class="info">
        <div class="name">${escape(e.name)}</div>
        <div class="dur">${escape(e.dur)}${e.reps ? ' · ' + escape(e.reps) : ''}</div>
        ${e.focus ? `<div class="dur" style="opacity:.7;">${escape(e.focus)}</div>` : ''}
      </div>
    </div>
  `;
}

// ============================================================
// COMPLETE DAY
// ============================================================

function completeDay(day) {
  if (isDayDone(day)) return;
  const today = todayISO();
  const s = State.data;

  let streak = s.streak;
  if (s.lastCompletedDate) {
    const diff = daysBetween(s.lastCompletedDate, today);
    if (diff === 0) streak = Math.max(streak, 1);
    else if (diff === 1) streak = streak + 1;
    else streak = 1;
  } else streak = 1;

  let xpEarned = XP_BASE;
  if (XP_MILESTONES[day]) xpEarned += XP_MILESTONES[day];
  if (streak >= 3) xpEarned += 20;
  if (streak >= 7) xpEarned += 30;

  const newLevel = getLevelForXp(s.xp + xpEarned);
  const oldLevel = getLevelForXp(s.xp);
  const leveledUp = newLevel.name !== oldLevel.name;

  const completedDays = [...s.completedDays, day].sort((a, b) => a - b);
  const startDate = s.startDate || today;
  const maxStreak = Math.max(s.maxStreak, streak);
  const completionLog = { ...(s.completionLog || {}), [today]: day };

  const newState = {
    ...s, completedDays, completionLog, lastCompletedDate: today, startDate,
    xp: s.xp + xpEarned, streak, maxStreak
  };

  const newAchIds = [];
  for (const a of ACHIEVEMENTS) {
    if (!newState.achievements.includes(a.id) && a.check(newState)) newAchIds.push(a.id);
  }
  newState.achievements = [...newState.achievements, ...newAchIds];

  State.data = newState;
  State.save();

  celebrateDay({ day, xpEarned, leveledUp, newLevel, newAchIds });
}

function celebrateDay({ day, xpEarned, leveledUp, newLevel, newAchIds }) {
  const isLast = day === TOTAL_DAYS;
  const confettiPieces = Array.from({ length: 60 }, (_, i) => {
    const colors = ['#cf477e', '#f2a2c1', '#6B9B6F', '#FDECF3', '#B8563D', '#7BA9DB'];
    const c = colors[i % colors.length];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.6;
    const duration = 2 + Math.random() * 2;
    const rotate = Math.random() * 720 - 360;
    const size = 6 + Math.random() * 6;
    return `<span class="confetti-piece" style="left:${left}%; background:${c}; width:${size}px; height:${size * 0.4}px; animation-delay:${delay}s; animation-duration:${duration}s; --r:${rotate}deg;"></span>`;
  }).join('');
  const overlay = el(`
    <div class="celebrate">
      <div class="confetti">${confettiPieces}</div>
      <div class="top">
        <div class="medal">${isLast ? ICON.crown : ICON.trophy}</div>
        <h1>${isLast ? 'Você conseguiu!' : 'Dia ' + day + ' concluído!'}</h1>
        <p class="sub">${isLast
          ? 'Você completou o desafio de 21 dias. Isso é conquista de rainha.'
          : (day < TOTAL_DAYS ? 'Dia ' + (day + 1) + ' será liberado amanhã. Descanse hoje e continue amanhã!' : '')}</p>
        <div class="rewards">
          <div class="reward"><div class="v">+${xpEarned}</div><div class="l">XP</div></div>
          <div class="reward"><div class="v">${State.data.streak}</div><div class="l">Sequência</div></div>
          <div class="reward"><div class="v">${State.data.completedDays.length}/21</div><div class="l">Progresso</div></div>
        </div>
        ${leveledUp ? `<div class="chip chip--accent" style="margin-top: 10px;">${ICON.star} Novo nível: ${newLevel.name}</div>` : ''}
        ${newAchIds.length ? `<div class="chip chip--dark" style="margin-top: 10px;">${ICON.trophy} ${newAchIds.length} conquista${newAchIds.length > 1 ? 's' : ''} desbloqueada${newAchIds.length > 1 ? 's' : ''}</div>` : ''}
      </div>
      <button class="btn" data-close>Continuar</button>
    </div>
  `);
  overlay.querySelector('[data-close]').addEventListener('click', () => {
    overlay.remove();
    nav('/plano');
  });
  document.body.appendChild(overlay);
}

// ============================================================
// PROGRESSO (expanded with weight chart, water, calories)
// ============================================================

function renderProgress() {
  const app = $('#app');
  app.innerHTML = '';
  const done = State.data.completedDays.length;
  const percent = Math.round((done / TOTAL_DAYS) * 100);
  const R = 88;
  const C = 2 * Math.PI * R;
  const offset = C - (C * percent / 100);

  const level = currentLevel();
  const next = nextLevel();
  const toNext = next ? next.min - State.data.xp : 0;

  const screen = el(`
    <div class="screen screen--nav">
      <div class="topbar">
        <div class="topbar__side"></div>
        <div class="topbar__title">Meu progresso</div>
        <div class="topbar__side">
          <button class="avatar--sm" data-nav="mais">${avatarContent()}</button>
        </div>
      </div>

      <div class="progress-ring-wrap">
        <div class="progress-ring">
          <svg viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="${R}" fill="none" stroke-width="14" class="rc-bg"/>
            <circle cx="100" cy="100" r="${R}" fill="none" stroke-width="14" stroke-linecap="round" class="rc-fg"
              stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"/>
          </svg>
          <div class="center-txt">
            <div class="n">${percent}%</div>
            <div class="l">${done} de 21</div>
          </div>
        </div>
      </div>

      <div class="stat-row" style="margin-top: 4px;">
        <div class="stat">
          <div class="ico">${ICON.flame}</div>
          <div class="v">${State.data.streak}</div>
          <div class="l">Sequência</div>
        </div>
        <div class="stat">
          <div class="ico">${ICON.star}</div>
          <div class="v">${State.data.xp}</div>
          <div class="l">XP total</div>
        </div>
        <div class="stat">
          <div class="ico">${ICON.trophy}</div>
          <div class="v">${State.data.achievements.length}</div>
          <div class="l">Conquistas</div>
        </div>
      </div>

      <div class="card" style="margin-top: 6px;">
        <div style="display:flex; align-items:center; justify-content: space-between; margin-bottom: 4px;">
          <div>
            <div class="eyebrow">Nível atual</div>
            <div style="font-size:18px; font-weight:700; margin-top:4px;">${escape(level.name)}</div>
          </div>
          <div class="chip chip--dark">${escape(level.tag)}</div>
        </div>
        ${next ? `
          <div class="xp-bar"><div class="xp-bar__fill" style="width: ${Math.min(100, ((State.data.xp - level.min) / (next.min - level.min)) * 100).toFixed(1)}%"></div></div>
          <div class="xp-meta">
            <span>${State.data.xp} XP</span>
            <span>${toNext} XP para ${escape(next.name)}</span>
          </div>
        ` : `<div class="text-muted text-sm" style="margin-top:8px;">Você atingiu o nível máximo!</div>`}
      </div>

      <div class="block-title" style="margin-top: 22px;">Saúde</div>

      ${renderWeightChartCard()}
      ${renderWaterWeekCard()}
      ${renderCaloriesWeekCard()}
      ${renderWorkoutWeekCard()}

      <div class="section-head">
        <h3>Conquistas</h3>
        <div class="note">${State.data.achievements.length}/${ACHIEVEMENTS.length}</div>
      </div>
      <div class="achievements-grid">
        ${ACHIEVEMENTS.map(a => {
          const unlocked = State.data.achievements.includes(a.id);
          return `
            <div class="ach ${unlocked ? 'is-unlocked' : 'is-locked'}">
              <div class="ico">
                ${unlocked ? ICON[a.icon] : ICON.lock}
                ${unlocked ? `<div class="ach-check">${ICON.check}</div>` : ''}
              </div>
              <div class="name">${escape(a.name)}</div>
              <div class="desc">${escape(a.desc)}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `);

  screen.querySelectorAll('[data-nav]').forEach(b =>
    b.addEventListener('click', () => nav('/' + b.dataset.nav)));

  app.append(screen);
  app.append(bottomNav('progresso'));

  animateCharts(screen);
}

function animateCharts(root = document) {
  // Grow week-card bars from 0 → target
  requestAnimationFrame(() => {
    root.querySelectorAll('[data-target]').forEach(bar => {
      const target = Number(bar.dataset.target) || 0;
      bar.style.height = target + '%';
    });
    // Weight chart line: reveal via stroke-dashoffset
    root.querySelectorAll('.chart-svg .line').forEach(path => {
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.style.transition = 'stroke-dashoffset 1.2s ease-out';
      requestAnimationFrame(() => {
        path.style.strokeDashoffset = 0;
      });
    });
    // Weight chart markers: fade in staggered
    root.querySelectorAll('.chart-svg circle').forEach((c, i) => {
      c.style.opacity = 0;
      c.style.transition = 'opacity 0.4s ease';
      setTimeout(() => { c.style.opacity = 1; }, 400 + i * 100);
    });
  });
}

function renderWeightChartCard() {
  const history = State.data.weightHistory || [];
  const current = State.data.weightCurrent;
  const goal = State.data.weightGoal;
  if (!current) {
    return `
      <button class="card" style="margin-bottom:12px; width:100%; text-align:left;" data-nav="peso">
        <div style="display:flex; align-items:center; justify-content: space-between;">
          <div>
            <div class="eyebrow">Peso</div>
            <div style="font-size:16px; font-weight:700; margin-top:6px;">Registre seu primeiro peso</div>
            <div class="text-muted text-sm" style="margin-top:2px;">Comece a acompanhar sua evolução</div>
          </div>
          <div style="color: var(--ink-faint);">${ICON.chevronRight}</div>
        </div>
      </button>
    `;
  }
  const diff = goal ? (current - goal).toFixed(1) : null;
  return `
    <button class="card chart-card" style="margin-bottom:12px; width:100%; text-align:left; position: relative;" data-nav="peso">
      <div style="display:flex; justify-content: space-between; align-items: baseline;">
        <h4>Peso</h4>
        <span class="text-sm text-muted">${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
      </div>
      <div style="display:flex; align-items:baseline; gap: 8px; margin-top: 4px;">
        <div style="font-size:22px; font-weight:800;">${current} <small style="font-size:12px; color: var(--ink-muted); font-weight:600;">kg</small></div>
        ${goal ? `<div class="text-sm text-muted">Meta ${goal} kg${diff > 0 ? ' · faltam ' + Math.abs(diff) + ' kg' : ''}</div>` : ''}
      </div>
      ${renderWeightChart(history, goal)}
    </button>
  `;
}

function renderWeightChart(history, goal, opts = {}) {
  const tall = opts.tall === true;
  const w = 340, h = tall ? 220 : 140;
  const padL = 34, padR = 22;
  const padT = 22, padB = tall ? 34 : 26;
  if (!history || history.length < 1) return `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" style="height:${h}px;"></svg>`;
  const pts = history.slice(-14);
  const kgs = pts.map(p => p.kg);
  if (goal) kgs.push(goal);
  const minK = Math.min(...kgs) - 1;
  const maxK = Math.max(...kgs) + 1;
  const spanK = Math.max(0.5, maxK - minK);
  const xStep = (w - padL - padR) / Math.max(1, pts.length - 1);
  const yFor = (k) => padT + ((maxK - k) / spanK) * (h - padT - padB);
  const coords = pts.map((p, i) => ({ x: padL + i * xStep, y: yFor(p.kg), kg: p.kg, date: p.date }));
  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  // Area fill: line down to bottom
  const areaPath = coords.length > 1
    ? path + ` L${coords[coords.length - 1].x.toFixed(1)},${(h - padB).toFixed(1)} L${coords[0].x.toFixed(1)},${(h - padB).toFixed(1)} Z`
    : '';

  const gridLines = tall ? 5 : 4;
  const gridSvg = Array.from({ length: gridLines }, (_, i) => {
    const y = padT + (i * (h - padT - padB) / (gridLines - 1));
    const k = (maxK - (i * spanK / (gridLines - 1))).toFixed(1);
    return `<line class="grid-line" x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}"/>
            <text class="axis-txt" x="${padL - 6}" y="${y + 3}" text-anchor="end">${k}</text>`;
  }).join('');

  // X-axis date labels (only if tall)
  const dateLabels = tall && coords.length > 1 ? coords.map((c, i) => {
    // Only show a few labels to avoid clutter
    const step = Math.max(1, Math.floor(coords.length / 5));
    if (i % step !== 0 && i !== coords.length - 1) return '';
    const d = new Date(c.date);
    const label = String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0');
    return `<text class="axis-txt" x="${c.x.toFixed(1)}" y="${(h - padB + 16).toFixed(1)}" text-anchor="middle">${label}</text>`;
  }).join('') : '';

  const goalLine = goal ? `
    <line x1="${padL}" y1="${yFor(goal).toFixed(1)}" x2="${w - padR}" y2="${yFor(goal).toFixed(1)}"
      stroke="#6B9B6F" stroke-dasharray="4 4" stroke-width="1.5"/>
    <text class="axis-txt" x="${(w - padR - 2).toFixed(1)}" y="${(yFor(goal) - 4).toFixed(1)}" text-anchor="end" style="fill: #6B9B6F; font-weight: 700;">Meta ${goal}</text>
  ` : '';

  const currentPt = coords[coords.length - 1];
  const markers = coords.map((c, i) => {
    const isLast = i === coords.length - 1;
    return `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${isLast ? 5.5 : 3.5}" class="${isLast ? 'marker-current' : 'marker'}" stroke="#FFFDF7" stroke-width="2"/>`;
  }).join('');

  const currentLabel = `
    <rect x="${(currentPt.x - 26).toFixed(1)}" y="${(currentPt.y - 30).toFixed(1)}" width="52" height="22" rx="7" fill="var(--brand)"/>
    <text x="${currentPt.x.toFixed(1)}" y="${(currentPt.y - 15).toFixed(1)}" text-anchor="middle" fill="#FDECF3" style="font-size: 11px; font-weight: 700; font-family: var(--font);">${currentPt.kg} kg</text>
  `;

  return `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" style="height:${h}px;" preserveAspectRatio="none">
    <defs>
      <linearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#cf477e" stop-opacity="0.16"/>
        <stop offset="100%" stop-color="#cf477e" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${gridSvg}
    ${dateLabels}
    ${areaPath ? `<path d="${areaPath}" fill="url(#weightArea)" stroke="none"/>` : ''}
    ${goalLine}
    <path class="line" d="${path}"/>
    ${markers}
    ${currentLabel}
  </svg>`;
}

function renderWaterWeekCard() {
  const last7 = last7Dates();
  const today = todayISO();
  const totalToday = State.data.waterLog[today] || 0;
  const maxWater = DAILY_WATER_ML;

  const days = last7.map(iso => {
    const ml = State.data.waterLog[iso] || 0;
    const pct = Math.min(100, (ml / maxWater) * 100);
    return { iso, pct, isToday: iso === today };
  });

  return `
    <button class="week-card" data-nav="agua" style="width:100%; text-align:left; margin-bottom: 12px;">
      <div class="head">
        <div>
          <div class="title">Hidratação</div>
          <div class="value">${(totalToday / 1000).toFixed(1)}L <small>/ ${(maxWater / 1000).toFixed(1)}L</small></div>
        </div>
        <div class="icon-round">${ICON.water}</div>
      </div>
      <div class="days-row">
        ${days.map(d => `
          <div class="day-col ${d.isToday ? 'is-today' : ''}">
            <div class="bar"><div class="bar-fill" data-target="${d.pct}" style="height: 0%; background: linear-gradient(to top, #7BA9DB, #A5C4E9);"></div></div>
            <div class="lbl">${dayLetter(d.iso)}</div>
          </div>
        `).join('')}
      </div>
      <div class="footer">
        <span>Média semanal</span>
        <span><b>${weeklyAverage('waterLog', 1000)} L</b></span>
      </div>
    </button>
  `;
}

function renderCaloriesWeekCard() {
  const last7 = last7Dates();
  const today = todayISO();
  const target = goalToDailyCalorieTarget();
  const totalToday = dailyCalories(today);

  const days = last7.map(iso => {
    const kcal = dailyCalories(iso);
    const pct = Math.min(100, (kcal / target) * 100);
    return { iso, pct, isToday: iso === today };
  });

  return `
    <button class="week-card" data-nav="calorias" style="width:100%; text-align:left; margin-bottom: 12px;">
      <div class="head">
        <div>
          <div class="title">Calorias da refeição</div>
          <div class="value">${totalToday} <small>/ ${target} kcal</small></div>
        </div>
        <div class="icon-round">${ICON.apple}</div>
      </div>
      <div class="days-row">
        ${days.map(d => `
          <div class="day-col ${d.isToday ? 'is-today' : ''}">
            <div class="bar"><div class="bar-fill" data-target="${d.pct}" style="height: 0%; background: linear-gradient(to top, #cf477e, #f2a2c1);"></div></div>
            <div class="lbl">${dayLetter(d.iso)}</div>
          </div>
        `).join('')}
      </div>
      <div class="footer">
        <span>Média semanal</span>
        <span><b>${weeklyAverageCalories()} kcal</b></span>
      </div>
    </button>
  `;
}

function renderWorkoutWeekCard() {
  const last7 = last7Dates();
  const today = todayISO();
  const log = State.data.completionLog || {};
  // Fill in from lastCompletedDate as fallback if completionLog is empty for that day
  const currentDayW = window.WORKOUTS.find(w => w.day === currentDay());
  const target = currentDayW?.duration || 20;
  const doneToday = !!log[today];
  const minsToday = doneToday ? (window.WORKOUTS.find(w => w.day === log[today])?.duration || target) : 0;
  const doneCount = State.data.completedDays.length;

  const days = last7.map(iso => {
    const dayNum = log[iso];
    const dur = dayNum ? (window.WORKOUTS.find(w => w.day === dayNum)?.duration || 0) : 0;
    return { iso, pct: Math.min(100, (dur / target) * 100), isToday: iso === today, dur };
  });
  const weekTotal = days.reduce((s, d) => s + d.dur, 0);

  return `
    <div class="week-card">
      <div class="head">
        <div>
          <div class="title">Hora de treinar</div>
          <div class="value">${minsToday} <small>/ ${target} min</small></div>
        </div>
        <div class="icon-round">${ICON.dumbbell}</div>
      </div>
      <div class="days-row">
        ${days.map(d => `
          <div class="day-col ${d.isToday ? 'is-today' : ''}">
            <div class="bar"><div class="bar-fill bar-fill--brand" data-target="${d.pct}" style="height: 0%;"></div></div>
            <div class="lbl">${dayLetter(d.iso)}</div>
          </div>
        `).join('')}
      </div>
      <div class="footer">
        <span>Total do desafio · ${weekTotal} min esta semana</span>
        <span><b>${doneCount} treinos</b></span>
      </div>
    </div>
  `;
}

function last7Dates() {
  const out = [];
  const d = new Date(); d.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i--) {
    const x = new Date(d); x.setDate(d.getDate() - i);
    out.push(x.toISOString().slice(0, 10));
  }
  return out;
}
function dayLetter(iso) {
  const letters = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const dow = new Date(iso).getUTCDay();
  return letters[dow];
}
function dailyCalories(iso) {
  const m = State.data.calorieLog[iso];
  if (!m) return 0;
  return Object.values(m).reduce((a, b) => a + b, 0);
}
function weeklyAverage(field, div = 1) {
  const l7 = last7Dates();
  const vals = l7.map(d => State.data[field][d] || 0);
  const avg = vals.reduce((a, b) => a + b, 0) / 7;
  return (avg / div).toFixed(1);
}
function weeklyAverageCalories() {
  const l7 = last7Dates();
  const total = l7.reduce((sum, iso) => sum + dailyCalories(iso), 0);
  return Math.round(total / 7);
}

// ============================================================
// TREINOS (catalog · list · favorites)
// ============================================================

const TREINO_CATEGORIES = [
  {
    id: 'pilates',
    name: 'Pilates na Parede',
    count: 21,
    tint: 'linear-gradient(160deg, #EFE1C4, #D8C099)'
  }
];

function isFavorite(day) {
  return (State.data.favorites || []).includes(day);
}

function toggleFavorite(day) {
  const favs = new Set(State.data.favorites || []);
  if (favs.has(day)) favs.delete(day); else favs.add(day);
  State.patch({ favorites: [...favs].sort((a, b) => a - b) });
}

function renderTreinosCatalog() {
  const app = $('#app');
  app.innerHTML = '';
  const favCount = (State.data.favorites || []).length;

  const screen = el(`
    <div class="screen screen--nav">
      <div class="topbar">
        <div class="topbar__side"></div>
        <div class="topbar__title">Treinos</div>
        <div class="topbar__side">
          <button class="iconbtn" data-nav="favoritos" style="position: relative;">
            ${ICON.heartFilled}
            ${favCount ? `<span class="badge-dot">${favCount}</span>` : ''}
          </button>
        </div>
      </div>

      <p class="text-muted text-sm mb-4" style="padding: 0 4px;">Todos os treinos guiados no seu plano.</p>

      <div class="cat-list">
        ${TREINO_CATEGORIES.map(c => `
          <button class="cat-row" data-cat="${c.id}">
            <div class="cat-thumb" style="background: ${c.tint};">
              <div class="cat-thumb-img"></div>
            </div>
            <div class="cat-body">
              <div class="cat-name">${escape(c.name)}</div>
              <div class="cat-count">${c.count} treinos</div>
            </div>
            <div class="cat-arrow">${ICON.chevronRight}</div>
          </button>
        `).join('')}
      </div>
    </div>
  `);

  screen.querySelector('[data-nav="favoritos"]').addEventListener('click', () => nav('/favoritos'));
  screen.querySelectorAll('[data-cat]').forEach(b => {
    b.addEventListener('click', () => nav('/' + b.dataset.cat));
  });

  app.append(screen);
  app.append(bottomNav('treinos'));
}

function renderTreinosPilates() {
  const app = $('#app');
  app.innerHTML = '';

  const screen = el(`
    <div class="screen screen--nav">
      <div class="topbar">
        <div class="topbar__side"><button class="iconbtn" data-back>${ICON.arrowLeft}</button></div>
        <div class="topbar__title">Pilates na parede</div>
        <div class="topbar__side">
          <button class="iconbtn" data-nav="favoritos">${ICON.heartFilled}</button>
        </div>
      </div>

      <div class="eyebrow mb-2" style="padding: 0 4px;">${TOTAL_DAYS} treinos guiados</div>

      <div class="treino-list">
        ${window.WORKOUTS.map(w => renderWorkoutRow(w)).join('')}
      </div>
    </div>
  `);

  screen.querySelector('[data-back]').addEventListener('click', () => nav('/treinos'));
  screen.querySelector('[data-nav="favoritos"]').addEventListener('click', () => nav('/favoritos'));
  bindWorkoutRowEvents(screen);

  app.append(screen);
  app.append(bottomNav('treinos'));
}

function renderFavoritos() {
  const app = $('#app');
  app.innerHTML = '';
  const favs = State.data.favorites || [];
  const workouts = favs.map(d => window.WORKOUTS.find(w => w.day === d)).filter(Boolean);

  const screen = el(`
    <div class="screen screen--nav">
      <div class="topbar">
        <div class="topbar__side"><button class="iconbtn" data-back>${ICON.arrowLeft}</button></div>
        <div class="topbar__title">Favoritos</div>
        <div class="topbar__side"></div>
      </div>

      ${workouts.length === 0 ? `
        <div class="empty-state">
          <div class="empty-ico">${ICON.heartOutline}</div>
          <h3 style="margin-top: 14px;">Nenhum favorito ainda</h3>
          <p class="text-muted text-sm center mt-2" style="max-width: 300px; margin-left: auto; margin-right: auto;">
            Toque no coração nos treinos que quiser revisitar. Eles aparecem aqui pra você achar rápido.
          </p>
          <button class="btn mt-6" data-go-treinos>Ver todos os treinos</button>
        </div>
      ` : `
        <div class="eyebrow mb-2" style="padding: 0 4px;">${workouts.length} treino${workouts.length > 1 ? 's' : ''}</div>
        <div class="treino-list">
          ${workouts.map(w => renderWorkoutRow(w)).join('')}
        </div>
      `}
    </div>
  `);

  screen.querySelector('[data-back]').addEventListener('click', () => nav('/treinos'));
  screen.querySelector('[data-go-treinos]')?.addEventListener('click', () => nav('/pilates'));
  bindWorkoutRowEvents(screen);

  app.append(screen);
  app.append(bottomNav('treinos'));
}

function renderWorkoutRow(w) {
  const fav = isFavorite(w.day);
  const done = isDayDone(w.day);
  const locked = !isDayAvailable(w.day);
  return `
    <div class="treino-row ${done ? 'is-done' : ''} ${locked ? 'is-locked' : ''}">
      <button class="treino-open" data-open-day="${w.day}">
        <div class="treino-thumb">
          ${done ? `<div class="treino-thumb-badge treino-thumb-badge--done">${ICON.check}</div>` : ''}
          ${locked ? `<div class="treino-thumb-badge treino-thumb-badge--lock">${ICON.lock}</div>` : ''}
        </div>
        <div class="treino-info">
          <div class="treino-day">Dia ${w.day}</div>
          <div class="treino-name">${escape(w.title)}</div>
          <div class="treino-meta">${w.duration} min <span class="dot">·</span> ${escape(w.difficulty)}</div>
        </div>
      </button>
      <button class="treino-fav ${fav ? 'is-on' : ''}" data-fav="${w.day}" aria-label="Favoritar">
        ${fav ? ICON.heartFilled : ICON.heartOutline}
      </button>
      <div class="treino-arrow">${ICON.chevronRight}</div>
    </div>
  `;
}

function bindWorkoutRowEvents(root) {
  root.querySelectorAll('[data-open-day]').forEach(b => {
    b.addEventListener('click', () => {
      const d = Number(b.dataset.openDay);
      const r = dayLockReason(d);
      if (r === 'time') {
        toast(`Você já treinou hoje. O Dia ${d} libera ${nextUnlockLabel()}.`);
        return;
      }
      if (r === 'prereq') {
        toast('Complete o dia anterior para desbloquear');
        return;
      }
      nav('/dia/' + d);
    });
  });
  root.querySelectorAll('[data-fav]').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const d = Number(b.dataset.fav);
      toggleFavorite(d);
      const nowFav = isFavorite(d);
      b.classList.toggle('is-on', nowFav);
      b.innerHTML = nowFav ? ICON.heartFilled : ICON.heartOutline;
      toast(nowFav ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
    });
  });
}

// ============================================================
// MAIS (hub)
// ============================================================

function renderMais() {
  const app = $('#app');
  app.innerHTML = '';
  const name = State.data.name || 'Você';
  const level = currentLevel();
  const done = State.data.completedDays.length;

  const powerups = [
    { key: 'agua',     icon: ICON.water,    title: 'Beber água',        desc: 'Meta 2L / dia' },
    { key: 'calorias', icon: ICON.apple,    title: 'Registrar calorias', desc: 'Alimente-se com consciência' },
    { key: 'peso',     icon: ICON.scale,    title: 'Peso',               desc: 'Acompanhe sua evolução' }
  ];

  const configs = [
    { key: 'perfil',   icon: ICON.user, title: 'Editar perfil', desc: 'Nome, foto e medidas' },
    { key: 'about',    icon: ICON.info, title: 'Sobre o desafio', desc: 'Como funciona' },
    { key: 'help',     icon: ICON.help, title: 'Ajuda',           desc: 'Fale com a gente' }
  ];

  const screen = el(`
    <div class="screen screen--nav">
      <div class="topbar">
        <div class="topbar__side"></div>
        <div class="topbar__title">Mais</div>
        <div class="topbar__side">
          <button class="iconbtn theme-toggle" data-action="toggle-theme" aria-label="Alternar tema" title="Alternar tema">
            ${isDarkMode() ? ICON.sun : ICON.moon}
          </button>
        </div>
      </div>

      <button class="card" style="width:100%; display:flex; align-items:center; gap:14px; text-align:left; margin-bottom: 20px;" data-nav="perfil">
        <div class="avatar-lg" style="width:60px; height:60px; font-size:22px; flex-shrink:0;">
          ${avatarContent(name)}
        </div>
        <div style="flex:1; min-width:0;">
          <div style="font-size:17px; font-weight:700;">${escape(name)}</div>
          <div class="text-sm text-muted" style="text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">${escape(level.name)}</div>
          ${getCurrentEmail() ? `<div class="text-sm text-muted" style="font-size: 12px; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escape(getCurrentEmail())}</div>` : ''}
        </div>
        <div style="color: var(--ink-faint); flex-shrink:0;">${ICON.chevronRight}</div>
      </button>

      <div class="block-title">Seus Power-Ups</div>
      <div class="setting-list">
        ${powerups.map(p => `
          <button class="setting-row" data-nav="${p.key}">
            <div class="s-ico">${p.icon}</div>
            <div class="s-main">
              <div class="t">${p.title}</div>
              <div class="m">${p.desc}</div>
            </div>
            <div class="s-end">${ICON.chevronRight}</div>
          </button>
        `).join('')}
      </div>

      <div class="block-title">Configurações</div>
      <div class="setting-list">
        ${configs.map(c => `
          <button class="setting-row" data-config="${c.key}">
            <div class="s-ico">${c.icon}</div>
            <div class="s-main">
              <div class="t">${c.title}</div>
              <div class="m">${c.desc}</div>
            </div>
            <div class="s-end">${ICON.chevronRight}</div>
          </button>
        `).join('')}
      </div>

      <div class="block-title">Conta</div>
      <div class="setting-list">
        <button class="setting-row" data-action="logout">
          <div class="s-ico">${ICON.logout || ICON.reset}</div>
          <div class="s-main">
            <div class="t">Sair da conta</div>
            <div class="m">${escape(getCurrentEmail() || 'Você está conectado')}</div>
          </div>
          <div class="s-end">${ICON.chevronRight}</div>
        </button>
      </div>

      <div class="block-title">Zona de risco</div>
      <div class="setting-list">
        <button class="setting-row is-danger" data-action="reset">
          <div class="s-ico">${ICON.reset}</div>
          <div class="s-main">
            <div class="t">Reiniciar desafio</div>
            <div class="m">Apaga progresso e conquistas</div>
          </div>
          <div class="s-end">${ICON.chevronRight}</div>
        </button>
      </div>
    </div>
  `);

  screen.querySelectorAll('[data-nav]').forEach(b =>
    b.addEventListener('click', () => nav('/' + b.dataset.nav)));
  screen.querySelectorAll('[data-config]').forEach(b => {
    const c = b.dataset.config;
    b.addEventListener('click', () => {
      if (c === 'perfil') nav('/perfil');
      else if (c === 'about') showAboutModal();
      else if (c === 'help') toast('Suporte via chat em breve');
    });
  });
  screen.querySelector('[data-action="reset"]').addEventListener('click', showResetModal);
  screen.querySelector('[data-action="logout"]').addEventListener('click', showLogoutModal);
  screen.querySelector('[data-action="toggle-theme"]').addEventListener('click', () => {
    toggleTheme();
    renderMais();
  });

  app.append(screen);
  app.append(bottomNav('mais'));
}

// ============================================================
// PERFIL (edit profile)
// ============================================================

function renderProfile() {
  const app = $('#app');
  app.innerHTML = '';
  const name = State.data.name || 'Você';
  const level = currentLevel();

  const screen = el(`
    <div class="screen screen--nav">
      <div class="topbar">
        <div class="topbar__side"><button class="iconbtn" data-back>${ICON.arrowLeft}</button></div>
        <div class="topbar__title">Editar perfil</div>
        <div class="topbar__side"></div>
      </div>

      <div class="profile-hero">
        <label class="avatar-upload">
          <div class="avatar-lg">
            ${avatarContent(name)}
          </div>
          <div class="upload-badge">${ICON.camera}</div>
          <input type="file" accept="image/*" data-photo />
        </label>
        <div class="center">
          <div class="name">${escape(name)}</div>
          <div class="level-inline">
            <span class="chip chip--dark">${escape(level.tag)}</span>
            <span class="level-title">${escape(level.name)}</span>
          </div>
        </div>
      </div>

      <div class="block-title">Suas medidas</div>
      <div class="setting-list">
        <button class="setting-row" data-measure="weightCurrent">
          <div class="s-ico">${ICON.scale}</div>
          <div class="s-main">
            <div class="t">Peso atual</div>
            <div class="m">Toque para atualizar</div>
          </div>
          <div class="s-end" style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:15px; font-weight:700;">${State.data.weightCurrent ?? '—'}</span>
            <span class="text-sm text-muted">kg</span>
            ${ICON.chevronRight}
          </div>
        </button>
        <button class="setting-row" data-measure="weightGoal">
          <div class="s-ico">${ICON.target}</div>
          <div class="s-main">
            <div class="t">Meta de peso</div>
            <div class="m">Seu alvo pra jornada</div>
          </div>
          <div class="s-end" style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:15px; font-weight:700;">${State.data.weightGoal ?? '—'}</span>
            <span class="text-sm text-muted">kg</span>
            ${ICON.chevronRight}
          </div>
        </button>
        <button class="setting-row" data-measure="heightCm">
          <div class="s-ico">${ICON.ruler}</div>
          <div class="s-main">
            <div class="t">Altura</div>
            <div class="m">Toque para atualizar</div>
          </div>
          <div class="s-end" style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:15px; font-weight:700;">${State.data.heightCm ?? '—'}</span>
            <span class="text-sm text-muted">cm</span>
            ${ICON.chevronRight}
          </div>
        </button>
      </div>

      <div class="block-title">Perfil</div>
      <div class="setting-list">
        <button class="setting-row" data-action="edit-name">
          <div class="s-ico">${ICON.edit}</div>
          <div class="s-main">
            <div class="t">Nome</div>
            <div class="m">${escape(name)}</div>
          </div>
          <div class="s-end">${ICON.chevronRight}</div>
        </button>
        <button class="setting-row" data-action="toggle-reminders">
          <div class="s-ico">${ICON.bell}</div>
          <div class="s-main">
            <div class="t">Lembrete diário</div>
            <div class="m">Notificação todos os dias</div>
          </div>
          <div class="switch ${State.data.reminders ? 'is-on' : ''}"></div>
        </button>
      </div>
    </div>
  `);

  screen.querySelector('[data-back]').addEventListener('click', () => nav(backTargetForSubpage));

  // Photo upload
  const photoInput = screen.querySelector('[data-photo]');
  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast('Imagem muito grande (máx 2MB)'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      showPhotoPositioner(ev.target.result);
    };
    reader.readAsDataURL(file);
    // Reset input value so selecting the same file again still triggers change
    photoInput.value = '';
  });

  // Measurement rows → modal
  screen.querySelectorAll('[data-measure]').forEach(b => {
    b.addEventListener('click', () => showMeasureModal(b.dataset.measure));
  });

  screen.querySelectorAll('[data-action]').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.action === 'edit-name') showEditNameModal();
      else if (b.dataset.action === 'toggle-reminders') {
        State.patch({ reminders: !State.data.reminders });
        toast(State.data.reminders ? 'Lembretes ativados' : 'Lembretes desativados');
        renderProfile();
      }
    });
  });

  app.append(screen);
  app.append(bottomNav('mais'));
}

// ============================================================
// ÁGUA
// ============================================================

function renderAgua() {
  const app = $('#app');
  app.innerHTML = '';
  const today = todayISO();

  const screen = el(`
    <div class="screen screen--nav">
      <div class="topbar">
        <div class="topbar__side"><button class="iconbtn" data-back>${ICON.arrowLeft}</button></div>
        <div class="topbar__title">Beber água</div>
        <div class="topbar__side">
          <button class="iconbtn" data-clear aria-label="Zerar o dia" title="Zerar o dia">${ICON.reset}</button>
        </div>
      </div>

      <div class="big-value">
        <div class="num" data-water-num>0.0<span class="unit">L</span></div>
        <div class="meta" data-water-meta>Meta de ${(DAILY_WATER_ML / 1000).toFixed(1)}L · 0% do dia</div>
      </div>

      <div class="xp-bar"><div class="xp-bar__fill" data-water-fill style="width: 0%; background: linear-gradient(90deg, #7BA9DB, #A5C4E9);"></div></div>

      <div class="cup-grid">
        ${Array.from({length: 8}, (_, i) => `
          <div class="cup" data-cup="${i}">${ICON.cup}</div>
        `).join('')}
      </div>

      <div class="quick-adds">
        <button class="quick-add" data-add="200"><div class="qa-val">+200</div><div class="qa-lbl">ml</div></button>
        <button class="quick-add" data-add="250"><div class="qa-val">+250</div><div class="qa-lbl">ml</div></button>
        <button class="quick-add" data-add="500"><div class="qa-val">+500</div><div class="qa-lbl">ml</div></button>
      </div>

      <div data-water-week>
        ${renderWaterWeekCard()}
      </div>
    </div>
  `);

  const updateWaterUI = () => {
    const totalMl = State.data.waterLog[today] || 0;
    const cupsFilled = Math.min(8, Math.floor(totalMl / CUP_ML));
    const percent = Math.min(100, (totalMl / DAILY_WATER_ML) * 100);
    screen.querySelector('[data-water-num]').innerHTML = `${(totalMl / 1000).toFixed(1)}<span class="unit">L</span>`;
    screen.querySelector('[data-water-meta]').textContent = `Meta de ${(DAILY_WATER_ML / 1000).toFixed(1)}L · ${Math.round(percent)}% do dia`;
    screen.querySelector('[data-water-fill]').style.width = percent + '%';
    screen.querySelectorAll('[data-cup]').forEach((c, i) => {
      c.classList.toggle('is-full', i < cupsFilled);
    });
    // Update the weekly card
    const weekContainer = screen.querySelector('[data-water-week]');
    if (weekContainer) {
      weekContainer.innerHTML = renderWaterWeekCard();
      animateCharts(weekContainer);
    }
  };

  screen.querySelector('[data-back]').addEventListener('click', () => nav(backTargetForSubpage));
  screen.querySelectorAll('[data-add]').forEach(b => {
    b.addEventListener('click', () => {
      const add = Number(b.dataset.add);
      const log = { ...State.data.waterLog };
      log[today] = (log[today] || 0) + add;
      State.patch({ waterLog: log });
      toast('+' + add + ' ml');
      updateWaterUI();
    });
  });
  screen.querySelectorAll('[data-cup]').forEach((c, i) => {
    c.addEventListener('click', () => {
      const log = { ...State.data.waterLog };
      log[today] = (i + 1) * CUP_ML;
      State.patch({ waterLog: log });
      updateWaterUI();
    });
  });
  screen.querySelector('[data-clear]').addEventListener('click', () => {
    const log = { ...State.data.waterLog };
    delete log[today];
    State.patch({ waterLog: log });
    toast('Dia zerado');
    updateWaterUI();
  });

  app.append(screen);
  app.append(bottomNav('mais'));
  updateWaterUI();
  animateCharts(screen);
}

// ============================================================
// CALORIAS
// ============================================================

const MEALS = [
  { id: 'cafe',   name: 'Café da manhã', emoji: '🥐' },
  { id: 'almoco', name: 'Almoço',        emoji: '🥗' },
  { id: 'jantar', name: 'Jantar',        emoji: '🍲' },
  { id: 'lanche', name: 'Lanche',        emoji: '🍎' }
];

function renderCalorias() {
  const app = $('#app');
  app.innerHTML = '';
  const today = todayISO();
  const dayLog = State.data.calorieLog[today] || {};
  const target = goalToDailyCalorieTarget();
  const total = dailyCalories(today);
  const percent = Math.min(100, (total / target) * 100);
  const remaining = Math.max(0, target - total);

  const screen = el(`
    <div class="screen screen--nav">
      <div class="topbar">
        <div class="topbar__side"><button class="iconbtn" data-back>${ICON.arrowLeft}</button></div>
        <div class="topbar__title">Calorias</div>
        <div class="topbar__side"></div>
      </div>

      <div class="big-value">
        <div class="num">${total}<span class="unit">kcal</span></div>
        <div class="meta">Meta ${target} kcal · Restam ${remaining} kcal</div>
      </div>

      <div class="xp-bar"><div class="xp-bar__fill" style="width: ${percent}%;"></div></div>

      <div class="block-title" style="margin-top: 24px;">Refeições de hoje</div>
      <div class="meal-list">
        ${MEALS.map(m => {
          const val = dayLog[m.id] || 0;
          return `
            <button class="meal-row ${val ? '' : 'is-empty'}" data-meal="${m.id}">
              <div class="m-ico">${m.emoji}</div>
              <div class="m-main">
                <div class="n">${m.name}</div>
                <div class="k">${val ? 'Toque para editar' : 'Toque para registrar'}</div>
              </div>
              <div class="m-val">${val ? val + ' kcal' : '— kcal'}</div>
            </button>
          `;
        }).join('')}
      </div>

      <div class="mt-4">
        <button class="btn btn--ghost" data-clear>Zerar o dia</button>
      </div>
    </div>
  `);

  screen.querySelector('[data-back]').addEventListener('click', () => nav(backTargetForSubpage));
  screen.querySelectorAll('[data-meal]').forEach(b => {
    b.addEventListener('click', () => {
      const meal = b.dataset.meal;
      const mealDef = MEALS.find(m => m.id === meal);
      const current = dayLog[meal] || '';
      showMealModal(mealDef, current, (val) => {
        const log = { ...State.data.calorieLog };
        log[today] = { ...(log[today] || {}) };
        if (val > 0) log[today][meal] = val;
        else delete log[today][meal];
        State.patch({ calorieLog: log });
        renderCalorias();
      });
    });
  });
  screen.querySelector('[data-clear]').addEventListener('click', () => {
    const log = { ...State.data.calorieLog };
    delete log[today];
    State.patch({ calorieLog: log });
    toast('Dia zerado');
    renderCalorias();
  });

  app.append(screen);
  app.append(bottomNav('mais'));
}

function showMealModal(meal, current, onSave) {
  const m = showModal(`
    <h3>${meal.emoji} ${meal.name}</h3>
    <p>Quantas calorias você consumiu?</p>
    <input type="number" class="ob__input" placeholder="Ex: 350" value="${current}" min="0" max="4000" />
    <div class="row" style="margin-top:16px;">
      <button class="btn btn--ghost" data-cancel>Cancelar</button>
      <button class="btn" data-save>Salvar</button>
    </div>
  `);
  const input = m.querySelector('input');
  setTimeout(() => input.focus(), 50);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') m.querySelector('[data-save]').click(); });
  m.querySelector('[data-cancel]').addEventListener('click', () => m.remove());
  m.querySelector('[data-save]').addEventListener('click', () => {
    const val = Number(input.value) || 0;
    onSave(val);
    m.remove();
  });
}

// ============================================================
// PESO
// ============================================================

function renderPeso() {
  const app = $('#app');
  app.innerHTML = '';
  const cur = State.data.weightCurrent;
  const goal = State.data.weightGoal;
  const history = State.data.weightHistory || [];
  const first = history[0]?.kg;
  const diff = first && cur ? (cur - first).toFixed(1) : null;
  const toGoal = goal && cur ? (cur - goal).toFixed(1) : null;

  const screen = el(`
    <div class="screen screen--nav">
      <div class="topbar">
        <div class="topbar__side"><button class="iconbtn" data-back>${ICON.arrowLeft}</button></div>
        <div class="topbar__title">Peso</div>
        <div class="topbar__side"></div>
      </div>

      ${cur ? `
        <div class="big-value">
          <div class="num">${cur}<span class="unit">kg</span></div>
          <div class="meta">
            ${diff !== null ? `${diff > 0 ? '+' : ''}${diff} kg desde o início` : 'Primeiro registro'}
            ${toGoal !== null ? ` · Meta ${goal} kg` : ''}
          </div>
        </div>
      ` : `
        <div class="big-value">
          <div class="num" style="font-size: 30px;">Registre seu peso</div>
          <div class="meta">Comece a acompanhar sua evolução</div>
        </div>
      `}

      <div class="card chart-card" style="position: relative;">
        <div style="display:flex; justify-content: space-between; align-items: baseline;">
          <h4>Histórico</h4>
          <span class="text-sm text-muted">${history.length} registro${history.length !== 1 ? 's' : ''}</span>
        </div>
        ${renderWeightChart(history, goal, { tall: true })}
        ${history.length > 1 ? `
          <div style="display:flex; justify-content: space-between; font-size:12px; color: var(--ink-muted); margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-soft);">
            <span>Início: <b style="color:var(--ink);">${history[0].kg} kg</b></span>
            <span>Atual: <b style="color:var(--ink);">${history[history.length-1].kg} kg</b></span>
            <span>Δ ${(history[history.length-1].kg - history[0].kg > 0 ? '+' : '')}${(history[history.length-1].kg - history[0].kg).toFixed(1)} kg</span>
          </div>
        ` : ''}
      </div>

      <div class="block-title">Registrar peso de hoje</div>
      <div class="card">
        <div style="display:flex; gap: 10px; align-items: center;">
          <input type="number" class="ob__input" step="0.1" min="30" max="200" placeholder="0.0" id="pesoInput" style="flex: 1;" />
          <span class="text-muted" style="font-weight:700;">kg</span>
        </div>
        <button class="btn" data-save style="margin-top: 12px;">Registrar</button>
      </div>

      <div class="block-title">Meta</div>
      <div class="card">
        <div style="display:flex; align-items: center; justify-content: space-between;">
          <div>
            <div class="eyebrow">Meta de peso</div>
            <div style="font-size:22px; font-weight:800; margin-top:2px;">${goal || '—'} <small style="font-size:12px; color:var(--ink-muted); font-weight:600;">kg</small></div>
          </div>
          <button class="btn btn--ghost btn--sm" data-edit-goal style="width: auto;">Editar</button>
        </div>
      </div>
    </div>
  `);

  screen.querySelector('[data-back]').addEventListener('click', () => nav(backTargetForSubpage));
  const inp = screen.querySelector('#pesoInput');
  inp?.addEventListener('keydown', e => { if (e.key === 'Enter') screen.querySelector('[data-save]').click(); });
  screen.querySelector('[data-save]').addEventListener('click', () => {
    const v = Number(inp.value);
    if (!v || v < 30 || v > 200) { toast('Insira um peso válido'); return; }
    const today = todayISO();
    const hist = [...(State.data.weightHistory || [])];
    const existing = hist.findIndex(h => h.date === today);
    if (existing >= 0) hist[existing] = { date: today, kg: v };
    else hist.push({ date: today, kg: v });
    State.patch({ weightCurrent: v, weightHistory: hist });
    toast('Peso registrado');
    renderPeso();
  });
  screen.querySelector('[data-edit-goal]').addEventListener('click', () => {
    const m = showModal(`
      <h3>Meta de peso</h3>
      <p>Qual é seu alvo?</p>
      <input type="number" class="ob__input" step="0.1" min="30" max="200" placeholder="Ex: 60" value="${goal ?? ''}" />
      <div class="row" style="margin-top:16px;">
        <button class="btn btn--ghost" data-cancel>Cancelar</button>
        <button class="btn" data-save>Salvar</button>
      </div>
    `);
    const input = m.querySelector('input');
    setTimeout(() => input.focus(), 50);
    m.querySelector('[data-cancel]').addEventListener('click', () => m.remove());
    m.querySelector('[data-save]').addEventListener('click', () => {
      const v = Number(input.value);
      if (v >= 30 && v <= 200) State.patch({ weightGoal: v });
      m.remove();
      renderPeso();
    });
  });

  app.append(screen);
  app.append(bottomNav('mais'));
  animateCharts(screen);
}

// ============================================================
// DESAFIOS (store)
// ============================================================

function renderDesafios() {
  const app = $('#app');
  app.innerHTML = '';
  const added = State.data.addedChallenges || [];

  const screen = el(`
    <div class="screen screen--nav">
      <div class="topbar">
        <div class="topbar__side"><button class="iconbtn" data-back>${ICON.arrowLeft}</button></div>
        <div class="topbar__title">Desafios extras</div>
        <div class="topbar__side"></div>
      </div>

      <p class="text-muted text-sm mb-4" style="padding: 0 4px;">Amplie sua jornada com desafios adicionais focados em objetivos específicos.</p>

      ${CHALLENGES.map(c => {
        const isAdded = added.includes(c.id);
        return `
          <div class="challenge-card ${isAdded ? 'is-added' : ''}">
            <div class="banner banner-${c.banner}" style="position: relative;">
              <span>${c.emoji}</span>
              ${isAdded ? `<div class="add-badge">${ICON.check} No seu plano</div>` : ''}
            </div>
            <div class="body">
              <div class="subhead"><b>${c.days} Dias</b> · ${c.title}</div>
              <div class="name">${escape(c.title)}</div>
              <div class="stats-row">
                <span>${c.participants}</span>
                <span>·</span>
                <span class="price">${c.price}</span>
              </div>
              <div class="actions">
                <button class="btn btn--ghost" data-info="${c.id}" style="width:auto; flex: 1;">Detalhes</button>
                ${isAdded
                  ? `<button class="btn btn--ghost" data-remove="${c.id}" style="width:auto; flex: 1;">Remover</button>`
                  : `<button class="btn" data-add="${c.id}" style="width:auto; flex: 1;">Adicionar</button>`
                }
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `);

  screen.querySelector('[data-back]').addEventListener('click', () => nav(backTargetForSubpage));
  screen.querySelectorAll('[data-info]').forEach(b => {
    b.addEventListener('click', () => showChallengeModal(b.dataset.info));
  });
  screen.querySelectorAll('[data-add]').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.dataset.add;
      const c = CHALLENGES.find(x => x.id === id);
      showBuyModal(c);
    });
  });
  screen.querySelectorAll('[data-remove]').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.dataset.remove;
      const list = State.data.addedChallenges.filter(x => x !== id);
      State.patch({ addedChallenges: list });
      toast('Desafio removido');
      renderDesafios();
    });
  });

  app.append(screen);
  app.append(bottomNav('mais'));
}

function showChallengeModal(id) {
  const c = CHALLENGES.find(x => x.id === id);
  const isAdded = State.data.addedChallenges.includes(id);
  const m = showModal(`
    <h3>${c.emoji} ${escape(c.title)}</h3>
    <p>${escape(c.desc)}</p>
    <div style="background: var(--bg-elevated); padding: 12px 14px; border-radius: 12px; margin-bottom: 14px;">
      <div class="text-xs text-muted" style="font-weight: 700; text-transform: uppercase;">O que está incluso</div>
      <div style="margin-top: 6px;">
        ${c.features.map(f => `<div style="display:flex; gap: 8px; padding: 4px 0; font-size: 13px;"><span style="color: #6B9B6F;">${ICON.check}</span> ${escape(f)}</div>`).join('')}
      </div>
    </div>
    <div class="row">
      <button class="btn btn--ghost" data-cancel>Fechar</button>
      ${isAdded
        ? `<button class="btn btn--ghost" data-remove>Remover</button>`
        : `<button class="btn" data-buy>Adicionar · ${c.price}</button>`
      }
    </div>
  `);
  m.querySelector('[data-cancel]').addEventListener('click', () => m.remove());
  m.querySelector('[data-buy]')?.addEventListener('click', () => { m.remove(); showBuyModal(c); });
  m.querySelector('[data-remove]')?.addEventListener('click', () => {
    const list = State.data.addedChallenges.filter(x => x !== id);
    State.patch({ addedChallenges: list });
    m.remove();
    renderDesafios();
  });
}

function showBuyModal(c) {
  const m = showModal(`
    <h3>Adicionar ao seu plano</h3>
    <p>Confirmação simulada. Em produção, aqui entraria o checkout.</p>
    <div style="background: var(--bg-elevated); padding: 14px; border-radius: 12px; display:flex; align-items:center; gap: 12px; margin-bottom: 14px;">
      <div style="width: 44px; height: 44px; border-radius: 12px; background: var(--bg-muted); display:flex; align-items:center; justify-content:center; font-size: 22px;">${c.emoji}</div>
      <div style="flex: 1;">
        <div style="font-weight: 700;">${escape(c.title)}</div>
        <div class="text-sm text-muted">${c.days} dias · ${c.price}</div>
      </div>
    </div>
    <div class="row">
      <button class="btn btn--ghost" data-cancel>Cancelar</button>
      <button class="btn" data-confirm>Confirmar</button>
    </div>
  `);
  m.querySelector('[data-cancel]').addEventListener('click', () => m.remove());
  m.querySelector('[data-confirm]').addEventListener('click', () => {
    const list = [...State.data.addedChallenges, c.id];
    State.patch({ addedChallenges: list });
    m.remove();
    toast('Desafio adicionado ao plano');
    renderDesafios();
  });
}

// ============================================================
// IMMERSIVE WORKOUT MODE (/treinar/:day)
// ============================================================

// Session state
let TrainingCtx = null;

function parseSecs(s) {
  if (!s) return 30;
  const str = String(s).toLowerCase();
  const m = /(\d+)\s*(min|s|seg|segundo)/i.exec(str);
  if (!m) return 30;
  const n = Number(m[1]);
  return /min/i.test(m[2]) ? n * 60 : n;
}

function flatExercises(w) {
  return [
    ...w.warmup.map(e => ({ ...e, phase: 'AQUECIMENTO' })),
    ...w.exercises.map(e => ({ ...e, phase: 'TREINO PRINCIPAL' })),
    ...w.cooldown.map(e => ({ ...e, phase: 'FINALIZAÇÃO' }))
  ].map(e => ({ ...e, secs: parseSecs(e.dur) }));
}

function stopTraining() {
  if (TrainingCtx?.interval) clearInterval(TrainingCtx.interval);
  TrainingCtx = null;
}

function renderTreinar(dayParam) {
  const day = Number(dayParam);
  const w = window.WORKOUTS.find(x => x.day === day);
  if (!w) return nav('/plano');
  if (!isDayAvailable(day)) return nav('/plano');
  if (isDayDone(day)) return nav('/dia/' + day);

  stopTraining();
  const exercises = flatExercises(w);
  TrainingCtx = {
    day, exercises,
    index: 0,
    timeLeft: exercises[0].secs,
    elapsed: 0,
    paused: false,
    interval: null
  };

  const app = $('#app');
  app.innerHTML = '';

  // Loading screen (1.4s), then start the workout
  const loading = el(`
    <div class="workout-loading">
      <div class="content">
        <h2>Preparando<br/>seu treino</h2>
        <div class="dots"><span></span><span></span><span></span></div>
      </div>
    </div>
  `);
  app.append(loading);

  setTimeout(() => {
    if (!TrainingCtx || TrainingCtx.day !== day) return;
    loading.remove();
    mountWorkout();
  }, 1400);
}

function mountWorkout() {
  const ctx = TrainingCtx;
  if (!ctx) return;
  const app = $('#app');
  app.innerHTML = '';

  const screen = el(`
    <div class="workout" id="workoutScreen">
      <div class="workout__media">
        <div class="workout__top">
          <button class="workout__close" data-close aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <button class="workout__close" data-pause aria-label="Pausar">
            <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
          </button>
        </div>
        <div class="workout__caption">
          <div>
            <div class="phase" data-phase></div>
            <div class="timer" data-timer>0:00</div>
            <div class="exname" data-exname></div>
          </div>
          <button class="skip" data-skip>Pular</button>
        </div>
      </div>
      <div class="workout__panel">
        <div class="progress-dots" data-dots></div>
        <div class="workout__stats">
          <div class="col">
            <div class="v" data-elapsed>0:00</div>
            <div class="l">Esgotado</div>
          </div>
          <div class="divider"></div>
          <div class="col">
            <div class="v" data-kcal>0</div>
            <div class="l">Kcal</div>
          </div>
        </div>
        <div class="workout__nav">
          <button class="btn-nav" data-prev>Anterior</button>
          <button class="btn-nav is-primary" data-next>Próximo</button>
        </div>
        <div class="workout__next-card" data-next-card>
          <div class="thumb"></div>
          <div class="info">
            <div class="k">A seguir · <span data-next-phase>—</span></div>
            <div class="n" data-next-name>—</div>
            <div class="meta">
              <span class="meta-chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span data-next-dur>—</span></span>
              <span class="meta-chip meta-chip--reps" data-next-reps-wrap style="display:none;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H4M12 4v16M6 8l-2 4 2 4M18 8l2 4-2 4"/></svg><span data-next-reps>—</span></span>
            </div>
          </div>
          <div class="counter" data-next-counter>—</div>
        </div>
      </div>
    </div>
  `);
  app.append(screen);

  // Bind controls
  screen.querySelector('[data-close]').addEventListener('click', confirmCloseWorkout);
  screen.querySelector('[data-pause]').addEventListener('click', togglePauseWorkout);
  screen.querySelector('[data-skip]').addEventListener('click', () => advanceWorkout(1));
  screen.querySelector('[data-prev]').addEventListener('click', () => advanceWorkout(-1));
  screen.querySelector('[data-next]').addEventListener('click', () => advanceWorkout(1));

  renderProgressDots();
  paintExercise();
  startWorkoutTicker();
}

function startWorkoutTicker() {
  const ctx = TrainingCtx;
  if (!ctx) return;
  if (ctx.interval) clearInterval(ctx.interval);
  ctx.interval = setInterval(() => {
    if (!TrainingCtx || TrainingCtx.paused) return;
    TrainingCtx.timeLeft -= 1;
    TrainingCtx.elapsed += 1;
    if (TrainingCtx.timeLeft <= 0) {
      advanceWorkout(1);
    } else {
      paintTimer();
    }
  }, 1000);
}

function paintTimer() {
  const ctx = TrainingCtx;
  if (!ctx) return;
  const timerEl = $('#workoutScreen [data-timer]');
  const elapsedEl = $('#workoutScreen [data-elapsed]');
  const kcalEl = $('#workoutScreen [data-kcal]');
  if (timerEl) timerEl.textContent = fmtTime(ctx.timeLeft);
  if (elapsedEl) elapsedEl.textContent = fmtTime(ctx.elapsed);
  // rough estimate: pilates ~ 5 kcal/min
  if (kcalEl) kcalEl.textContent = Math.round((ctx.elapsed / 60) * 5);
}

function exerciseVideoUrl(ex) {
  const base = window.APP_CONFIG?.videosBase;
  if (!base || !ex || !ex.video) return null;
  return base.replace(/\/+$/, '') + '/' + ex.video;
}

function paintWorkoutVideo(cur) {
  const media = $('#workoutScreen .workout__media');
  if (!media) return;
  let vid = media.querySelector('.workout__video');
  const url = exerciseVideoUrl(cur);
  if (!url) { if (vid) vid.remove(); return; }
  if (!vid) {
    vid = document.createElement('video');
    vid.className = 'workout__video';
    vid.muted = true;
    vid.loop = true;
    vid.autoplay = true;
    vid.playsInline = true;
    vid.setAttribute('playsinline', '');
    vid.setAttribute('webkit-playsinline', '');
    vid.preload = 'auto';
    media.prepend(vid);
  }
  if (vid.getAttribute('src') !== url) {
    vid.setAttribute('src', url);
    vid.play().catch(() => {});
  }
}

function paintExercise() {
  const ctx = TrainingCtx;
  if (!ctx) return;
  const cur = ctx.exercises[ctx.index];
  const next = ctx.exercises[ctx.index + 1];
  const scr = $('#workoutScreen');
  if (!scr) return;
  paintWorkoutVideo(cur);
  scr.querySelector('[data-phase]').textContent = cur.phase;
  scr.querySelector('[data-exname]').textContent = cur.name;
  scr.querySelector('[data-timer]').textContent = fmtTime(ctx.timeLeft);
  const nextCard = scr.querySelector('[data-next-card]');
  if (next) {
    nextCard.style.display = '';
    scr.querySelector('[data-next-name]').textContent = next.name;
    scr.querySelector('[data-next-dur]').textContent = fmtTime(next.secs);
    scr.querySelector('[data-next-phase]').textContent = next.phase.charAt(0) + next.phase.slice(1).toLowerCase();
    const repsWrap = scr.querySelector('[data-next-reps-wrap]');
    if (next.reps) {
      repsWrap.style.display = '';
      scr.querySelector('[data-next-reps]').textContent = next.reps;
    } else {
      repsWrap.style.display = 'none';
    }
    // Counter: how many exercises remain including next
    const remaining = ctx.exercises.length - (ctx.index + 1);
    scr.querySelector('[data-next-counter]').textContent = (ctx.index + 2) + '/' + ctx.exercises.length;
  } else {
    nextCard.style.display = 'none';
  }
  scr.querySelector('[data-prev]').disabled = ctx.index === 0;
  scr.querySelector('[data-next]').textContent = (ctx.index === ctx.exercises.length - 1) ? 'Finalizar' : 'Próximo';
  renderProgressDots();
  paintTimer();
}

function renderProgressDots() {
  const ctx = TrainingCtx;
  const container = $('#workoutScreen [data-dots]');
  if (!ctx || !container) return;
  container.innerHTML = ctx.exercises.map((_, i) => {
    let cls = '';
    if (i < ctx.index) cls = 'is-done';
    else if (i === ctx.index) cls = 'is-current';
    return `<span class="dot ${cls}"></span>`;
  }).join('');
}

function advanceWorkout(delta) {
  const ctx = TrainingCtx;
  if (!ctx) return;
  const nextIdx = ctx.index + delta;
  if (nextIdx < 0) return;
  if (nextIdx >= ctx.exercises.length) {
    finishWorkout();
    return;
  }
  ctx.index = nextIdx;
  ctx.timeLeft = ctx.exercises[nextIdx].secs;
  paintExercise();
}

function togglePauseWorkout() {
  const ctx = TrainingCtx;
  if (!ctx) return;
  ctx.paused = !ctx.paused;
  const scr = $('#workoutScreen');
  const existing = scr.querySelector('.workout__pause');
  if (existing) existing.remove();
  if (ctx.paused) {
    const overlay = el('<div class="workout__pause">Pausado</div>');
    overlay.addEventListener('click', togglePauseWorkout);
    scr.querySelector('.workout__media').appendChild(overlay);
  }
}

function confirmCloseWorkout() {
  const ctx = TrainingCtx;
  if (!ctx) return;
  const m = showModal(`
    <h3>Sair do treino?</h3>
    <p>Seu progresso desta sessão não será salvo.</p>
    <div class="row">
      <button class="btn btn--ghost" data-cancel>Continuar treinando</button>
      <button class="btn" data-confirm style="background: var(--danger);">Sair</button>
    </div>
  `);
  m.querySelector('[data-cancel]').addEventListener('click', () => m.remove());
  m.querySelector('[data-confirm]').addEventListener('click', () => {
    m.remove();
    const day = ctx.day;
    stopTraining();
    nav('/dia/' + day);
  });
}

function finishWorkout() {
  const ctx = TrainingCtx;
  if (!ctx) return;
  const day = ctx.day;
  stopTraining();
  // Auto-mark day as done and show celebration
  completeDay(day);
}

function fmtTime(secs) {
  secs = Math.max(0, Math.round(secs));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Clean up training if user navigates away
window.addEventListener('hashchange', () => {
  const hash = location.hash.replace('#', '');
  if (!hash.startsWith('/treinar') && TrainingCtx) stopTraining();
});

// ============================================================
// Modals
// ============================================================

function showModal(inner) {
  const back = el(`<div class="modal-back"><div class="modal"><div class="grabber"></div>${inner}</div></div>`);
  back.addEventListener('click', e => { if (e.target === back) back.remove(); });
  document.body.appendChild(back);
  return back;
}

function showPhotoPositioner(dataUrl) {
  const CIRCLE_SIZE = 260; // display size of the crop circle
  const OUTPUT = 480; // canvas output resolution
  let posX = 0, posY = 0, zoom = 1, rotation = 0;
  let baseScale = 1;

  const m = showModal(`
    <div class="crop-header">
      <h3 style="margin: 0;">Editar imagem</h3>
      <button class="crop-close" data-cancel aria-label="Fechar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="crop-viewport" data-crop-viewport>
      <img data-crop-img src="${escape(dataUrl)}" draggable="false" alt="" />
      <div class="crop-mask" style="--size: ${CIRCLE_SIZE}px;"></div>
    </div>
    <div class="crop-controls">
      <span class="crop-ico crop-ico--sm" aria-hidden="true">${ICON.camera}</span>
      <input type="range" min="1" max="3" step="0.02" value="1" data-zoom class="crop-slider" />
      <span class="crop-ico crop-ico--lg" aria-hidden="true">${ICON.camera}</span>
      <button class="crop-rotate" data-rotate aria-label="Rotacionar">${ICON.reset}</button>
    </div>
    <div class="row" style="margin-top:16px;">
      <button class="btn btn--ghost" data-cancel>Cancelar</button>
      <button class="btn" data-save>Salvar</button>
    </div>
  `);

  const viewport = m.querySelector('[data-crop-viewport]');
  const img = m.querySelector('[data-crop-img]');
  const zoomInput = m.querySelector('[data-zoom]');

  const applyTransform = () => {
    img.style.transform = `translate(-50%, -50%) translate(${posX}px, ${posY}px) rotate(${rotation}deg) scale(${zoom})`;
  };

  const clampPos = () => {
    // Ensure the visible area still covers the circle
    const dispW = img.naturalWidth * baseScale * zoom;
    const dispH = img.naturalHeight * baseScale * zoom;
    const maxX = Math.max(0, (dispW - CIRCLE_SIZE) / 2);
    const maxY = Math.max(0, (dispH - CIRCLE_SIZE) / 2);
    posX = Math.max(-maxX, Math.min(maxX, posX));
    posY = Math.max(-maxY, Math.min(maxY, posY));
  };

  img.onload = () => {
    baseScale = Math.max(CIRCLE_SIZE / img.naturalWidth, CIRCLE_SIZE / img.naturalHeight);
    img.style.width = img.naturalWidth + 'px';
    img.style.height = img.naturalHeight + 'px';
    zoom = 1;
    posX = 0; posY = 0;
    applyTransform();
  };
  // Trigger onload if image was cached
  if (img.complete) img.onload();

  // Drag
  let dragging = false, startX = 0, startY = 0, startPosX = 0, startPosY = 0;
  const onDown = (e) => {
    dragging = true;
    const p = e.touches?.[0] || e;
    startX = p.clientX; startY = p.clientY;
    startPosX = posX; startPosY = posY;
    viewport.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  };
  const onMove = (e) => {
    if (!dragging) return;
    const p = e.touches?.[0] || e;
    posX = startPosX + (p.clientX - startX);
    posY = startPosY + (p.clientY - startY);
    clampPos();
    applyTransform();
  };
  const onUp = () => { dragging = false; };

  viewport.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  // Zoom
  zoomInput.addEventListener('input', (e) => {
    zoom = Number(e.target.value);
    clampPos();
    applyTransform();
  });

  // Rotate
  m.querySelector('[data-rotate]').addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    // Reset position on rotate to avoid weird crops
    posX = 0; posY = 0;
    applyTransform();
  });

  const cleanup = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };

  m.querySelectorAll('[data-cancel]').forEach(b => {
    b.addEventListener('click', () => { cleanup(); m.remove(); });
  });

  m.querySelector('[data-save]').addEventListener('click', () => {
    // If image not yet loaded, fall back to saving raw
    if (!img.naturalWidth) {
      State.patch({ photoUrl: dataUrl, photoPosX: 50, photoPosY: 50 });
      cleanup();
      m.remove();
      toast('Foto atualizada');
      renderProfile();
      return;
    }
    // Canvas crop
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT; canvas.height = OUTPUT;
    const ctx = canvas.getContext('2d');

    // Pre-rotate to an intermediate canvas if needed
    let src = img;
    let srcW = img.naturalWidth, srcH = img.naturalHeight;
    if (rotation !== 0) {
      const rot = document.createElement('canvas');
      const swap = rotation === 90 || rotation === 270;
      rot.width = swap ? img.naturalHeight : img.naturalWidth;
      rot.height = swap ? img.naturalWidth : img.naturalHeight;
      const rctx = rot.getContext('2d');
      rctx.translate(rot.width / 2, rot.height / 2);
      rctx.rotate(rotation * Math.PI / 180);
      rctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      src = rot;
      srcW = rot.width; srcH = rot.height;
    }

    // Recompute base scale (may be different after rotation swaps dims)
    const rotBase = Math.max(CIRCLE_SIZE / srcW, CIRCLE_SIZE / srcH);
    const totalScale = rotBase * zoom;
    const dispW = srcW * totalScale;
    const dispH = srcH * totalScale;

    // Region of the source (in natural pixels of `src`) visible in the circle
    const sx = ((dispW - CIRCLE_SIZE) / 2 - posX) / totalScale;
    const sy = ((dispH - CIRCLE_SIZE) / 2 - posY) / totalScale;
    const sw = CIRCLE_SIZE / totalScale;
    const sh = CIRCLE_SIZE / totalScale;

    // Fill canvas (opaque bg in case of transparent images)
    ctx.fillStyle = '#cf477e';
    ctx.fillRect(0, 0, OUTPUT, OUTPUT);
    ctx.drawImage(src, sx, sy, sw, sh, 0, 0, OUTPUT, OUTPUT);

    const cropped = canvas.toDataURL('image/jpeg', 0.9);
    State.patch({ photoUrl: cropped, photoPosX: 50, photoPosY: 50 });
    cleanup();
    m.remove();
    toast('Foto atualizada');
    renderProfile();
  });
}

function showMeasureModal(field) {
  const config = {
    weightCurrent: { title: 'Peso atual',   unit: 'kg', min: 30,  max: 200, step: 0.1 },
    weightGoal:    { title: 'Meta de peso', unit: 'kg', min: 30,  max: 200, step: 0.1 },
    heightCm:      { title: 'Altura',       unit: 'cm', min: 120, max: 220, step: 1   }
  }[field];
  const current = State.data[field] ?? '';
  const m = showModal(`
    <h3>${config.title}</h3>
    <p>Toque em Salvar depois de digitar o novo valor.</p>
    <div style="display:flex; gap: 10px; align-items: center;">
      <input type="number" class="ob__input" step="${config.step}" min="${config.min}" max="${config.max}" placeholder="0" value="${current}" style="flex:1;" inputmode="decimal" />
      <span class="text-muted" style="font-weight:700;">${config.unit}</span>
    </div>
    <div class="row" style="margin-top:16px;">
      <button class="btn btn--ghost" data-cancel>Cancelar</button>
      <button class="btn" data-save>Salvar</button>
    </div>
  `);
  const input = m.querySelector('input');
  setTimeout(() => { input.focus(); input.select(); }, 50);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') m.querySelector('[data-save]').click(); });
  m.querySelector('[data-cancel]').addEventListener('click', () => m.remove());
  m.querySelector('[data-save]').addEventListener('click', () => {
    const v = Number(input.value);
    if (!v || v < config.min || v > config.max) { toast('Valor inválido'); return; }
    const patch = { [field]: v };
    if (field === 'weightCurrent') {
      const today = todayISO();
      const history = [...(State.data.weightHistory || [])];
      const existing = history.findIndex(h => h.date === today);
      if (existing >= 0) history[existing] = { date: today, kg: v };
      else history.push({ date: today, kg: v });
      patch.weightHistory = history;
    }
    State.patch(patch);
    m.remove();
    toast(config.title + ' atualizado');
    renderProfile();
  });
}

function showEditNameModal() {
  const m = showModal(`
    <h3>Editar nome</h3>
    <p>Como quer ser chamada no app?</p>
    <input type="text" class="ob__input" maxlength="20" value="${escape(State.data.name)}" />
    <div class="row" style="margin-top:16px;">
      <button class="btn btn--ghost" data-cancel>Cancelar</button>
      <button class="btn" data-save>Salvar</button>
    </div>
  `);
  const input = m.querySelector('input');
  setTimeout(() => input.focus(), 50);
  m.querySelector('[data-cancel]').addEventListener('click', () => m.remove());
  m.querySelector('[data-save]').addEventListener('click', () => {
    const v = input.value.trim();
    if (v) { State.patch({ name: v }); toast('Nome atualizado'); }
    m.remove();
    renderProfile();
  });
}

function showAboutModal() {
  const m = showModal(`
    <h3>Sobre o desafio</h3>
    <p>21 dias de Pilates na Parede. Cada dia libera o próximo — você define o ritmo, mas nunca pula etapas.</p>
    <p><strong>Como pontua:</strong> +100 XP por treino, bônus em sequência e nos marcos (7, 14, 21). Cada nível desbloqueia um novo título.</p>
    <p><strong>Power-ups:</strong> hidratação, calorias e peso te ajudam a se conhecer melhor.</p>
    <p><strong>Desafios extras:</strong> amplie sua jornada com desafios adicionais focados em objetivos específicos.</p>
    <div class="row" style="margin-top:16px;">
      <button class="btn" data-close>Entendi</button>
    </div>
  `);
  m.querySelector('[data-close]').addEventListener('click', () => m.remove());
}

let _cachedEmail = null;
function getCurrentEmail() {
  if (_cachedEmail) return _cachedEmail;
  if (window.Auth) {
    window.Auth.getUser().then(u => {
      if (u?.email) { _cachedEmail = u.email; }
    });
  }
  return _cachedEmail;
}

function showLogoutModal() {
  const email = getCurrentEmail() || 'sua conta';
  const m = showModal(`
    <h3>Sair da conta?</h3>
    <p>Você vai precisar entrar novamente para acessar o app. Seus dados ficam salvos em <strong>${escape(email)}</strong>.</p>
    <div class="row">
      <button class="btn btn--ghost" data-cancel>Cancelar</button>
      <button class="btn" data-confirm style="background: var(--danger);">Sair</button>
    </div>
  `);
  m.querySelector('[data-cancel]').addEventListener('click', () => m.remove());
  m.querySelector('[data-confirm]').addEventListener('click', async () => {
    m.remove();
    await logout();
  });
}

function showResetModal() {
  const m = showModal(`
    <h3>Reiniciar desafio?</h3>
    <p>Você vai perder progresso, XP, conquistas, sequência e histórico. Essa ação não pode ser desfeita.</p>
    <div class="row">
      <button class="btn btn--ghost" data-cancel>Cancelar</button>
      <button class="btn" data-confirm style="background: var(--danger);">Reiniciar</button>
    </div>
  `);
  m.querySelector('[data-cancel]').addEventListener('click', () => m.remove());
  m.querySelector('[data-confirm]').addEventListener('click', () => {
    const keep = {
      name: State.data.name,
      goal: State.data.goal,
      photoUrl: State.data.photoUrl,
      weightCurrent: State.data.weightCurrent,
      weightGoal: State.data.weightGoal,
      heightCm: State.data.heightCm
    };
    State.reset();
    State.patch({ onboardingDone: true, ...keep });
    m.remove();
    toast('Desafio reiniciado');
    nav('/plano');
  });
}

// ============================================================
// Sync layer — mirror State to Supabase (debounced write-through)
// ============================================================
let syncTimer = null;
let syncBaseInfo = { name: null, phone: null }; // preserved from signup
function scheduleSync() {
  if (!window.Auth) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try {
      await window.Auth.saveProgress({
        name: State.data.name || syncBaseInfo.name || null,
        phone: syncBaseInfo.phone || null,
        state: State.data
      });
    } catch (e) { /* silent */ }
  }, 800);
}
// Wrap State.save so every mutation triggers a debounced sync
(function wrapSaveWithSync() {
  const origSave = State.save.bind(State);
  State.save = function () {
    origSave();
    scheduleSync();
  };
})();

async function hydrateFromRemote() {
  if (!window.Auth) return;
  try {
    // Cache email early so renders can show it synchronously
    const user = await window.Auth.getUser();
    if (user?.email) _cachedEmail = user.email;

    const row = await window.Auth.loadProgress();
    if (row) {
      syncBaseInfo = { name: row.name, phone: row.phone };
      const remoteState = row.state || {};
      // If remote has meaningful state, use it; else keep local
      if (Object.keys(remoteState).length > 0 && remoteState.createdAt) {
        State.data = { ...defaultState(), ...remoteState };
        // Also seed name from user_progress if state lacked it
        if (!State.data.name && row.name) State.data.name = row.name;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(State.data));
      } else if (row.name && !State.data.name) {
        // Fresh account, no state yet — pre-fill name from signup
        State.patch({ name: row.name });
      }
    } else {
      // No user_progress row yet → try to seed name from auth metadata
      const user = await window.Auth.getUser();
      const meta = user?.user_metadata || {};
      syncBaseInfo = { name: meta.name || null, phone: meta.phone || null };
      if (meta.name && !State.data.name) State.patch({ name: meta.name });
    }
  } catch (e) { /* silent */ }
}

async function logout() {
  try {
    if (window.Auth) await window.Auth.signOut();
  } catch (e) {}
  localStorage.removeItem(STORAGE_KEY);
  location.replace('/login');
}

// ============================================================
// Heartbeat — marca presença (RPC touch_last_seen), 1x/60s
// - Só dispara quando aba visível e usuário logado
// - Silencioso (não bloqueia UI se falhar)
// ============================================================
let _hbTimer = null;
let _hbLast = 0;
async function heartbeat() {
  if (!window.Auth || !window.Auth.client) return;
  if (document.visibilityState !== 'visible') return;
  const now = Date.now();
  if (now - _hbLast < 55000) return; // proteção extra client-side
  _hbLast = now;
  try { await window.Auth.client.rpc('touch_last_seen'); } catch (e) { /* silent */ }
}
function startHeartbeat() {
  heartbeat();
  clearInterval(_hbTimer);
  _hbTimer = setInterval(heartbeat, 60000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') heartbeat();
  });
}

// ============================================================
// Boot
// ============================================================

State.load();
applyTheme();

// Cache-buster: visit ?fresh=1 to unregister SW and clear caches, then reload clean
if (location.search.includes('fresh')) {
  (async () => {
    if ('serviceWorker' in navigator) {
      const rs = await navigator.serviceWorker.getRegistrations();
      for (const r of rs) await r.unregister();
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      for (const k of keys) await caches.delete(k);
    }
    location.replace(location.origin + '/');
  })();
} else {
  (async () => {
    // AUTH GUARD: require login (redirects to /login if no session)
    if (window.Auth) {
      const session = await window.Auth.requireAuth();
      if (!session) return; // already redirected
      await hydrateFromRemote();
      startHeartbeat();
    }

    window.addEventListener('hashchange', router);
    router();

    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      });
    }
  })();
}
