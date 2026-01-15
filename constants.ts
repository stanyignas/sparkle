export const COLORS = {
  primary: '#FF87C0',
  accent: '#FDEBF7',
  secondary: '#9ED8FF',
  textPrimary: '#1F1F1F',
  textMuted: '#6B6B6B',
  success: '#7ED957',
  bg: '#FFFDFD'
};

export const DEFAULT_PREFERENCES = {
  theme: 'minimal-cute',
  notificationSettings: {
    periodWarningDays: 2,
    pmsWarningDays: 3,
    fertilityWarningDays: 2,
    enableVibrations: true
  },
  privacy: {
    cloudBackup: false,
    encrypted: true
  }
};

export const MICROCOPY = {
  greeting: (name: string) => `Good morning, ${name} ❤️`,
  bouquet: "I'm with you. 🌸",
  confetti: "Yay! Happy day! ✨",
  prediction: (days: number) => `Period in ${days} days`,
  periodActive: "Period day",
  fertile: "High chance of fertility",
  onboarding: {
    welcome: "Welcome to PocketLove",
    privacy: "Your data stays on this device.",
    setup: "Let's get to know you."
  }
};
