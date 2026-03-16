import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindss()],
});
