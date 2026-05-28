const modules = import.meta.glob("./*.js", { eager: true, import: "default" });

const THINKING = Object.fromEntries(
  Object.entries(modules)
    .filter(([, v]) => v)
    .map(([path, thinking]) => [path.replace("./", "").replace(".js", ""), thinking])
);

export default THINKING;
