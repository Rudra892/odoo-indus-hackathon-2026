/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#F8FAFC',
        sidebar: '#0F172A',
        'sidebar-hover': '#1E293B',
        primary: '#6366F1',
        'primary-dark': '#4F46E5',
        'primary-light': '#E0E7FF',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
        'card-bg': '#FFFFFF',
        'card-border': '#E2E8F0',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
        'text-label': '#94A3B8',
        'text-body': '#334155',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'nav': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'glass': '0 10px 25px -5px rgba(99, 102, 241, 0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
