import type { Config } from "tailwindcss";
import daisyui from "daisyui"

const config: Config = {
   content: [
    './pages/**/*.{js,ts,jsx,tsx}',  // Scan all files in the pages directory
    './components/**/*.{js,ts,jsx,tsx}',  // Scan all files in the components directory
    './out/**/*.html',  // Include static HTML files after export
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [
    daisyui,
  ],
};
export default config;
