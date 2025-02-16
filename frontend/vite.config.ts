import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: resolve(__dirname, "../data"),
    assetsDir: ".",
    cssCodeSplit: false,
  },
});
