import { CSSBreakpoints } from 'shared/constants';
import { ITheme } from 'styles';

const theme: ITheme = {
  colors: {
    // dark blue as defined in Giant Swarm's style guide
    darkBlue: '#234a61',

    // Darker shades of above darkBlue.
    // The higher the number, the darker the tone.
    darkBlueDarker1: '#204358',
    darkBlueDarker2: '#1c3c4f',
    darkBlueDarker3: '#193545',
    darkBlueDarker4: '#162e3d',
    darkBlueDarker5: '#132834',
    darkBlueDarker6: '#10212c',
    darkBlueDarker7: '#0d1b23',
    darkBlueDarker8: '#0a141b',
    darkBlueDarker9: '#060c0f',

    // Lighter shades of above darkBlue.
    // The higher the number, the brighter the tone.
    darkBlueLighter1: '#375b70',
    darkBlueLighter2: '#4c6c7e',
    darkBlueLighter3: '#617d8d',
    darkBlueLighter4: '#768e9d',
    darkBlueLighter5: '#8ca0ac',
    darkBlueLighter6: '#a2b3bc',
    darkBlueLighter7: '#b9c5cd',
    darkBlueLighter8: '#d0d8dd',
    darkBlueLighter9: '#e7ebee',

    darkBlueMuted: '#020a29',

    shade1: '#1E4156',
    shade2: '#224A61',
    shade3: '#234D65',
    shade4: '#2F556A',
    shade5: '#32526A',
    shade6: '#3A5F7B',
    shade7: '#30556a',
    shade8: '#5c7f9a',
    shade9: '#316786',
    shade10: '#1b3848',

    white1: '#FFFFFF',
    white2: '#D7D7D7',
    white3: '#B9C1C8',
    white4: '#eee',

    whiteInput: '#f0f0f0',
    yellow1: '#ddb03a',
    gold: '#ce990f',
    goldBackground: '#a97904',
    red: 'red',
    gray: '#ccc',
    error: '#e49090',

    loadingForeground: '#507184',

    foreground: '#375b70',
    dropdownBackground: '#2a5874',

    redOld: '#f56262',
    greenNew: '#24A524',

    flashMessages: {
      info: {
        background: '#d9edf7',
        border: '#bce8f1',
        text: '#31708f',
      },
      danger: {
        background: '#f2dede',
        border: '#ebccd1',
        text: '#a94442',
      },
      success: {
        background: '#dff0d8',
        border: '#d6e9c6',
        text: '#3c763d',
      },
      warning: {
        background: '#fcf8e3',
        border: '#faebcc',
        text: '#8a6d3b',
      },
    },
  },
  border_radius: '4px',
  spacingPx: 4,
  breakpoints: {
    [CSSBreakpoints.Small]: 540,
    [CSSBreakpoints.Medium]: 825,
    [CSSBreakpoints.Large]: 1024,
  },
  fontFamilies: {
    console: 'Inconsolata, monospace',
  },
  border: '1px solid #3A5F7B',
  disabledOpacity: 0.7,
};

export default theme;
