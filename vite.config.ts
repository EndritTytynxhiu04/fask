import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';
// Fully static React export, with no backend or Worker.
export default defineConfig({ css: { postcss: { plugins: [tailwindcss()] } }, plugins: [vinext()] });
