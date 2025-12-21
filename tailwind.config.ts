import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        xl: "var(--r-xl)",
        lg: "var(--r-lg)",
      },
      boxShadow: {
        panel: "var(--shadow-1)",
        panel2: "var(--shadow-2)",
      },
      colors: {
        bg0: "rgb(var(--bg0))",
        bg1: "rgb(var(--bg1))",
        surface: "rgb(var(--surface))",
        surface2: "rgb(var(--surface2))",
        accent: "rgb(var(--accent))",
        accent2: "rgb(var(--accent2))",
        stroke: "rgba(var(--stroke), var(--strokeA))",
        strokeHover: "rgba(var(--stroke), var(--strokeHoverA))",
        text: "rgba(var(--text), var(--textA))",
        muted: "rgba(var(--text), var(--mutedA))",
      },
    },
  },
  plugins: [],
};

export default config;

