import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        xs: "var(--r-xs)",
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        xl: "var(--r-xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        lg: "var(--shadow-lg)",
        float: "var(--shadow-float)",
        inset: "var(--shadow-inset)",
      },
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        panel2: "var(--panel-2)",
        text: "var(--text)",
        "text-inverse": "var(--text-inverse)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        signal: "var(--signal)",
        "signal-on": "var(--signal-on)",
        "signal-muted": "var(--signal-muted)",
        highlight: "var(--highlight)",
        charcoal: "var(--charcoal)",
        "charcoal-light": "var(--charcoal-light)",
        "status-blue": "var(--status-blue)",
        "status-green": "var(--status-green)",
        "status-orange": "var(--status-orange)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular"],
      },
    },
  },
  plugins: [],
};

export default config;
