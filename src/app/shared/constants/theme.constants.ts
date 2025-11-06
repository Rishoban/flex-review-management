export const THEME_COLORS = {
  primary: '#485e54',      // Dark sage green
  background: '#fffbee',   // Light cream
  surface: '#fffdf6',      // Light cream variant
  onPrimary: '#ffffff',    // White text on primary
  onBackground: '#485e54', // Dark text on background
  onSurface: '#485e54',    // Dark text on surface
  accent: '#485e54',       // Accent color
  error: '#d32f2f',        // Error color
  warning: '#f57c00',      // Warning color
  success: '#388e3c',      // Success color
  shadow: 'rgba(72, 94, 84, 0.1)', // Light shadow
  shadowMedium: 'rgba(72, 94, 84, 0.2)', // Medium shadow
  shadowDark: 'rgba(72, 94, 84, 0.3)' // Dark shadow
} as const;

export const THEME_VARIABLES = `
  --theme-primary: ${THEME_COLORS.primary};
  --theme-background: ${THEME_COLORS.background};
  --theme-surface: ${THEME_COLORS.surface};
  --theme-on-primary: ${THEME_COLORS.onPrimary};
  --theme-on-background: ${THEME_COLORS.onBackground};
  --theme-on-surface: ${THEME_COLORS.onSurface};
  --theme-accent: ${THEME_COLORS.accent};
  --theme-error: ${THEME_COLORS.error};
  --theme-warning: ${THEME_COLORS.warning};
  --theme-success: ${THEME_COLORS.success};
  --theme-shadow: ${THEME_COLORS.shadow};
  --theme-shadow-medium: ${THEME_COLORS.shadowMedium};
  --theme-shadow-dark: ${THEME_COLORS.shadowDark};
`;