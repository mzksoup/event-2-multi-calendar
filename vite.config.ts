import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    // Replit依存プラグインを削除しました。
    ...(process.env.NODE_ENV === "development"
      ? [
          // 開発時のみcartographer等を設定する場合はここに
        ]
      : []),
  ],
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: { strict: true, deny: ["**/.*"] },
  },
});
