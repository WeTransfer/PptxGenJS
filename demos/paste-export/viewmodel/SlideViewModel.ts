import * as Schema from '../schema/Schema';
import { colorAnalysis, colorToHex } from '../coloranalysis/ColorAnalysis';

export const LAYOUT_MODE_SHOW = 'Show';
export const LAYOUT_MODE_TELL = 'Tell';
export const LAYOUT_MODE_INTRO = 'Intro';
export const White = '#FFFFFF';

export const getTextAssetPosition = (slide: Schema.Slide) => {

    const textPositionCustomization = slide.layoutCustomizations.find((c) => 'TextAssetPosition' === c.type)

    const {position: assetPosition} = textPositionCustomization as Schema.TextAssetPositionCustomization || {position: null}

    // return auto position if position not defined in schema or as override
    return assetPosition;
}

export const getLayoutMode = (slide: Schema.Slide) => {
    const layoutModeCustomization = slide.layoutCustomizations.find((c) => 'LayoutMode' === c.type)
    const {mode: slideLayoutMode} = layoutModeCustomization as Schema.LayoutModeCustomization || {mode: null}
    const layoutModeAuto = slide.layoutCustomizations.find((c) => 'LayoutModeAuto' === c.type)
    const {mode: slideLayoutModeAuto} = layoutModeAuto as Schema.LayoutModeCustomization || {mode: null}
    const finalLayoutMode = slideLayoutMode !== null ? slideLayoutMode :
        (slideLayoutModeAuto !== null ? slideLayoutModeAuto : LAYOUT_MODE_TELL)

    return (finalLayoutMode)
}

const getAutoColorPalette = (slide) => {
    const colorPalette =
      slide.assets.length > 0 ? slide.assets[0].metadata.colorPalette : null;
    return colorPalette;
}

const getColorPalette = (slide) => {
    if (slide.backgroundColor == null) {
      if (getAutoColorPalette(slide) == null) {
        return colorAnalysis(White);
      } else {
        return getAutoColorPalette(slide);
      }
    } else {
        return colorAnalysis(slide.backgroundColor);
    }
}

export const getAutoTextColor = (slide) => {
    return getColorPalette(slide).text;
}

export const getBackGroundColor = (slide) => {
    return colorToHex(getColorPalette(slide).background);
};

export const getTextColor = (slide) => {
    return colorToHex(slide.textColor || getAutoTextColor(slide));
}
