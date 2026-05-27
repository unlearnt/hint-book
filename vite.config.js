import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    server: {
      proxy: {
        // Vision assessment — DeepInfra (Qwen VL)
        "/api/llm": {
          target: "https://api.deepinfra.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/llm/, "/v1/openai"),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              proxyReq.setHeader("Authorization", `Bearer ${env.DEEPINFRA_API_KEY}`);
            });
          },
        },
        // Hint page generation — PayPal CosmosAI (Claude)
        "/api/cosmos": {
          target: "https://aiplatform.dev51.cbf.dev.paypalinc.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cosmos/, "/cosmosai/llm/v1"),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              proxyReq.setHeader("Authorization", `Bearer ${env.COSMOS_API_KEY}`);
            });
          },
        },
      },
    },
  };
});
