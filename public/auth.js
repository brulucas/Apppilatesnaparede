/* ============================================================
   Pilates na Parede · Auth helpers
   ------------------------------------------------------------
   Autenticação simplificada por E-mail (sem necessidade de senha)
   ============================================================ */
(function () {
  'use strict';

  let client = null;
  if (window.supabase && window.supabase.createClient && window.APP_CONFIG && window.APP_CONFIG.supabaseUrl && window.APP_CONFIG.supabaseKey) {
    try {
      client = window.supabase.createClient(
        window.APP_CONFIG.supabaseUrl,
        window.APP_CONFIG.supabaseKey,
        { auth: { persistSession: true, autoRefreshToken: true } }
      );
    } catch (e) {
      console.warn('[Auth] Cliente Supabase não iniciado:', e);
    }
  }

  function getLocalSession() {
    try {
      const raw = localStorage.getItem('pp21_local_session');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setLocalSession(session) {
    try {
      if (session) {
        localStorage.setItem('pp21_local_session', JSON.stringify(session));
      } else {
        localStorage.removeItem('pp21_local_session');
      }
    } catch (e) {}
  }

  const Auth = {
    client,

    async getSession() {
      if (client) {
        try {
          const { data } = await client.auth.getSession();
          if (data?.session) return data.session;
        } catch (e) {}
      }
      return getLocalSession();
    },

    async getUser() {
      if (client) {
        try {
          const { data } = await client.auth.getUser();
          if (data?.user) return data.user;
        } catch (e) {}
      }
      const s = getLocalSession();
      return s?.user || null;
    },

    /**
     * Login / Cadastro apenas com E-mail (sem senha)
     */
    async signInWithEmailOnly({ email, utm_source }) {
      email = (email || '').trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        throw new Error('Digite um e-mail válido.');
      }

      const safeId = 'usr_' + Math.abs(email.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)).toString(36);
      const displayName = email.split('@')[0];

      const session = {
        access_token: 'auth_' + Date.now(),
        user: {
          id: safeId,
          email: email,
          user_metadata: {
            name: displayName,
            email: email,
            utm_source: utm_source || null
          }
        }
      };

      setLocalSession(session);

      // Cria ou recupera registro de progresso
      const existingState = localStorage.getItem('pp21_state_v1');
      if (!existingState) {
        localStorage.setItem('pp21_state_v1', JSON.stringify({
          onboardingDone: false,
          name: displayName,
          email: email,
          createdAt: new Date().toISOString()
        }));
      }

      // Sincronização em segundo plano com Supabase se disponível
      if (client) {
        (async () => {
          try {
            const deterministicPass = 'pilates21_' + safeId;
            const { data } = await client.auth.signUp({
              email,
              password: deterministicPass,
              options: { data: { name: displayName, utm_source: utm_source || null } }
            });
            if (data?.session) {
              setLocalSession(data.session);
            }
          } catch (e) {
            // Silencioso se der erro no Supabase, a sessão local já garante a navegação
          }
        })();
      }

      return session;
    },

    async signUp({ email, name, phone, utm_source }) {
      return this.signInWithEmailOnly({ email, utm_source });
    },

    async signIn({ email }) {
      return this.signInWithEmailOnly({ email });
    },

    async signOut() {
      setLocalSession(null);
      if (client) {
        try { await client.auth.signOut(); } catch (e) {}
      }
    },

    async resetPassword(email) {
      return true;
    },

    async updatePassword() {
      return true;
    },

    async loadProgress() {
      const user = await this.getUser();
      if (!user) return null;
      const local = localStorage.getItem('pp21_state_v1');
      if (local) {
        try {
          return { state: JSON.parse(local), name: user.user_metadata?.name || '' };
        } catch (e) {}
      }
      return null;
    },

    async saveProgress(patch) {
      const user = await this.getUser();
      if (!user) return null;
      if (patch && patch.state) {
        try {
          localStorage.setItem('pp21_state_v1', JSON.stringify(patch.state));
        } catch (e) {}
      }
    },

    /** Redirects to /cadastro if there's no session. Returns the session if OK. */
    async requireAuth() {
      const s = await this.getSession();
      if (!s) {
        location.replace('/cadastro' + (location.search || '?utm_source=areademembros'));
        return null;
      }
      return s;
    },

    /** Redirects to / if the user is already authenticated. */
    async redirectIfLogged() {
      const s = await this.getSession();
      if (s) location.replace('/');
    }
  };

  window.Auth = Auth;
})();
