import path from 'path';
import UnoCSS from 'unocss/vite';
import TurboConsole from 'unplugin-turbo-console/vite';
import { defineConfig } from 'vite';
import { reactClickToComponent } from 'vite-plugin-react-click-to-component';
import zipPack from 'vite-plugin-zip-pack';
import VitePluginSvgSpritemap from '@spiriit/vite-plugin-svg-spritemap';
// import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    UnoCSS(),
    TurboConsole({
      disableLaunchEditor: true
    }),
    zipPack({
      outDir: 'ova-zip',
      outFileName: 'ova-template.zip'
    }),
    VitePluginSvgSpritemap('**/icons/*.svg', {
      prefix: 'icon-',
    }),
    reactClickToComponent()
    // Descomente esta línea si necesita visualizar el OVA en su dispositivo móvil. 👇
    // basicSsl()
  ],
  base: './',
  build: {
    target: 'ES2022',
    outDir: 'dist/ova-template',
    assetsDir: './'
  },
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`,
      '@shared': `${path.resolve(__dirname, 'src/shared')}/`,
      '@core': `${path.resolve(__dirname, 'src/shared/core')}/`,
      '@ui': `${path.resolve(__dirname, 'src/shared/ui')}/`,
      '@pages': `${path.resolve(__dirname, 'src/pages')}/`,
      '@router': `${path.resolve(__dirname, 'src/router')}/`,
      '@styles': `${path.resolve(__dirname, `src/styles`)}/`,
      '@assets': `${path.resolve(__dirname, `src/assets`)}/`
    }
  },
  server: {
    host: true
  }
});
