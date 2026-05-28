const modules = import.meta.glob("./*.txt", { eager: true, query: "?raw", import: "default" });

const THINKING = Object.fromEntries(
  Object.entries(modules)
    .filter(([, v]) => v)
    .map(([path, thinking]) => [path.replace("./", "").replace(".txt", ""), thinking])
);

export default THINKING;
