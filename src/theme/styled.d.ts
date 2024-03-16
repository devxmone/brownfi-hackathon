import { FlattenSimpleInterpolation, ThemedCssFunction } from 'styled-components';

export type Color = string;
export interface Colors {
  white: Color;
  black: Color;

  dark5: Color;

  colorContrast: Color;

  bg0: Color;
  bg1: Color;
  bg3: Color;
  bg4: Color;
  bg5: Color;

  primary1: Color;
  primary2: Color;
  primary3: Color;
  primary4: Color;
  text1: Color;
  text2: Color;

  red1: Color;
  red2: Color;
  red3: Color;
  green1: Color;
  green2: Color;
  yellow1: Color;
  yellow2: Color;
  yellow3: Color;
  blue1: Color;

  error: Color;
  success: Color;
  warning: Color;
}

export interface Grids {
  sm: number;
  md: number;
  lg: number;
}

declare module 'styled-components' {
  export interface DefaultTheme extends Colors {
    grids: Grids;

    // shadows
    shadow1: string;

    // media queries
    mediaWidth: {
      upToExtraSmall: ThemedCssFunction<DefaultTheme>;
      upToSmall: ThemedCssFunction<DefaultTheme>;
      upToMedium: ThemedCssFunction<DefaultTheme>;
      upToLarge: ThemedCssFunction<DefaultTheme>;
    };

    // css snippets
    flexColumnNoWrap: FlattenSimpleInterpolation;
    flexRowNoWrap: FlattenSimpleInterpolation;
  }
}
