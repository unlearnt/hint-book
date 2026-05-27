const modules = import.meta.glob("./*.js", { eager: true, import: "default" });

const PAGES = Object.fromEntries(
  Object.values(modules)
    .filter(Boolean)
    .map((page) => [page.id, page])
);

export default PAGES;
