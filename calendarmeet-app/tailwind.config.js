/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // <- ensures Tailwind scans all components
  ],
  theme: {
    extend: {}, // <- no custom colors needed
  },
  plugins: [],
}
