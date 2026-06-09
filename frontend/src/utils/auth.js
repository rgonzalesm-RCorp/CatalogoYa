const SESSION_KEY = 'catalogosya_session';

export const getSession = () => {
  try {
    const session = window.localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    return null;
  }
};

export const saveSession = (session) => {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  window.localStorage.removeItem(SESSION_KEY);
};
