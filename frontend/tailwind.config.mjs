/** @type {import('tailwindcss').Config} */

import { heroui } from "@heroui/react";

const tailwindConfig = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        fold: { max: "320px" },
        mobS: { max: "375px" },
        mob: { max: "767px" },
        tab: { min: "768px", max: "1023px" },
        mobTab: { max: "1023px" },
        lapLg: { min: "1024px" },
        maxS: { min: "1920px" },
      },
      themes: {
        light: {
          layout: {
            borderWidth: {
              small: "1px",
              medium: "1px",
              large: "2px",
            },
          },
        },
      },
    },
  },
  plugins: [heroui()],
};

export default tailwindConfig;
