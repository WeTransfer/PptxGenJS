import * as Schema from '../types/Schema';
import { Asset, Size } from '../types/Schema';
import {
    ASSET_FRAME_DESKTOP,
    ASSET_FRAME_FILL,
    ASSET_FRAME_LAPTOP,
    ASSET_FRAME_NONE,
    ASSET_FRAME_PHONE,
    ASSET_FRAME_PHONE_X,
    ASSET_FRAME_ROUNDED,
    ASSET_FRAME_SHADOW,
    ASSET_FRAME_TABLET,
    ASSET_FRAME_WINDOW,
    LAYOUT_MODE_INTRO,
    LAYOUT_MODE_SHOW,
    LAYOUT_MODE_TELL,
  } from '../viewmodel/SlideViewModel';

export const TEXT_BASE_FONT_SIZE = 28;
export const TEXT_BASE_FONT_SIZE_INTRO = 45;
export const TEXT_BASE_FONT_SIZE_TELL = 28;
export const TEXT_BASE_FONT_SIZE_SHOW = 20;
export const BASE_LAYOUT_WIDTH = 1440;

export const getInitialAssetSize = (asset: Asset): Size => {
	switch(asset.type) {
		case 'Image':
			return asset.content.size;
		case 'OEmbed':
			switch (asset.content.type) {
				case 'Photo':
					return asset.content.photo.size;
				case 'Video':
					return asset.content.size;
				default:
					// for other embeds
					return {width: 0, height: 0}
			}
		case 'Video':
			return asset.transcodings[0].content.size;
    }
    return {width: 0, height: 0} 
}

export const calcOverallAssetSize = (
    asset: Asset,
    assetFrame: Schema.AssetFrameType,
    layoutMode: Schema.LayoutMode,
    isMultiAsset: boolean,
  ): Schema.Size | null => {
    // calculates overall asset size including assetFrame
    // ignore assetFrames for now
    return getInitialAssetSize(asset);
  };

const getAdjustedBaseFontSize = (
    baseFontSize,
    layoutMode,
) => {
    switch (layoutMode) {
        case LAYOUT_MODE_SHOW:
        return TEXT_BASE_FONT_SIZE_SHOW * (baseFontSize / TEXT_BASE_FONT_SIZE);
        case LAYOUT_MODE_TELL:
        return TEXT_BASE_FONT_SIZE_TELL * (baseFontSize / TEXT_BASE_FONT_SIZE);
        case LAYOUT_MODE_INTRO:
        return TEXT_BASE_FONT_SIZE_INTRO * (baseFontSize / TEXT_BASE_FONT_SIZE);
        default:
    };
};

export const layoutGetCalculatedFontSize = (
	containerSize,
	baseLayoutWidth,
	baseFontSize,
) => {
	return (containerSize.width / baseLayoutWidth) * baseFontSize;
};

export const getCalculatedFontSize = (
    slideSize: Schema.Size,
    layoutMode: Schema.LayoutMode,
) => {
	const adjustedFontSize = getAdjustedBaseFontSize(TEXT_BASE_FONT_SIZE, layoutMode);
	// these functions return px.  Multiply by 4/3 to get pt, which PptxGenJS uses.
	return (
		layoutGetCalculatedFontSize(slideSize, BASE_LAYOUT_WIDTH, adjustedFontSize) * (4 / 3)
	);
};

export const hasAssets = (container: Schema.Container): boolean => {
    const assetContainer = container.childContainer;
	if (
		assetContainer == null ||
		assetContainer.contentBlocks.length == 0
	) {
		return false;
    }
    return true;
}