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
			// 二次元专属色 v2（更鲜艳饱和）
			sakura: '#f472b6',
			lavender: '#a78bfa',
			sky: '#38bdf8',
			peach: '#fb923c',
			mint: '#34d399',
			stargold: '#fbbf24',
			},
			fontFamily: {
				sans: ["'Noto Sans SC'", "'PingFang SC'", "'Microsoft YaHei'", 'sans-serif'],
				display: ["'ZCOOL KuaiLe'", "'Noto Sans SC'", 'sans-serif'],
				deco: ["'Ma Shan Zheng'", "'ZCOOL KuaiLe'", 'cursive'],
			},
			boxShadow: {
			'anime': '0 2px 8px rgba(0,0,0,0.06), 0 6px 24px rgba(244,63,142,0.15)',
			'anime-lg': '0 4px 16px rgba(0,0,0,0.08), 0 12px 40px rgba(244,63,142,0.22)',
			'anime-hover': '0 8px 24px rgba(0,0,0,0.10), 0 16px 48px rgba(244,63,142,0.28)',
			'card': '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(168,85,247,0.10)',
			'card-hover': '0 4px 14px rgba(0,0,0,0.09), 0 10px 32px rgba(244,63,142,0.20)',
			'lavender': '0 4px 20px rgba(167,139,250,0.22)',
			'glow-pink': '0 0 0 3px rgba(244,63,142,0.28)',
			'glow-purple': '0 0 0 3px rgba(167,139,250,0.30)',
			},
			backgroundImage: {
			'gradient-anime': 'linear-gradient(135deg, #f43f8e, #a855f7, #38bdf8)',
			'gradient-pink-purple': 'linear-gradient(135deg, #f43f8e, #a855f7)',
			'gradient-sakura': 'linear-gradient(135deg, #f472b6, #fb923c)',
			'gradient-sky': 'linear-gradient(135deg, #38bdf8, #34d399)',
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

