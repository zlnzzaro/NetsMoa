import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["supabase/**/*.test.ts"], environment: "node" },
});
