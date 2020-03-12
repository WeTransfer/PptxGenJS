import { colorToHex, withAlpha } from './ColorAnalysis.mjs';
import { createSignedFilestackURL, getExtensionFromMimetype, getExtensionFromURL } from './Filestack.mjs';
import { fitToContainer, getDisplayBleedProps, gridVariables} from './BentoFunctions.mjs';

const Gray500 = '#82827E'; 
const UnsupportedBackgroundColor = withAlpha(Gray500, 0.9);

// standard margins on slides for layouts that don't bleed to the edge
const ArtboardMargins = {
	width: 0.9,
	height: 0.8,
  };

// PowerPoint slide dimensions in inches  
const presWidth = 10;
const presHeight = 5.625;

// conversion factor to go from pixels to inches.
const dpi = 96 / 1.75;

// Powerpoint slide size in pixels
const slideSize = {
	width: presWidth * dpi,
	height: presHeight * dpi,
};

// slide margins on Powerpoint slide in inches
const artBoardDimensions = {
	x: (presWidth * (1 - ArtboardMargins.width)) / 2,
	y: (presHeight * (1 - ArtboardMargins.height)) / 2,
	width: presWidth * ArtboardMargins.width,
	height: presHeight * ArtboardMargins.height,
};

const BaseFontIntroSize = 42;
const BaseFontTellSize = 28;
const BaseFontShowSize = 19;

const H1FontIntroSize = 101;
const H1FontTellSize = 68;
const H1FontShowSize = 45;

const H2FontIntroSize = 57;
const H2FontTellSize = 38;
const H2FontShowSize = 25;

const CodeFontIntroSize = 39;
const CodeFontTellSize = 26;
const CodeFontShowSize = 17;

// font, line and margin settings for different block types
const blockTypeOptions = [
  {
	blockType: 'header-one',
	layoutMode: 'Intro',
	fontSize: 101 / 42,
	lineSpacing: (80 * 1.5) / H1FontIntroSize,
	paraSpaceAfter: 0.25,
	paraSpaceBefore: 0.5,
  },
  {
	blockType: 'header-one',
	layoutMode: 'Show',
	fontSize: 45 / 19,
	lineSpacing: 80 / 1.5 / H1FontShowSize,
	paraSpaceAfter: 0.5,
	paraSpaceBefore: 0.1,
  },
  {
	blockType: 'header-one',
	layoutMode: 'Tell',
	fontSize: 68 / 28,
	lineSpacing: 80 / H1FontTellSize,
	paraSpaceAfter: 0.25,
	paraSpaceBefore: 0.5,
  },
  {
	blockType: 'header-two',
	layoutMode: 'Intro',
	fontSize: 57 / 42,
	lineSpacing: (55 * 1.5) / H2FontIntroSize,
	paraSpaceAfter: 0.3,
	paraSpaceBefore: 0.75,
  },
  {
	blockType: 'header-two',
	layoutMode: 'Show',
	fontSize: 25 / 19,
	lineSpacing: 55 / 1.5 / H2FontShowSize,
	paraSpaceAfter: 0.3,
	paraSpaceBefore: 0.75,
  },
  {
	blockType: 'header-two',
	layoutMode: 'Tell',
	fontSize: 38 / 28,
	lineSpacing: 48 / H2FontTellSize,
	paraSpaceAfter: 0.3,
	paraSpaceBefore: 0.75,
  },
  {
	blockType: 'unstyled',
	layoutMode: 'Intro',
	fontSize: 1,
	lineSpacing: (41 * 1.5) / BaseFontIntroSize,
	paraSpaceAfter: 0,
	paraSpaceBefore: 0,
  },
  {
	blockType: 'unstyled',
	layoutMode: 'Show',
	fontSize: 1,
	lineSpacing: 41 / 1.5 / BaseFontShowSize,
	paraSpaceAfter: 0,
	paraSpaceBefore: 0,
  },
  {
	blockType: 'unstyled',
	layoutMode: 'Tell',
	fontSize: 1,
	lineSpacing: 41 / BaseFontTellSize,
	paraSpaceAfter: 0,
	paraSpaceBefore: 0,
  },
  {
	blockType: 'code-block',
	layoutMode: 'Intro',
	fontSize: 39 / 42,
	lineSpacing: 38 / CodeFontIntroSize,
	paraSpaceAfter: 0,
	paraSpaceBefore: 0,
  },
  {
	blockType: 'code-block',
	layoutMode: 'Show',
	fontSize: 17 / 19,
	lineSpacing: 38 / CodeFontShowSize,
	paraSpaceAfter: 0,
	paraSpaceBefore: 0,
  },
  {
	blockType: 'code-block',
	layoutMode: 'Tell',
	fontSize: 26 / 28,
	lineSpacing: 38 / CodeFontTellSize,
	paraSpaceAfter: 0,
	paraSpaceBefore: 0,
  },
  {
	blockType: 'list-item',
	layoutMode: 'Intro',
	fontSize: 1,
	lineSpacing: (41 * 1.5) / BaseFontIntroSize,
	paraSpaceAfter: 0,
	paraSpaceBefore: 0,
  },
  {
	blockType: 'list-item',
	layoutMode: 'Show',
	fontSize: 1,
	lineSpacing: 41 / 1.5 / BaseFontShowSize,
	paraSpaceAfter: 0,
	paraSpaceBefore: 0,
  },
  {
	blockType: 'list-item',
	layoutMode: 'Tell',
	fontSize: 1,
	lineSpacing: 41 / BaseFontTellSize,
	paraSpaceAfter: 0,
	paraSpaceBefore: 0,
  },
];

