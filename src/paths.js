export const basePath = import.meta.env?.BASE_URL ?? "/";
export const sitePath = (path = "") => basePath + path.replace(/^\//, "");
export const routePath = () =>
  window.location.pathname.slice(basePath.length - 1);
