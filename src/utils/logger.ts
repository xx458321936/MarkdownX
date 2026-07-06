const isDev = import.meta.env.DEV;

export const logger = {
  info: (...args: unknown[]): void => {
    if (isDev) console.info('[markflow]', ...args);
  },
  warn: (...args: unknown[]): void => {
    if (isDev) console.warn('[markflow]', ...args);
  },
  error: (...args: unknown[]): void => {
    if (isDev) console.error('[markflow]', ...args);
  },
};
