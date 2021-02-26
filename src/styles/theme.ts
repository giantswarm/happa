import { generate, ThemeType } from 'grommet';
import { deepMerge } from 'grommet/utils';
import { CSSBreakpoints } from 'shared/constants';
import { css, DefaultTheme } from 'styled-components';

interface ICalendarDayProps {
  theme: DefaultTheme;
  isSelected: boolean;
}

/* eslint-disable no-magic-numbers */

const theme = deepMerge(generate(16), {
  // Legacy Happa settings.
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
    white5: '#ccd',

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

  // Grommet configuration.
  name: 'happa',
  rounding: 4,
  spacing: 16,
  defaultMode: 'dark',
  global: {
    colors: {
      brand: {
        dark: 'border',
        light: 'border',
      },
      background: {
        dark: '#234a61',
        light: '#234a61',
      },
      'background-back': {
        dark: 'background',
        light: 'background',
      },
      'background-front': {
        dark: '#375b70',
        light: '#375b70',
      },
      'background-contrast': {
        dark: '#15253111',
        light: '#15253111',
      },
      text: {
        dark: '#EEEEEE',
        light: '#EEEEEE',
      },
      'text-strong': {
        dark: '#FFFFFF',
        light: '#FFFFFF',
      },
      'text-weak': {
        dark: '#CCCCCC',
        light: '#CCCCCC',
      },
      'text-xweak': {
        dark: '#798691',
        light: '#798691',
      },
      border: {
        dark: '#3a5f7b',
        light: '#3a5f7b',
      },
      control: {
        dark: 'border',
        light: 'border',
      },
      'active-background': 'background-contrast',
      'active-text': 'text-strong',
      'selected-background': 'brand',
      'selected-text': 'text-strong',
      'status-critical': '#e49090',
      'status-warning': '#FFAA15',
      'status-ok': '#00C781',
      'status-unknown': '#CCCCCC',
      'status-disabled': '#CCCCCC',
      'graph-0': 'brand',
      'graph-1': 'status-warning',
      'input-background': '#32526a',
      focus: {
        light: 'text-strong',
        dark: 'text-strong',
      },
    },
    font: {
      family: '"Roboto", Helvetica, sans-serif',
      size: '15px',
      height: '20px',
      maxWidth: '300px',
    },
    active: {
      background: 'active-background',
      color: 'active-text',
    },
    hover: {
      background: 'active-background',
      color: 'active-text',
    },
    selected: {
      background: 'selected-background',
      color: 'selected-text',
    },
    borderSize: {
      xsmall: '1px',
      small: '2px',
      medium: '3px',
      large: '10px',
      xlarge: '20px',
    },
    breakpoints: {
      small: {
        value: 640,
        borderSize: {
          xsmall: '1px',
          small: '2px',
          medium: '3px',
          large: '5px',
          xlarge: '10px',
        },
        edgeSize: {
          none: '0px',
          hair: '1px',
          xxsmall: '2px',
          xsmall: '3px',
          small: '5px',
          medium: '10px',
          large: '20px',
          xlarge: '40px',
        },
        size: {
          xxsmall: '20px',
          xsmall: '40px',
          small: '80px',
          medium: '160px',
          large: '320px',
          xlarge: '640px',
          full: '100%',
        },
      },
      medium: {
        value: 1280,
      },
      large: {},
    },
    edgeSize: {
      none: '0px',
      hair: '1px',
      xxsmall: '3px',
      xsmall: '5px',
      small: '10px',
      medium: '20px',
      large: '40px',
      xlarge: '80px',
      responsiveBreakpoint: 'small',
    },
    input: {
      padding: 'small',
      weight: 500,
    },
    spacing: '20px',
    size: {
      xxsmall: '40px',
      xsmall: '80px',
      small: '160px',
      medium: '320px',
      large: '640px',
      xlarge: '960px',
      xxlarge: '1280px',
      full: '100%',
    },
    control: {
      border: {
        radius: '4px',
      },
    },
    drop: {
      border: {
        radius: '4px',
      },
    },
  },
  select: {
    background: 'border',
    icons: {
      color: { dark: 'text-xweak', light: 'text-xweak' },
    },
  },
  chart: {},
  diagram: {
    line: {},
  },
  meter: {},
  button: {
    border: {
      width: '2px',
      radius: '4px',
    },
    padding: {
      vertical: '3px',
      horizontal: '18px',
    },
  },
  calendar: {
    small: {
      fontSize: '11.666666666666666px',
      lineHeight: 1.375,
      daySize: '22.86px',
    },
    medium: {
      fontSize: '15px',
      lineHeight: 1.45,
      daySize: '36px',
    },
    large: {
      fontSize: '25px',
      lineHeight: 1.11,
      daySize: '91.43px',
    },
    heading: {
      level: '5',
    },
    day: {
      extend: () => css`
        border-radius: 100%;
        background-color: ${(props: ICalendarDayProps) =>
          props.isSelected && props.theme.global.colors['text-xweak'].dark};
      `,
    },
  },
  textArea: {
    extend: () => css`
      background: ${(props) => props.theme.global.colors['input-background']};
      min-width: 100%;
      min-height: 40px;
    `,
  },
  checkBox: {
    color: {
      dark: 'text',
      light: 'text',
    },
    size: '18px',
    toggle: {
      radius: '18px',
      size: '32px',
      extend: (props: { theme: ThemeType; checked: boolean }) => ({
        transition: 'background 0.3s ease-out',
        background: props.checked
          ? props.theme.global!.colors!['status-ok']
          : props.theme.global!.colors!['input-background'],
      }),
    },
    check: {
      radius: '4px',
      thickness: '2px',
      extend: (props: { theme: ThemeType }) => ({
        background: props.theme.global!.colors!['input-background'],
      }),
    },
    border: {
      color: 'text',
      width: '1px',
    },
    extend: {
      fontWeight: 'normal',
    },
  },
  clock: {
    analog: {
      hour: {
        width: '7px',
        size: '20px',
      },
      minute: {
        width: '3px',
        size: '10px',
      },
      second: {
        width: '3px',
        size: '8px',
      },
      size: {
        small: '60px',
        medium: '80px',
        large: '120px',
        xlarge: '180px',
        huge: '240px',
      },
    },
    digital: {
      text: {
        xsmall: {
          size: '8.333333333333332px',
          height: 1.5,
        },
        small: {
          size: '11.666666666666666px',
          height: 1.43,
        },
        medium: {
          size: '15px',
          height: 1.375,
        },
        large: {
          size: '18.333333333333332px',
          height: 1.167,
        },
        xlarge: {
          size: '21.666666666666668px',
          height: 1.1875,
        },
        xxlarge: {
          size: '28.333333333333336px',
          height: 1.125,
        },
      },
    },
  },
  radioButton: {
    size: '18px',
    check: {
      radius: '18px',
      extend: (props: { theme: ThemeType }) => ({
        background: props.theme.global!.colors!['input-background'],
      }),
    },
    icon: {
      extend: (props: { theme: ThemeType }) => {
        const fillColor = props.theme.global!.colors!.text!;
        let colorHex = '';
        if (typeof fillColor === 'string') {
          colorHex = fillColor;
        } else {
          colorHex = fillColor.dark!;
        }

        return {
          fill: colorHex,
        };
      },
    },
    border: {
      color: 'text',
      width: '1px',
    },
    font: {
      weight: 'normal',
    },
    color: {
      dark: 'text',
      light: 'text',
    },
  },
  formField: {
    border: {
      color: 'border',
      error: {
        color: {
          dark: 'status-critical',
          light: 'status-critical',
        },
      },
      position: 'inner',
      side: 'all',
      style: 'solid',
      size: 'xsmall',
    },
    content: {
      pad: 'small',
    },
    background: {
      color: 'input-background',
    },
    disabled: {
      background: {
        color: 'status-disabled',
        opacity: 'medium',
      },
    },
    error: {
      color: 'status-critical',
      margin: {
        vertical: 'xsmall',
        horizontal: 'none',
      },
      size: 'small',
      weight: 'normal',
    },
    help: {
      color: 'text-weak',
      margin: {
        start: 'none',
        top: 'none',
        bottom: 'small',
      },
      size: 'small',
      weight: 'normal',
    },
    info: {
      color: 'text-weak',
      margin: {
        vertical: 'xsmall',
        horizontal: 'none',
      },
      size: 'small',
      weight: 'normal',
    },
    label: {
      margin: {
        vertical: 'small',
        horizontal: 'none',
      },
      size: 'medium',
      weight: 'bold',
      color: 'text',
    },
    margin: {
      bottom: 'small',
    },
    round: '4px',
  },
  heading: {
    level: {
      '1': {
        font: {
          weight: '700',
        },
        small: {
          size: '28px',
          height: '33px',
          maxWidth: '567px',
        },
        medium: {
          size: '42px',
          height: '47px',
          maxWidth: '833px',
        },
        large: {
          size: '68px',
          height: '73px',
          maxWidth: '1367px',
        },
        xlarge: {
          size: '95px',
          height: '100px',
          maxWidth: '1900px',
        },
      },
      '2': {
        small: {
          size: '25px',
          height: '30px',
          maxWidth: '500px',
        },
        medium: {
          size: '35px',
          height: '40px',
          maxWidth: '700px',
        },
        large: {
          size: '45px',
          height: '50px',
          maxWidth: '900px',
        },
        xlarge: {
          size: '55px',
          height: '60px',
          maxWidth: '1100px',
        },
      },
      '3': {
        small: {
          size: '22px',
          height: '27px',
          maxWidth: '433px',
        },
        medium: {
          size: '28px',
          height: '33px',
          maxWidth: '567px',
        },
        large: {
          size: '35px',
          height: '40px',
          maxWidth: '700px',
        },
        xlarge: {
          size: '42px',
          height: '47px',
          maxWidth: '833px',
        },
      },
      '4': {
        small: {
          size: '18px',
          height: '23px',
          maxWidth: '367px',
        },
        medium: {
          size: '22px',
          height: '27px',
          maxWidth: '433px',
        },
        large: {
          size: '25px',
          height: '30px',
          maxWidth: '500px',
        },
        xlarge: {
          size: '28px',
          height: '33px',
          maxWidth: '567px',
        },
      },
      '5': {
        small: {
          size: '13px',
          height: '18px',
          maxWidth: '267px',
        },
        medium: {
          size: '13px',
          height: '18px',
          maxWidth: '267px',
        },
        large: {
          size: '13px',
          height: '18px',
          maxWidth: '267px',
        },
        xlarge: {
          size: '13px',
          height: '18px',
          maxWidth: '267px',
        },
      },
      '6': {
        small: {
          size: '12px',
          height: '17px',
          maxWidth: '233px',
        },
        medium: {
          size: '12px',
          height: '17px',
          maxWidth: '233px',
        },
        large: {
          size: '12px',
          height: '17px',
          maxWidth: '233px',
        },
        xlarge: {
          size: '12px',
          height: '17px',
          maxWidth: '233px',
        },
      },
    },
  },
  paragraph: {
    small: {
      size: '13px',
      height: '18px',
      maxWidth: '267px',
    },
    medium: {
      size: '15px',
      height: '20px',
      maxWidth: '300px',
    },
    large: {
      size: '18px',
      height: '23px',
      maxWidth: '367px',
    },
    xlarge: {
      size: '22px',
      height: '27px',
      maxWidth: '433px',
    },
    xxlarge: {
      size: '28px',
      height: '33px',
      maxWidth: '567px',
    },
  },
  text: {
    xsmall: {
      size: '12px',
      height: '17px',
      maxWidth: '233px',
    },
    small: {
      size: '13px',
      height: '18px',
      maxWidth: '267px',
    },
    medium: {
      size: '15px',
      height: '20px',
      maxWidth: '300px',
    },
    large: {
      size: '18px',
      height: '23px',
      maxWidth: '367px',
    },
    xlarge: {
      size: '22px',
      height: '27px',
      maxWidth: '433px',
    },
    xxlarge: {
      size: '28px',
      height: '33px',
      maxWidth: '567px',
    },
  },
  layer: {
    background: {
      dark: '#10212c',
      light: '#10212c',
    },
  },
  scale: 1,
  icon: {
    size: {
      small: '16px',
    },
  },
  table: {
    header: {
      extend: () => css`
        text-transform: uppercase;
        font-size: ${(props) => props.theme.text.xsmall.size};
        color: ${(props) => props.theme.global.colors['text-weak'].dark};
      `,
    },
    body: {
      pad: 'small',
    },
    row: {},
    extend: () => css`
      caption {
        font-size: ${(props) => props.theme.text.large.size};
        color: ${(props) => props.theme.global.colors.text.dark};
        font-weight: bold;
      }
    `,
  },
});

/* eslint-enable no-magic-numbers */

export type Theme = typeof theme;

export default theme;