const LAYOUT_MODE_SHOW = 'Show';
const LAYOUT_MODE_TELL = 'Tell';
const LAYOUT_MODE_INTRO = 'Intro';

const TEXT_BASE_FONT_SIZE = 28;
const TEXT_BASE_FONT_SIZE_INTRO = 45;
const TEXT_BASE_FONT_SIZE_TELL = 28;
const TEXT_BASE_FONT_SIZE_SHOW = 20;
const BASE_LAYOUT_WIDTH = 1440;

const percentStringToNumber = (percentString) => {
	return parseFloat(percentString) / 100;
}

// converts Bento schema coordinates to PowerPoint slide coordinates
const getPPTCoordinates = (block) => {
	const calcGridVariables = gridVariables(block);
	const gridX = calcGridVariables['--grid-x'];
	const gridY = calcGridVariables['--grid-y'];
	const w = percentStringToNumber(calcGridVariables['--grid-width']) * artBoardDimensions.width;
	const h = percentStringToNumber(calcGridVariables['--grid-height']) * artBoardDimensions.height;
	const x = gridX.includes('calc')
		? artBoardDimensions.x + (artBoardDimensions.width - w) / 2
		: artBoardDimensions.x + percentStringToNumber(gridX) * artBoardDimensions.width;
	const y = gridY.includes('calc')
		? artBoardDimensions.y + (artBoardDimensions.height - h) / 2
		: artBoardDimensions.y + percentStringToNumber(gridY) * artBoardDimensions.height;
	return {
		x,
		y,
		w,
		h,
	};
};

const getTextBlockProperties = (textContentBlock) => {
	const PPTOptions = getPPTCoordinates(textContentBlock);
	const textOptions = textContentBlock.textOptions;
	const textColor = textOptions.color ? colorToHex(textOptions.color) : null;
	return {
	  ...PPTOptions,
	  color: textColor != null ? textColor : null,
	  align: textOptions.align,
	  valign: textOptions.valign,
	};
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
	}
};

const layoutGetCalculatedFontSize = (
	containerSize,
	baseLayoutWidth,
	baseFontSize,
) => {
	return (containerSize.width / baseLayoutWidth) * baseFontSize;
};

const getcalculatedFontSize = (slideSize, layoutMode) => {
	const adjustedFontSize = getAdjustedBaseFontSize(TEXT_BASE_FONT_SIZE, layoutMode);
	// these functions return px.  Multiply by 4/3 to get pt, which PptxGenJS uses.
	return (
		layoutGetCalculatedFontSize(slideSize, BASE_LAYOUT_WIDTH, adjustedFontSize) * (4 / 3)
	);
};

const getFontFace = (blockType) => {
	let fontFace;
	switch (blockType) {
		case 'header-one':
		fontFace = 'AvenirNext-Bold';
		break;
		case 'header-two':
		fontFace = 'AvenirNext-DemiBold'; 
		break;
		default:
		fontFace = 'AvenirNext-Regular'; 
		break;
	}
	return blockType === 'code-block'
		? 'courier, monospace'
		: fontFace;
};

