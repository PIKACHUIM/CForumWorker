import type { Config } from 'tailwindcss';

const config: Config = {
	darkMode: ['class'],
	content: ['./pages/**/*.html', './src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			borderRadius: {
				lg: '0.75rem',
				md: '0.5rem',
				sm: '0.375rem',
				xl: '1rem',
				'2xl': '1.25rem',
				'3xl': '1.5rem',
				full: '9999px',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// 二次元专属色
				sakura: '#FFB7C5',
				lavender: '#C9B8E8',
				sky: '#A8D8EA',
				peach: '#FFCBA4',
				mint: '#B5EAD7',
				stargold: '#FFD700',
			},
			fontFamily: {
				sans: ["'Noto Sans SC'", "'PingFang SC'", "'Microsoft YaHei'", 'sans-serif'],
				display: ["'ZCOOL KuaiLe'", "'Noto Sans SC'", 'sans-serif'],
				deco: ["'Ma Shan Zheng'", "'ZCOOL KuaiLe'", 'cursive'],
			},
			boxShadow: {
				'anime': '0 2px 8px rgba(0,0,0,0.06), 0 6px 24px rgba(232,121,160,0.18)',
				'anime-lg': '0 4px 16px rgba(0,0,0,0.08), 0 12px 40px rgba(232,121,160,0.25)',
				'anime-hover': '0 8px 24px rgba(0,0,0,0.10), 0 16px 48px rgba(232,121,160,0.30)',
				'card': '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(232,121,160,0.12)',
				'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 10px 32px rgba(232,121,160,0.22)',
				'lavender': '0 4px 20px rgba(201,184,232,0.2)',
				'glow-pink': '0 0 0 3px rgba(255,183,197,0.4)',
				'glow-purple': '0 0 0 3px rgba(201,184,232,0.4)',
			},
			backgroundImage: {
				'gradient-anime': 'linear-gradient(135deg, #FFB7C5, #C9B8E8, #A8D8EA)',
				'gradient-pink-purple': 'linear-gradient(135deg, #e879a0, #a855f7)',
				'gradient-sakura': 'linear-gradient(135deg, #FFB7C5, #FFCBA4)',
				'gradient-sky': 'linear-gradient(135deg, #A8D8EA, #B5EAD7)',
			},
			animation: {
				'heartbeat': 'heartbeat 1.2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'spin-slow': 'spin-slow 3s linear infinite',
				'slide-up': 'slideUp 0.5s ease-out forwards',
				'fade-in': 'fadeIn 0.4s ease-out forwards',
				'twinkle': 'twinkle 2s ease-in-out infinite',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
			},
			keyframes: {
				heartbeat: {
					'0%, 100%': { transform: 'scale(1)' },
					'14%': { transform: 'scale(1.3)' },
					'28%': { transform: 'scale(1)' },
					'42%': { transform: 'scale(1.2)' },
					'70%': { transform: 'scale(1)' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-8px)' },
				},
				'spin-slow': {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' },
				},
				slideUp: {
					from: { opacity: '0', transform: 'translateY(24px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				twinkle: {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.4', transform: 'scale(0.8)' },
				},
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-4px)' },
				},
			},
		}
	},
	plugins: [require('tailwindcss-animate')]
};

export default config;

