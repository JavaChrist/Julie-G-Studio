export const APP_NAME = "Julie Grohens Photographe d'émotions";
export const APP_DESCRIPTION = 'Photographe professionnelle en Normandie - Mariage, Naissance, Famille';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
} as const;

export const COLORS = {
  primary: 'blue',
  secondary: 'gray',
  success: 'green',
  danger: 'red',
  warning: 'yellow',
} as const;

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const; 