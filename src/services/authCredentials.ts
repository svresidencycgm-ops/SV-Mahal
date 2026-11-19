export interface UserCredentials {
  username: string;
  email: string;
  password: string;
}

const DEFAULT_ADMIN: UserCredentials = {
  username: 'admin',
  email: 'admin@svmahal.com',
  password: 'admin'
};

const DEFAULT_MANAGER: UserCredentials = {
  username: 'manager',
  email: 'manager@svmahal.com',
  password: 'manager'
};

export const getAdminCredentials = (): UserCredentials => {
  try {
    const raw = localStorage.getItem('sv_auth_admin');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        username: parsed.username || DEFAULT_ADMIN.username,
        email: parsed.email || DEFAULT_ADMIN.email,
        password: parsed.password || DEFAULT_ADMIN.password
      };
    }
  } catch (e) {
    console.error('Failed to load admin credentials from localStorage', e);
  }
  return DEFAULT_ADMIN;
};

export const saveAdminCredentials = (creds: UserCredentials): void => {
  localStorage.setItem('sv_auth_admin', JSON.stringify(creds));
};

export const getManagerCredentials = (): UserCredentials => {
  try {
    const raw = localStorage.getItem('sv_auth_manager');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        username: parsed.username || DEFAULT_MANAGER.username,
        email: parsed.email || DEFAULT_MANAGER.email,
        password: parsed.password || DEFAULT_MANAGER.password
      };
    }
  } catch (e) {
    console.error('Failed to load manager credentials from localStorage', e);
  }
  return DEFAULT_MANAGER;
};

export const saveManagerCredentials = (creds: UserCredentials): void => {
  localStorage.setItem('sv_auth_manager', JSON.stringify(creds));
};

export const verifyAdminLogin = (userOrEmail: string, pass: string): boolean => {
  const current = getAdminCredentials();
  const input = userOrEmail.trim().toLowerCase();
  const matchUser = input === current.username.toLowerCase() || input === current.email.toLowerCase();
  return matchUser && pass === current.password;
};

export const verifyManagerLogin = (userOrEmail: string, pass: string): boolean => {
  const current = getManagerCredentials();
  const input = userOrEmail.trim().toLowerCase();
  const matchUser = input === current.username.toLowerCase() || input === current.email.toLowerCase();
  return matchUser && pass === current.password;
};