const calcPPTGetBlockStyle = (
	blockType,
	slideSize,
	layoutMode,
) => {
	const fontFace = getFontFace(blockType);
	const baseFontSize = getcalculatedFontSize(slideSize, layoutMode);
	let BlockType;
	let fontSize = baseFontSize;
	let bulletType = false;
	
	switch (blockType) {
		case 'header-one':
		case 'header-two':
		case 'unstyled':
		case 'code-block':
			BlockType = blockType;
			break;
		case 'unordered-list-item':
		case 'checkbox-list-item':
			bulletType = true;
			BlockType = 'list-item';
			break;
		case 'ordered-list-item':
			bulletType = { type: 'number' };
			BlockType = 'list-item';
			break;
		default:
			break;
	}
	
	const blockValues = blockTypeOptions.find(
		element => element.blockType === BlockType && element.layoutMode === layoutMode,
	);
	fontSize = baseFontSize * blockValues.fontSize;
	return {
		fontFace,
		fontSize,
		lineSpacing: fontSize * blockValues.lineSpacing,
		paraSpaceAfter: fontSize * blockValues.paraSpaceAfter,
		paraSpaceBefore: fontSize * blockValues.paraSpaceBefore,
		bullet: bulletType,
	};
};

const PPTGetBlockStyle = (
	blockType,
	slideSize,
	layoutMode,
	textOptions,
) => {
	const blockStyle = calcPPTGetBlockStyle(blockType, slideSize, layoutMode);
	return {
		...blockStyle,
		fontSize: Math.round(blockStyle.fontSize),
		lineSpacing: Math.round(blockStyle.lineSpacing),
		paraSpaceAfter: Math.round(blockStyle.paraSpaceAfter),
		paraSpaceBefore: Math.round(blockStyle.paraSpaceBefore),
		align: textOptions.align != null ? textOptions.align : null,
		valign: textOptions.valign != null ? textOptions.valign : null,
	};
};

const getInlineStyles = (rangeStyle) => {
	if (rangeStyle.size > 0) {
		return {
		bold: rangeStyle.hasStyle('BOLD'),
		italic: rangeStyle.hasStyle('ITALIC'),
		};
	}
	return {
		bold: false,
		italic: false,
	};
};

export const getAssetContainerCoordinates = (assetContainer, hasBleed) => {
	const displayBleedProps = getDisplayBleedProps(ArtboardMargins, assetContainer, hasBleed);
	const calcAssetContainer = getPPTCoordinates(assetContainer);
	return hasBleed
		? {
			x: Math.max(
			0,
			calcAssetContainer.x +
				percentStringToNumber(displayBleedProps.left) * calcAssetContainer.w),
			y: Math.max(
			0,
			calcAssetContainer.y +
				percentStringToNumber(displayBleedProps.top) * calcAssetContainer.h),
			h: Math.min(
			calcAssetContainer.h * percentStringToNumber(displayBleedProps.height), presHeight),
			w: Math.min(
			calcAssetContainer.w * percentStringToNumber(displayBleedProps.width), presWidth),
		}
		: calcAssetContainer;
};

export const getAssetCoordinates = (
	assetContainer, 
	hasBleed, 
	asset,
) => {
	// determine if asset is image or OEmbed 
	let assetSize 
	switch(asset.type) {
		case 'Image':
			assetSize = asset.content.size;
			break;
		case 'OEmbed':
			switch (asset.content.type) {
				case 'Photo':
					assetSize = asset.content.photo.size;
					break;
				default:
					// for videos and other embeds
					assetSize = asset.content
					break;
			}
			break;
		case 'Video':
			assetSize = asset.transcodings[0].content.size;
			break;
	}
	const assetContainerCoords = getAssetContainerCoordinates(assetContainer, hasBleed);
	const assetDimensions = fitToContainer({source: assetSize, target: { height: assetContainerCoords.h, width: assetContainerCoords.w }});
	const x = assetContainerCoords.x + (assetContainerCoords.w - assetDimensions.width) / 2;
	const y = assetContainerCoords.y + (assetContainerCoords.h - assetDimensions.height) / 2;
	return {
		x,
		y,
		h: assetDimensions.height,
		w: assetDimensions.width,
	};
};

