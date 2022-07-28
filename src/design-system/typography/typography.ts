/* eslint-disable sort-keys-fix/sort-keys-fix */
import { precomputeValues } from '@capsizecss/core';
import { PixelRatio, Platform } from 'react-native';
import { ForegroundColor } from './../color/palettes';
import { fontWeights } from './fontWeights';
import { typeHierarchy } from './typeHierarchy';

type CreateTextSize = {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  marginCorrection: {
    ios: number;
    android: number;
  };
};
type TextSize = {
  fontSize: number;
  lineHeight?: number;
  marginBottom: number;
  marginTop: number;
  letterSpacing: number;
};
type HeadingKey = keyof typeof typeHierarchy.heading;
type TextKey = keyof typeof typeHierarchy.text;
type HeadingSizes = {
  [Key in HeadingKey]: TextSize;
};
type TextSizes = {
  [Key in TextKey]: TextSize;
};

const capsize = (options: Parameters<typeof precomputeValues>[0]) => {
  const values = precomputeValues(options);
  const fontSize = parseFloat(values.fontSize);
  const baselineTrimEm = parseFloat(values.baselineTrim);
  const capHeightTrimEm = parseFloat(values.capHeightTrim);
  const fontScale = PixelRatio.getFontScale();

  return {
    fontSize,
    lineHeight:
      values.lineHeight !== 'normal'
        ? parseFloat(values.lineHeight)
        : undefined,
    marginBottom: PixelRatio.roundToNearestPixel(
      baselineTrimEm * fontSize * fontScale
    ),
    marginTop: PixelRatio.roundToNearestPixel(
      capHeightTrimEm * fontSize * fontScale
    ),
  } as const;
};

export const fonts = {
  SFProRounded: {
    regular: {
      fontFamily: ios ? 'SF Pro Rounded' : 'SF-Pro-Rounded-Regular',
      fontWeight: ios ? fontWeights.regular : 'normal',
    },
    medium: {
      fontFamily: ios ? 'SF Pro Rounded' : 'SF-Pro-Rounded-Medium',
      fontWeight: ios ? fontWeights.medium : 'normal',
    },
    semibold: {
      fontFamily: ios ? 'SF Pro Rounded' : 'SF-Pro-Rounded-Semibold',
      fontWeight: ios ? fontWeights.semibold : 'normal',
    },
    bold: {
      fontFamily: ios ? 'SF Pro Rounded' : 'SF-Pro-Rounded-Bold',
      fontWeight: ios ? fontWeights.bold : 'normal',
    },
    heavy: {
      fontFamily: ios ? 'SF Pro Rounded' : 'SF-Pro-Rounded-Heavy',
      fontWeight: ios ? fontWeights.heavy : 'normal',
    },
  },

  SFMono: {
    regular: {
      fontFamily: ios ? 'SF Mono' : 'SFMono-Regular',
      fontWeight: ios ? fontWeights.regular : 'normal',
    },
    medium: {
      fontFamily: ios ? 'SF Mono' : 'SFMono-Medium',
      fontWeight: ios ? fontWeights.medium : 'normal',
    },
  },
} as const;

const { heavy, bold } = fonts.SFProRounded;
export const headingWeights = { heavy, bold };
export const textWeights = fonts.SFProRounded;

// Sourced from https://seek-oss.github.io/capsize
export const fontMetrics = {
  capHeight: 1443,
  ascent: 1950,
  descent: -494,
  lineGap: 0,
  unitsPerEm: 2048,
} as const;

const createTextSize = ({
  fontSize,
  lineHeight: leading,
  letterSpacing,
  marginCorrection,
}: CreateTextSize): TextSize => {
  const styles = {
    letterSpacing,
    ...capsize({
      fontMetrics,
      fontSize,
      leading,
    }),
  } as const;

  const marginCorrectionForPlatform = marginCorrection[ios ? 'ios' : 'android'];

  if (Platform.OS === 'web') {
    return styles;
  }
  return {
    ...styles,
    marginTop: PixelRatio.roundToNearestPixel(
      styles.marginTop + marginCorrectionForPlatform
    ),
    marginBottom: PixelRatio.roundToNearestPixel(
      styles.marginBottom - marginCorrectionForPlatform
    ),
  };
};

export const headingSizes = Object.entries(typeHierarchy.heading).reduce(
  (acc, [key, value]) => {
    acc[key as HeadingKey] = createTextSize(value);
    return acc;
  },
  {} as HeadingSizes
);

export const textSizes = Object.entries(typeHierarchy.text).reduce(
  (acc, [key, value]) => {
    acc[key as TextKey] = createTextSize(value);

    return acc;
  },
  {} as TextSizes
);

function selectForegroundColors<
  SelectedColors extends readonly (ForegroundColor | 'accent')[]
>(...colors: SelectedColors): SelectedColors {
  return colors;
}

export const textColors = selectForegroundColors(
  'accent',
  'action',
  'primary',
  'secondary',
  'secondary10',
  'secondary20',
  'secondary25',
  'secondary30',
  'secondary40',
  'secondary50',
  'secondary60',
  'secondary70',
  'secondary80'
);

export type TextColor = typeof textColors[number];
