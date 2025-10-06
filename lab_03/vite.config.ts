import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
  build: {
    outDir: "./dist",
  },
  base: "/IU7-CG/lab_03/",
  server: {
    https: false,
  },
});
