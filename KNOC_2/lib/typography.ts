/**
 * Centralized Typography & Responsive Scaling System
 *
 * This module provides:
 * 1. A unified spacing / sizing scale via react-native-size-matters
 * 2. A font-family map (Gilroy weights)
 * 3. Pre-defined text style presets (heading, subheading, body, …)
 *
 * Every numeric size in the app should come through the helpers exported here
 * so that the UI scales proportionally across screen sizes and pixel densities.
 */

import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { TextStyle } from 'react-native';

/* ───────────────────────── Font Family Map ───────────────────────── */

export const FontFamily = {
    regular: 'Gilroy-Regular',
    medium: 'Gilroy-Medium',
    semiBold: 'Gilroy-SemiBold',
    bold: 'Gilroy-Bold',
    extraBold: 'Gilroy-ExtraBold',
    heavy: 'Gilroy-Heavy',
} as const;

/* ──────────────────── Re-export scaling helpers ──────────────────── */

/** Horizontal scale – use for widths, horizontal padding / margin, icon sizes */
export const s = scale;

/** Vertical scale – use for heights, vertical padding / margin */
export const vs = verticalScale;

/**
 * Moderate scale – use for font sizes and border-radii.
 * The optional second parameter (factor) defaults to 0.5 in the library,
 * giving a middle-ground between scaling fully and not at all.
 * For fonts we use factor = 0.25 so text doesn't grow too aggressively.
 */
export const ms = (size: number, factor?: number) =>
    moderateScale(size, factor ?? 0.25);

/* ────────────────── Typography Style Presets ────────────────────── */

export const Typography = {
    /** Page-level titles – e.g. "Welcome, Username" */
    heading: {
        fontFamily: FontFamily.bold,
        fontSize: ms(18),
        lineHeight: ms(22),
    } as TextStyle,

    /** Section titles – e.g. "Recently KNOC" */
    subheading: {
        fontFamily: FontFamily.extraBold,
        fontSize: ms(16),
        lineHeight: ms(22),
    } as TextStyle,

    /** Card titles, settings rows */
    title: {
        fontFamily: FontFamily.semiBold,
        fontSize: ms(15),
        lineHeight: ms(20),
    } as TextStyle,

    /** Default paragraph / body text */
    body: {
        fontFamily: FontFamily.regular,
        fontSize: ms(13),
        lineHeight: ms(18),
    } as TextStyle,

    /** Body with medium weight */
    bodyMedium: {
        fontFamily: FontFamily.medium,
        fontSize: ms(13),
        lineHeight: ms(18),
    } as TextStyle,

    /** Smaller supportive text */
    caption: {
        fontFamily: FontFamily.regular,
        fontSize: ms(11),
        lineHeight: ms(14),
    } as TextStyle,

    /** Caption with medium weight */
    captionMedium: {
        fontFamily: FontFamily.medium,
        fontSize: ms(11),
        lineHeight: ms(14),
    } as TextStyle,

    /** Small labels – e.g. stat labels */
    label: {
        fontFamily: FontFamily.semiBold,
        fontSize: ms(13),
        lineHeight: ms(16),
    } as TextStyle,

    /** Big stat numbers */
    stat: {
        fontFamily: FontFamily.heavy,
        fontSize: ms(32),
    } as TextStyle,

    /** Button text */
    button: {
        fontFamily: FontFamily.medium,
        fontSize: ms(15),
    } as TextStyle,

    /** Button text – semi-bold variant */
    buttonSemiBold: {
        fontFamily: FontFamily.semiBold,
        fontSize: ms(15),
    } as TextStyle,

    /** Small button / link text */
    buttonSmall: {
        fontFamily: FontFamily.medium,
        fontSize: ms(13),
    } as TextStyle,

    /** Header title text */
    headerTitle: {
        fontFamily: FontFamily.semiBold,
        fontSize: ms(16),
    } as TextStyle,

    /** OTP / code input digits */
    otpDigit: {
        fontFamily: FontFamily.medium,
        fontSize: ms(20),
    } as TextStyle,

    /** Large card title text */
    cardTitle: {
        fontFamily: FontFamily.bold,
        fontSize: ms(18),
    } as TextStyle,

    /** Card subtitle text */
    cardSubtitle: {
        fontFamily: FontFamily.regular,
        fontSize: ms(11),
    } as TextStyle,
} as const;

/* ────────────────────── Spacing Helpers ─────────────────────────── */

/**
 * Common spacings scaled for screen size.
 * Usage: `padding: Spacing.md` instead of hardcoded `16`.
 */
export const Spacing = {
    xxs: s(4),
    xs: s(8),
    sm: s(10),
    md: s(14),
    lg: s(18),
    xl: s(22),
    xxl: s(28),
    xxxl: s(36),
} as const;

/**
 * Vertical spacings (for paddingVertical / marginVertical / heights).
 */
export const VSpacing = {
    xxs: vs(4),
    xs: vs(8),
    sm: vs(10),
    md: vs(14),
    lg: vs(18),
    xl: vs(22),
    xxl: vs(28),
    xxxl: vs(36),
} as const;

/* ────────────────────── Common Dimensions ───────────────────────── */

export const Radius = {
    sm: ms(4),
    md: ms(6),
    lg: ms(10),
    xl: ms(14),
    xxl: ms(16),
    full: ms(9999),
} as const;

/** Standard tappable element height */
export const ButtonHeight = vs(46);

/** Standard icon sizes */
export const IconSize = {
    sm: ms(16),
    md: ms(20),
    lg: ms(22),
    xl: ms(28),
} as const;
