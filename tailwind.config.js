/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        white: 'white',
        black: 'black',

        bg0: 'rgba(19, 18, 22, 1)',
        bg1: '#000',
        bg3: '#CED0D9',
        bg4: '#888D9B',
        bg5: '#888D9B',

        colorContrast: '#ffffff',

        primary1: 'rgba(19, 18, 22, 1)',
        primary2: 'rgba(29, 28, 33, 1)',
        primary3: 'rgba(115, 115, 115, 1)',
        primary4: 'rgba(63, 61, 68, 1)',

        text1: 'rgba(255, 255, 255, 1)',
        text2: 'rgba(255, 255, 255, 0.5)',

        dark5: 'transparent',

        red1: '#F82D3A',
        red2: 'rgba(119, 48, 48, 1)',
        red3: 'rgba(255, 59, 106, 1)',
        green1: '#27AE60',
        green2: 'rgba(39, 227, 159, 1)',
        yellow1: '#e3a507',
        yellow2: '#ff8f00',
        yellow3: '#F3B71E',
        blue1: '#2172E5',

        error: '#FD4040',
        success: '#27AE60',
        warning: '#ff8f00',
      },
    },
  },
  plugins: [],
};
