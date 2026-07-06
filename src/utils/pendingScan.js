const KEY = 'pendingQrToken';

export const pendingScan = {
  set(token) {
    sessionStorage.setItem(KEY, token);
  },
  get() {
    return sessionStorage.getItem(KEY);
  },
  clear() {
    sessionStorage.removeItem(KEY);
  },
};
