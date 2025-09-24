import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: "src/main.ts",
        react: "src/adapters/react.ts",
        vue: "src/adapters/vue.ts",
        angular: "src/adapters/angular.ts",
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        const ext = format === "es" ? "esm.js" : "cjs.js";
        return entryName === "index"
          ? `index.${ext}`
          : `adapters/${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      external: ["react", "vue", "@angular/core", "@angular/common", "rxjs"],
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: "dist",
      include: ["src"],
    }),
  ],
});
