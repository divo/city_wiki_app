const palette = {
  orange: '#D57741',
  lightOrange: '#FCD8A2',
  lightBlue: '#688383',
  darkBlue: '#1F343B',
  cream: '#FFFF00',
} as const;

const plaette2 = {
  brown: '#AB6327',
  darkBlue: '#32596E',
  lightBrown: '#D7BF9B',
  lightBlue: '#508699',
  orange: '#CE5119',
}

export const colors = {
  ...palette,
  primary: plaette2.lightBlue,
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tint: '#88A9AA',
    overlay: 'rgba(0, 0, 0, 0.5)',
    greyTint: 'rgba(180, 180, 180, 0.4)',
  },
  
  // Text colors
  text: {
    primary: '#1A1A1A',
    secondary: '#333333',
    tertiary: '#666666',
    light: '#FFFFFF',
  },
  
  // UI Element colors
  ui: {
    divider: '#EEEEEE',
    handle: '#DDDDDD',
    shadow: '#000000',
    debug: '#333333',
  }
} as const; 