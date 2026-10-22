import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,webp}'],
			},
			manifest: {
				name: 'ORBIT / Орбита',
				short_name: 'Орбита',
				start_url: '/',
				display: 'standalone',
				background_color: '#14181c',
				theme_color: '#14181c',
				icons: [
					{
						src: '/orbit.svg',
						sizes: 'any',
						type: 'image/svg+xml',
					},
				],
			},
		}),
	],
})
