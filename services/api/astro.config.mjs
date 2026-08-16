import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  devToolbar: { enabled: false },
  site: process.env.API_PUBLIC_URL || "https://api.gfcodes.com",
});
