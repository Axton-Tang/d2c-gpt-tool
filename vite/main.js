import { builtinModules } from 'module'
import { fileURLToPath } from 'url';
import path from "path";
const __dirname = fileURLToPath(new URL('.', import.meta.url))

const config = {
  root: process.cwd(),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../dist/main"),
    minify: false,
    target: `node16`,
    lib: {
      entry: path.resolve(__dirname, '../src/main/index.ts'),
      formats: ['cjs'],
    },
    rollupOptions: {
      external: ['electron','koffi',"log4js",...builtinModules],
      output: {
        entryFileNames: '[name].cjs',
      },
    },
    emptyOutDir: true,
    brotliSize: false,
    chunkSizeWarningLimit: 2048,
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true
    }
  }
};
export default config;