export const getAssetOptions = (presentation, container, slide, layoutMode, policy) => {
	const asset = slide.assets[0];
	if (!asset) {
		return {
			assetType: null,
			assetOptions: null
		};
	}
	let assetURL = null;
	let assetCoordinates = null;
	let assetOptions = null;
	const hasBleed = layoutMode !== 'Tell';
	const isIntro = layoutMode === 'Intro';
	assetCoordinates = isIntro
		? getAssetContainerCoordinates(container.assetContainer, hasBleed)
		: getAssetCoordinates(container.assetContainer, hasBleed, asset);
	switch (asset.type) {
	case 'Image': {
		assetURL = createSignedFilestackURL(policy, asset.content.metadata.url);
		assetOptions = {
			...assetCoordinates,
			path: assetURL,
			type: isIntro ? 'cover' : 'contain',
			extension: getExtensionFromMimetype(asset.content.metadata.mimetype),
		};
		return {assetType: 'image', assetOptions};
	}
	case 'OEmbed':
		switch (asset.content.type) {
			case 'Photo': {
				assetURL = asset.content.photo.url;
				assetOptions = {
					...assetCoordinates,
					path: assetURL,
					extension: getExtensionFromURL(asset.content.photo.url),
					type: isIntro ? 'cover' : 'contain',
				};
				return {assetType: 'image', assetOptions};
			}
			case 'Video': {
				assetURL = asset.sourceURL;
				assetOptions = {
					...assetCoordinates,
					link: assetURL,
					type: 'online',
					thumbnail: {
						link: createSignedFilestackURL(policy, asset.content.metadata.thumbnail.url),
						extension: getExtensionFromURL(asset.content.metadata.thumbnail.url),
				},
				};
				return {assetType: 'media', assetOptions};
			}
			default:
				const textBlockStyle = calcPPTGetBlockStyle(
					'header-one',
					slideSize,
					layoutMode,
				);
				assetOptions = {
					...getAssetContainerCoordinates(container.assetContainer, hasBleed),
					shape: presentation.ShapeType.rect,
					fill: UnsupportedBackgroundColor,
					align: 'center',
					font: textBlockStyle.fontFace,
					fontSize: textBlockStyle.fontSize,
				}
				return {assetType: 'unsupported', assetOptions};
		}
	case 'Video': {
		assetURL = createSignedFilestackURL(policy, asset.transcodings[0].content.metadata.url);
		assetOptions = {
			...assetCoordinates,
			path: assetURL,
			extension: getExtensionFromMimetype(asset.transcodings[0].content.metadata.mimetype),
			thumbnail: {
				link: createSignedFilestackURL(policy, asset.thumbnail.metadata.url),
				extension: getExtensionFromMimetype(asset.thumbnail.metadata.mimetype),
			},
			type: 'video',
		};
		return {assetType: 'media', assetOptions};
	}
	default:
		return null;
	}
}

export const getTextOptions = (
	layoutMode,
	container,
) => {
	if (!container.text.textBody.hasText()) {
		return {
			textBlocks: null,
			textOptions: null,
		}
	}
	const textBlockProperties = getTextBlockProperties(container.text);
	// inset should be 1em
	const inset = getcalculatedFontSize(slideSize, layoutMode) / dpi;
	const textOptions = {
		...textBlockProperties,
		inset: Math.round(inset * 100) / 100,
	};
	// get set of text blocks from contentState
	const blockMap = container.text.textBody.getBlockMap();
	// create an array to store the data and styling for each text block
	const textBlocks = [];
	let charStyleRangeStart = 0;
	let currentMetadata = null;
	let inlineStyles = null;
	let inlineOptions = null;
	let textBlock = null;
	let isFirstRun = false;
	let calcBlockStyle = null;
	let addBreak = null;
	blockMap.forEach(block => {
		const charList = block.getCharacterList();
		const blockStyle = PPTGetBlockStyle(block.getType(), slideSize, layoutMode, container.text.textOptions);
		charStyleRangeStart = 0;
		charList.forEach((charMetadata, index) => {
			if (index === 0) {
				currentMetadata = charMetadata;
				isFirstRun = true;
			}
			if (charMetadata.getStyle() !== currentMetadata.getStyle()) {
				// create text styling range leading up to this style change
				inlineStyles = getInlineStyles(currentMetadata);
				calcBlockStyle = isFirstRun ? blockStyle : null;
				addBreak = isFirstRun ? null : {break: false}
				inlineOptions = {
					...inlineStyles,
					...calcBlockStyle,
					...addBreak,
					fontFace: blockStyle.fontFace,
					fontSize: blockStyle.fontSize,
				};
				textBlock = {
					text: block.getText().substring(charStyleRangeStart, index),
					options: inlineOptions,
				};
				textBlocks.push(textBlock);
				charStyleRangeStart = index;
				currentMetadata = charMetadata;
				isFirstRun = false;
			}
		});
		inlineStyles = getInlineStyles(currentMetadata);
		calcBlockStyle = isFirstRun ? blockStyle : null;
		inlineOptions = {
			...inlineStyles,
			...calcBlockStyle,
			break: truncateSync,
			fontFace: blockStyle.fontFace,
			fontSize: blockStyle.fontSize,
		};
		textBlock = {
			text: block.getText().substring(charStyleRangeStart, charList.size),
			options: inlineOptions,
		};
		textBlocks.push(textBlock);
	});
	return {
		textBlocks,
		textOptions,
	};
};