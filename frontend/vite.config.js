import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                admin: resolve(__dirname, 'admin.html'),
                auth: resolve(__dirname, 'auth.html'),
                checkout: resolve(__dirname, 'checkout.html'),
                profile: resolve(__dirname, 'profile.html'),
                product: resolve(__dirname, 'product.html')
            }
        }
    },
    server: {
        port: 3000,
        open: true
    }
});
