import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // 👈 Allow access from other devices
    port: 5173, // 👈 Optional (default)
    proxy: {
      "/api": {
        target: "https://localhost:7777",
        changeOrigin: true,
        secure: false, // For self-signed certificates
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
