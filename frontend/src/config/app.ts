/** Base path da aplicação (ex: /BabyList). Vite define import.meta.env.BASE_URL com barra final. */
export function getBasename(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '');
}

export function appPath(path: string): string {
  const base = getBasename();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}
