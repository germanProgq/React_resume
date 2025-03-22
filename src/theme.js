// theme.js

export const theme = {
  bgGradientStart: '#2e003e',
  bgGradientEnd: '#120026',
  neonAccent: '#ff00b5',
  textPrimary: '#ffffff',
  textSecondary: '#cccccc',
  navBg: '#1c002c',
  navHeight: '60px',
  buttonPrimaryBg: '#4b006c',
  buttonPrimaryText: '#ffffff',
  buttonPrimaryHoverBg: '#5c0079',
  buttonSecondaryBg: '#2a002f',
  buttonSecondaryText: '#ffffff',
  buttonSecondaryHoverBg: '#3b0043',
  linkColor: '#ff00b5',
  linkHoverColor: '#ffa3de',
  outlineColor: 'rgba(255, 0, 181, 0.5)',
};

// Dynamically apply the theme's values as CSS variables
export function applyTheme() {
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    // Convert camelCase keys to kebab-case CSS variables
    root.style.setProperty(`--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
  });
}
