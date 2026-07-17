/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F0D",
        surface: "#121815",
        surface2: "#1A211C",
        gold: "#C9A227",
        goldSoft: "#E4C766",
        pusaka: "#1F4D3A",
        merah: "#8C2F2F",
        cream: "#F2EDE4",
        muted: "#9BA39B",
      },
      fontFamily: {
        display: ["Anton", "sans-serif"],
        serif2: ["Fraunces", "serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
      },
      backgroundImage: {
        parang:
          "repeating-linear-gradient(135deg, rgba(201,162,39,0.05) 0px, rgba(201,162,39,0.05) 2px, transparent 2px, transparent 26px)",
      },
    },
  },
  plugins: [],
};
