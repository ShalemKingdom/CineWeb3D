import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
// Include the opt-in media example in the production build, not only in dev.
export default defineConfig({server:{host:'127.0.0.1',cors:false},preview:{host:'127.0.0.1',cors:false},build:{license:{fileName:'licenses/bundled-dependencies.json'},rollupOptions:{input:{main:fileURLToPath(new URL('./index.html',import.meta.url)),video:fileURLToPath(new URL('./examples/video-scroll/index.html',import.meta.url)),coffeeCommercial:fileURLToPath(new URL('./examples/coffee-commercial/index.html',import.meta.url)),productCommercial:fileURLToPath(new URL('./examples/product-commercial/index.html',import.meta.url))}}}});
