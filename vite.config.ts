// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://fastapi-turbine-62vm.onrender.com",
        changeOrigin: true,
        secure: true, // backend dùng HTTPS (Render) -> giữ true
        rewrite: (p) => p.replace(/^\/api/, "/api/v1"),
      },
    },
  },
});
