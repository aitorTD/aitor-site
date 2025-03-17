export interface Theme {
  primary: string;
  primaryLight: string;
  primaryMedium: string;
  primaryDark: string;
  starColor: string;
}

export const themes: Record<string, Theme> = {
  mint: {
    primary: '#98ffc5',
    primaryLight: 'rgba(152, 255, 197, 0.5)',
    primaryMedium: 'rgba(152, 255, 197, 0.8)',
    primaryDark: 'rgba(152, 255, 197, 0.95)',
    starColor: '0xd8ffe4'
  },
  teal: {
    primary: '#398B93',
    primaryLight: 'rgba(57, 139, 147, 0.5)',
    primaryMedium: 'rgba(57, 139, 147, 0.8)',
    primaryDark: 'rgba(57, 139, 147, 0.95)',
    starColor: '0x398B93'
  },
  orange: {
    primary: '#d3965b',
    primaryLight: 'rgba(211, 150, 91, 0.5)',
    primaryMedium: 'rgba(211, 150, 91, 0.8)',
    primaryDark: 'rgba(211, 150, 91, 0.95)',
    starColor: '0xd3965b'
  },
  indigo: {
    primary: '#382f8e',
    primaryLight: 'rgba(56, 47, 142, 0.5)',
    primaryMedium: 'rgba(56, 47, 142, 0.8)',
    primaryDark: 'rgba(56, 47, 142, 0.95)',
    starColor: '0x382f8e'
  }
};

export function applyTheme(themeName: string): void {
  const theme = themes[themeName];
  if (!theme) return;
  
  const root = document.documentElement;
  
  // Batch DOM operations to reduce reflows
  requestAnimationFrame(() => {
    // Update CSS variables
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-light', theme.primaryLight);
    root.style.setProperty('--color-primary-medium', theme.primaryMedium);
    root.style.setProperty('--color-primary-dark', theme.primaryDark);
    
    // Update active state on buttons
    document.querySelectorAll('.color-option').forEach(option => {
      option.classList.toggle('active', option.getAttribute('data-theme') === themeName);
    });
    
    // Dispatch custom event for the star color change
    const event = new CustomEvent('themeChanged', { detail: { starColor: theme.starColor } });
    document.dispatchEvent(event);
  });
  
  // Save theme preference
  localStorage.setItem('preferred-theme', themeName);
}