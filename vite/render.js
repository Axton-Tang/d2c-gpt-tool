import react from "@vitejs/plugin-react-swc";
import { builtinModules } from "module";
import { fileURLToPath } from 'url';
import path from "path";

const __dirname = fileURLToPath(new URL('.', import.meta.url))


const config = {
  root: process.cwd(),
  base: './',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../dist/render"),
    minify: true,
    assetsInlineLimit: 1048576,
    emptyOutDir: true,
    brotliSize: false,
    chunkSizeWarningLimit: 2048,
    rollupOptions: {
      external: [...builtinModules],
    },
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true
    }
  },
  plugins: [react()],
};
export default config;
