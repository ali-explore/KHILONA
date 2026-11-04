/** Design tokens sampled from the KHILONA Figma frames. */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ['"Inter Variable"', "Inter", "system-ui", "sans-serif"] },
      colors: {
        app: "#0a0f1c",
        sidebar: "#0d1527",
        panel: "#0f1a2e",
        raised: "#13203a",
        line: "#1c2a45",
        ink: "#e8edf8",
        muted: "#7f8ca8",
        faint: "#5c6a86",
        brand: "#3b82f6",
        blue: "#3b82f6",
        yellow: "#facc15",
        purple: "#a855f7",
        ok: "#22c55e",
      },
      borderRadius: { card: "12px" },
    },
  },
  plugins: [],
};
