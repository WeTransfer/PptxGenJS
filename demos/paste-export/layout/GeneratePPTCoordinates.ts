import * as Schema from '../types/Schema';
import { colorToHex, withAlpha } from '../utils/ColorAnalysis';
import { fitToContainer } from '../utils/SizeUtils';
import { getCalculatedFontSize, getInitialAssetSize, hasAssets } from '../utils/AssetUtils';
import { gridVariables} from '../layout/SlideLayout';
import { getDisplayBleedProps } from '../layout/DisplayBleed';
import { 
	AssetContentBlock,
	Container,
	ContentBlock,
	FilestackImageContent,
	TextContentBlock,
	URLImageContent,
	VideoAsset,
} from '../types/Schema';
import { Coordinates, Dimensions } from '../types/types';
import { createSignedFilestackURL, Policy } from '../utils/Filestack';
import { getExtensionFromMimetype, getExtensionFromURL } from '../utils/URLUtils';
import { AssetLayout, getMultiAssetLayout, MultiAssetLayout } from '../layout/MultiAssetLayout';
import SlideViewModel from '../viewmodel/SlideViewModel';
import { AsyncResource } from 'async_hooks';

export interface PPTCoordinates {
	x: number;
	y: number;
	w: number;
	h: number; 
}

type BulletType = boolean | {type: 'number'}

const Gray500 = '#82827E'; 
const GreyBackgroundColor = withAlpha(Gray500, 0.9);

// standard margins on slides for layouts that don't bleed to the edge
const ArtboardMargins = {
	width: 0.9,
	height: 0.8,
  };

// PowerPoint slide dimensions in inches  
const presWidth = 10;
const presHeight = 5.625;

// conversion factor to go from pixels to inches.
export const dpi = 96 / 1.75;

// Powerpoint slide size in inches
export const slideSizeIn = {
	width: presWidth,
	height: presHeight,
};

// Powerpoint slide size in pixels
export const slideSizePx = {
	width: presWidth * dpi,
	height: presHeight * dpi,
};

