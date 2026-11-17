/** Social Eyes approved brand system. Design tokens only; no Phase 2 features. */
export const brand = {
  name: 'Social Eyes',
  tagline: 'Discover. Connect. Belong.',
  palette: {
    midnight: '#080B1E',
    deepNavy: '#0A1030',
    cyan: '#2CE6F5',
    electricBlue: '#348EFF',
    violet: '#8C55F6',
    pink: '#EF6BBE',
    white: '#F8FAFF',
  },
  gradients: {
    primary: ['#2CE6F5', '#348EFF', '#8C55F6', '#EF6BBE'],
    action: ['#19D8F3', '#9652FA', '#EA54C1'],
  },
  assets: {
    icon: require('../../assets/images/social-eyes-icon.png'),
    mark: require('../../assets/images/social-eyes-mark.png'),
    adaptiveForeground: require('../../assets/images/social-eyes-adaptive-foreground.png'),
    aurora: require('../../assets/images/brand/aurora.png'),
    violetHaze: require('../../assets/images/brand/violet-haze.png'),
    cyanDepth: require('../../assets/images/brand/cyan-depth.png'),
  },
  motion: { revealMs: 350, irisFocusMs: 450, wordmarkFadeMs: 250, maxIntroMs: 1500 },
} as const;
