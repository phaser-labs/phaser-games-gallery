/* eslint-disable simple-import-sort/imports */
import { presetOVA } from './src/shared/ui/theme/preset-ova'
import { defineConfig, presetUno } from 'unocss';

export default defineConfig({
  // Fuerza a UnoCSS a escanear tus archivos de Phaser
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        'src/**/*.{ts,tsx,js,jsx}' // Esto incluirá tus archivos ui.ts de game-quiz-pool
      ],
    },
  },
  blocklist: ['container'],
  presets: [
    presetUno(), 
    presetOVA()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as any
});