// slide margins on Powerpoint slide in inches
export const artBoardDimensions = {
	x: (presWidth * (1 - ArtboardMargins.width)) / 2,
	y: (presHeight * (1 - ArtboardMargins.height)) / 2,
	w: presWidth * ArtboardMargins.width,
	h: presHeight * ArtboardMargins.height,
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

const percentStringToNumber = (percentString: string) => {
	return parseFloat(percentString) / 100;
}

// given a container in PowerPoint slide coordinates (inches)
// converts a child's Bento layoutOptions coordinates to PowerPoint slide coordinates
export const getPPTCoordinates = (parentCoordinates: PPTCoordinates, layoutOptions: Coordinates & Dimensions) => {
	const calcGridVariables = gridVariables(layoutOptions);
	const gridX = calcGridVariables['--grid-x'];
	const gridY = calcGridVariables['--grid-y'];
	const w = percentStringToNumber(calcGridVariables['--grid-width']) * parentCoordinates.w;
	const h = percentStringToNumber(calcGridVariables['--grid-height']) * parentCoordinates.h;
	const x = gridX.includes('calc')
		? parentCoordinates.x + (parentCoordinates.w - w) / 2
		: parentCoordinates.x + percentStringToNumber(gridX) * parentCoordinates.w;
	const y = gridY.includes('calc')
		? parentCoordinates.y + (parentCoordinates.h - h) / 2
		: parentCoordinates.y + percentStringToNumber(gridY) * parentCoordinates.h;
	return {
		x,
		y,
		w,
		h,
	};
};

const getTextBlockProperties = (textContentBlock: TextContentBlock) => {
	const PPTOptions = getPPTCoordinates(artBoardDimensions, textContentBlock.layoutOptions);
	const textOptions = textContentBlock.textOptions;
	const textColor = textOptions.color ? colorToHex(textOptions.color) : null;
	return {
	  ...PPTOptions,
	  color: textColor != null ? textColor : null,
	  align: textOptions.align,
	  valign: textOptions.valign,
	};
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

export const calcPPTGetBlockStyle = (
	blockType,
	slideSize,
	layoutMode,
) => {
	const fontFace = getFontFace(blockType);
	const baseFontSize = getCalculatedFontSize(slideSize, layoutMode);
	let BlockType;
	let fontSize = baseFontSize;
	let bulletType: BulletType = false;
	
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

export const getAssetContainerCoordinates = 	(
	slideCoordinates: PPTCoordinates,
	assetContainer: Container | ContentBlock,
	hasBleed: boolean
) => {
	const displayBleedProps = getDisplayBleedProps(ArtboardMargins, assetContainer, hasBleed);
	const calcAssetContainer = getPPTCoordinates(slideCoordinates, assetContainer.layoutOptions);
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

export const getAssetAreaShape = (
	container,
	slideCoordinates,
	layoutMode,
	backgroundColor,
) => {
	if (
		container.childContainer == null ||
		container.childContainer.contentBlocks.length == 0
	) {
		return {
			assetType: null,
			assetOptions: null
		};
	}
	const assetContainer = container.childContainer;
	const hasBleed = layoutMode !== 'Tell';
	return {
		...getAssetContainerCoordinates(slideCoordinates, assetContainer, hasBleed),
		fill: {type:'solid', color: backgroundColor, alpha:60}
	}
}

export const getAssetCoordinates = (
	assetContainerCoords: PPTCoordinates,
	asset: Schema.Asset,
) => {
	// determine if asset is image or OEmbed 
	const assetSize = getInitialAssetSize(asset);

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

// center multi-asset container inside assetContainer
export const getMultiAssetContainerCoordinates = (
	multiAssetLayout: MultiAssetLayout,
	assetContainerCoordinates: PPTCoordinates,
): PPTCoordinates => {
	return {
		x: assetContainerCoordinates.x + (assetContainerCoordinates.w - multiAssetLayout.multiAssetContainerStyle.width) / 2,
		y: assetContainerCoordinates.y + (assetContainerCoordinates.h - multiAssetLayout.multiAssetContainerStyle.height) / 2,
		w: multiAssetLayout.multiAssetContainerStyle.width,
		h: multiAssetLayout.multiAssetContainerStyle.height,
	}
};

export const getMultiAssetCoordinates = (
	multiAssetContainerCoords: PPTCoordinates,
	assetLayout: AssetLayout,
): PPTCoordinates => {
		return {
		x: multiAssetContainerCoords.x + assetLayout.left,
		y: multiAssetContainerCoords.y + assetLayout.top,
		h: assetLayout.height,
		w: assetLayout.width,
	};
};

export const writeAssetToSlide = (
	pptx: any,
	pptSlide: any,
	asset: Schema.Asset,
	policy: Policy,
	assetContainerCoordinates: PPTCoordinates,
	assetCoordinates: PPTCoordinates,
	isIntro: boolean,
	layoutMode: Schema.LayoutMode,
	isMultiAsset: boolean,
) => {
	let assetURL = null;
	let assetOptions = null;
	switch (asset.type) {
		case 'Image': {
			const imageAssetMetadata = (asset.content as FilestackImageContent).metadata;
			assetURL = createSignedFilestackURL(
				policy,
				imageAssetMetadata.url
			);
			assetOptions = {
				...assetCoordinates,
				path: assetURL,
				type: isIntro ? 'cover' : 'contain',
				extension: getExtensionFromMimetype(imageAssetMetadata.mimetype),
			};
			pptSlide.addImage(assetOptions);
			break;
		}
		case 'OEmbed':
			switch (asset.content.type) {
				case 'Photo': {
					const PhotoAssetUrl = (asset.content.photo as URLImageContent).url;
					assetURL = PhotoAssetUrl;
					assetOptions = {
						...assetCoordinates,
						path: assetURL,
						extension: getExtensionFromURL(PhotoAssetUrl),
						type: isIntro ? 'cover' : 'contain',
					};
					pptSlide.addImage(assetOptions);
					break;
				}
				case 'Video': {
					assetURL = asset.sourceURL;
					const videoThumbnailUrl = (asset.content.metadata.thumbnail as URLImageContent).url
					assetOptions = {
						...assetCoordinates,
						link: assetURL,
						type: 'online',
						thumbnail: {
							link: createSignedFilestackURL(policy, videoThumbnailUrl),
							extension: getExtensionFromURL(videoThumbnailUrl),
						},
					};
					pptSlide.addMedia(assetOptions);
					break;
				}
				default:
					const textBlockStyle = calcPPTGetBlockStyle(
						'header-one',
						slideSizePx,
						layoutMode,
					);
					const unsupportedCoordinates = isMultiAsset ? assetCoordinates : assetContainerCoordinates;
					assetOptions = {
						...unsupportedCoordinates,
						shape: pptx.ShapeType.rect,
						fill: GreyBackgroundColor,
						align: 'center',
						font: textBlockStyle.fontFace,
						fontSize: textBlockStyle.fontSize,
					}
					pptSlide.addText('Embed type not supported', assetOptions);
			}
			break;
		case 'Video': {
			const videoAssetMetadata = (asset as VideoAsset).transcodings[0].content.metadata;
			const videoAssetThumbnailMetadata = ((asset as VideoAsset).thumbnail as FilestackImageContent).metadata;
			assetURL = createSignedFilestackURL(policy, videoAssetMetadata.url);
			assetOptions = {
				...assetCoordinates,
				path: assetURL,
				extension: getExtensionFromMimetype(videoAssetMetadata.mimetype),
				thumbnail: {
					link: createSignedFilestackURL(policy, videoAssetThumbnailMetadata.url),
					extension: getExtensionFromMimetype(videoAssetThumbnailMetadata.mimetype),
				},
				type: 'video',
			};
			pptSlide.addMedia(assetOptions);
			break;
		}
		default:
			break;
	}
}

export const addAssetsToSlide = (
	pptx: any,
	pptSlide: any,
	slide: SlideViewModel,
	slideCoordinates: PPTCoordinates,
	container: Container,
	layoutMode: Schema.LayoutMode,
	policy: Policy, 
) => {
	const assetContainer = container.childContainer;
	
	if (!hasAssets(container)) {
		return {
			assetType: null,
			assetOptions: null
		};
	}
	const isMultiAsset = assetContainer.contentBlocks.length > 1;	
	let assetCoordinates = null;
	const hasBleed = layoutMode !== 'Tell' && !slide.hasShadow();
	const isIntro = layoutMode === 'Intro';
	const assetContainerCoordinates = getAssetContainerCoordinates(slideCoordinates, assetContainer, hasBleed)
	if (isMultiAsset && !isIntro) {
		const multiAssetLayout = getMultiAssetLayout(
			{width: assetContainerCoordinates.w, height: assetContainerCoordinates.h},
			slideSizeIn,
			slide,
			layoutMode	
		)
		const multiAssetContainerCoordinates = getMultiAssetContainerCoordinates(
			multiAssetLayout,
			assetContainerCoordinates
		);
		let multiAssetCoordinates: PPTCoordinates;
		multiAssetLayout.assetLayouts.forEach((assetLayout, index) => {
			multiAssetCoordinates = getMultiAssetCoordinates(multiAssetContainerCoordinates, assetLayout);
			writeAssetToSlide(
				pptx,
				pptSlide,
				(assetContainer.contentBlocks[index] as AssetContentBlock).content,
				policy,
				multiAssetContainerCoordinates,
				multiAssetCoordinates,
				isIntro,
				layoutMode,
				isMultiAsset,
			)
		})

	} else {
		// if in intro mode, use the last asset as the background
		const assetIndex = isIntro ? slide.assets.length - 1 : 0
		const assetContentBlock = assetContainer.contentBlocks[assetIndex] as AssetContentBlock;
		const asset = assetContentBlock.content;
		assetCoordinates = isIntro
			? assetContainerCoordinates
			: getAssetCoordinates(assetContainerCoordinates, asset);
		writeAssetToSlide(
			pptx,
			pptSlide,
			asset,
			policy,
			assetContainerCoordinates,
			assetCoordinates,
			isIntro,
			layoutMode,
			isMultiAsset,
		)
	}
}

export const getOverlayOptions = (
	container: Container,
	slideCoordinates: PPTCoordinates,
	backgroundColor: string,
) => {
	// add overlay shape to darken image and make text visible
	const assetContainer = container.childContainer;
	if (assetContainer == null) {
		return null;
	}
	const overlayCoordinates = getAssetContainerCoordinates(slideCoordinates, assetContainer, true);
	return {
		...overlayCoordinates,
		fill: {type:'solid', color: backgroundColor, alpha:60}
	}
}

export const getTextOptions = (
	layoutMode,
	container,
) => {
	const textContextBlock = container.contentBlocks[0] as TextContentBlock;
	if (!textContextBlock.textBody.hasText()) {
		return {
			textBlocks: null,
			textOptions: null,
		}
	}
	const textBlockProperties = getTextBlockProperties(textContextBlock);
	// inset should be 1em
	const inset = getCalculatedFontSize(slideSizePx, layoutMode) / dpi;
	const textOptions = {
		...textBlockProperties,
		inset: Math.round(inset * 100) / 100,
	};
	// get set of text blocks from contentState
	const blockMap = textContextBlock.textBody.getBlockMap();
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
		const blockStyle = PPTGetBlockStyle(block.getType(), slideSizePx, layoutMode, textContextBlock.textOptions);
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
			break: true,
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