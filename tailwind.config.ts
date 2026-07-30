import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1636",
        navy: "#10265E",
        electric: "#2764FF",
        sky: "#EAF1FF",
      },
      boxShadow: {
        card: "0 12px 35px rgba(15, 35, 85, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
