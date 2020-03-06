
function getTimestamp() {
	var dateNow = new Date();
	var dateMM = dateNow.getMonth() + 1; dateDD = dateNow.getDate(); dateYY = dateNow.getFullYear(), h = dateNow.getHours(); m = dateNow.getMinutes();
	return dateNow.getFullYear() +''+ (dateMM<=9 ? '0' + dateMM : dateMM) +''+ (dateDD<=9 ? '0' + dateDD : dateDD) + (h<=9 ? '0' + h : h) + (m<=9 ? '0' + m : m);
}

// ==================================================================================================================

function execGenSlidesFuncs(type) {
	// STEP 1: Instantiate new PptxGenJS object
	var pptx;
	var PptxGenJsLib;
	var fs = require('fs');
	if (fs.existsSync('../../dist/pptxgen.cjs.js')) {
		PptxGenJsLib = require('../../dist/pptxgen.cjs.js'); // for LOCAL TESTING
	}
	else {
		PptxGenJsLib = require("pptxgenjs");
	}
	pptx = new PptxGenJsLib();

	genSlides_Paste(pptx);
	
	// Export Presentation
	return pptx.writeFile('PptxGenJS_Demo_Node_'+type+'_'+getTimestamp());
}

function genSlides_Paste(pptx) {
	var Draft = require('draft-js');
	var tinycolor = require('tinycolor2');
	var slide = require('./json/PasteSchema.json');
	var bentoSchema = require('./json/PasteBentoSchema.json');
	var textBody = require('./json/TextBody.json');

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

	const LAYOUT_MODE_SHOW = 'Show';
 	const LAYOUT_MODE_TELL = 'Tell';
 	const LAYOUT_MODE_INTRO = 'Intro';
	
	const TEXT_BASE_FONT_SIZE = 28;
	const TEXT_BASE_FONT_SIZE_INTRO = 45;
	const TEXT_BASE_FONT_SIZE_TELL = 28;
	const TEXT_BASE_FONT_SIZE_SHOW = 20;
	const BASE_LAYOUT_WIDTH = 1440;
	
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

	const White = '#FFFFFF';
	
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
	
	// port of some of the Bento code to convert Bento schema into positions
	 const relativePosition = ({ layoutOptions }) => {
		const { x, y, width, height } = layoutOptions;
	  
		const isFullWidth = width === 12 || width === null;
		const isFullHeight = height === 6 || height === null;
		const isLeft = x === 0 || x === 'center';
		const isTop = y === 0 || y === 'center';
	  
		if (isLeft && isTop && isFullHeight && !isFullWidth) {
		  return 'Left';
		}
		if (!isLeft && isTop && isFullHeight && !isFullWidth) {
		  return 'Right';
		}
		if (isTop && isLeft && isFullWidth && !isFullHeight) {
		  return 'Top';
		}
		if (!isTop && isLeft && isFullWidth && !isFullHeight) {
		  return 'Bottom';
		}
		if (isLeft && isTop && isFullWidth && isFullHeight) {
		  return 'Full';
		}
		return null;
	  };
	
	const percentWidth = (width) => (width ? width / 12 : 1);
	const percentHeight = (height) => (height ? height / 6 : 1);
	
	const gridWidth = (width) => `${percentWidth(width) * 100}%`;
	const gridHeight = (height) => `${percentHeight(height) * 100}%`;

	const gridX = (x) =>
  		x === 'center' ? 'calc(50% - (var(--grid-width) / 2))' : `${(x / 12) * 100}%`;

	const gridY = (y) =>
  		y === 'center' ? 'calc(50% - (var(--grid-height) / 2))' : `${(y / 6) * 100}%`;
	
	const gridVariables = ({ layoutOptions }) => {
		const fallbackWidth = layoutOptions.x === 'center' ? 8 : null;
		return {
			'--grid-width': gridWidth(layoutOptions.width || fallbackWidth),
			'--grid-height': gridHeight(layoutOptions.height),
			'--grid-x': gridX(layoutOptions.x),
			'--grid-y': gridY(layoutOptions.y),
		};
	};

	const getDisplayBleedProps = (artboard, content, hasBleed) => {
		if (!hasBleed) {
			return {
			width: '100%',
			height: '100%',
			left: null,
			top: null,
			};
		}
	
		const horizontalScale = 1 / artboard.width / percentWidth(content.layoutOptions.width);
		let horizontalMargin = 1 - artboard.width;
		let leftPosition = horizontalMargin / 2;
	
		const verticalScale = 1 / artboard.height / percentHeight(content.layoutOptions.height);
		let verticalMargin = 1 - artboard.height;
		let topPosition = verticalMargin / 2;
	
		// if the content is horizontal we only need to correct for half the
		// horizontal bleed and likewise for vertical content
		const position = relativePosition(content);
		if (position === 'Left' || position === 'Right') {
			horizontalMargin = horizontalMargin / 2;
		} else if (position === 'Top' || position === 'Bottom') {
			verticalMargin = verticalMargin / 2;
		}
	
		// if the content is positioned on the right or bottom, we dont need
		// both position adjustments
		if (position === 'Right') {
			leftPosition = 0;
		} else if (position === 'Bottom') {
			topPosition = 0;
		}
		return {
			width: `${100 + horizontalScale * horizontalMargin * 100}%`,
			height: `${100 + verticalScale * verticalMargin * 100}%`,
			left: `${horizontalScale * leftPosition * -100}%`,
			top: `${verticalScale * topPosition * -100}%`,
		};
	};

	const getAutoColorPalette = (slide) => {
		const colorPalette =
		  slide.assets.length > 0 ? slide.assets[0].metadata.colorPalette : null;
		return colorPalette;
	  }

	const getBackGroundColor = (
		slide,
	  ) => {
		var baseColor = null;
		if (slide.backgroundColor == null) {
			if (getAutoColorPalette(slide) == null) {
				baseColor = White;
			} else {
				baseColor = getAutoColorPalette(slide).background;
			}
		  } else {
			baseColor = slide.backgroundColor;
		  }
		return tinycolor(baseColor).toHex();
	  };

	const scaleToContainFit = ({
		containerSize,
		sizeToFit,
		gutterWidth = 0,
		gutterHeight = 0,
	  }) => {
		const widthFactor = (containerSize.width - gutterWidth) / sizeToFit.width;
		const heightFactor = (containerSize.height - gutterHeight) / sizeToFit.height;
		return Math.min(widthFactor, heightFactor);
	  };

	const fitToContainer = ({
		source,
		target,
	  }) => {
		const scaleFactor = scaleToContainFit({
		  sizeToFit: source,
		  containerSize: target,
		});
		const fitSize = {
		  height: source.height * scaleFactor,
		  width: source.width * scaleFactor,
		};
		return fitSize;
	  };
	
	// convert rgb and HexStrings to Hex colors (w/o '#')
	const colorToHex = (rgb) => {
		if (rgb.includes('#')) {
		  return rgb.replace('#', '');
		}
		const rbgArray = rgb.replace(/[^\d,]/g, '').split(',');
		const componentToHex = c => {
		  const hex = parseInt(c, 10).toString(16);
		  return hex.count() === 1 ? `0${hex}` : hex;
		};
		return `${componentToHex(rbgArray[0])}${componentToHex(rbgArray[1])}${componentToHex(rbgArray[2])}`;
	  };
	
	const percentStringToNumber = (percentString) => {
		return parseFloat(percentString) / 100;
	};
	
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
	
	const getAssetContainerCoordinates = (assetContainer, hasBleed) => {
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
	
	const getAssetCoordinates = (
		assetContainer, 
		hasBleed, 
		asset,
	) => {
		// determine if asset is image or OEmbed 
		const assetSize = asset.type === 'Image' ? asset.content.size : asset.content.photo.size;
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
	
	const getTextBlockProperties = (textContentBlock) => {
		const PPTOptions = getPPTCoordinates(textContentBlock);
		const textOptions = textContentBlock.textOptions;
		const textColor = textOptions.color ? colorToHex(textOptions.color) : null;
		return {
		  ...PPTOptions,
		  color: textColor != null ? textColor : null,
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
	
	const getTextOptions = (
		layoutMode,
		container,
	) => {
		const textBlockProperties = getTextBlockProperties(container.text);
		// inset should be 1em
		const inset = getcalculatedFontSize(slideSize, layoutMode) / dpi;
		const textOptions = {
			...textBlockProperties,
			inset: Math.round(inset * 100) / 100,
		};
		// get set of text blocks out of draft raw 
		const contentState = Draft.convertFromRaw(textBody);
		const blockMap = contentState.getBlockMap();
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
				// There's a bug in PptGenJS where you can either have:
				// 1) Correct line spacing by specifying an alignment value
				// or
				// 2) ineline styling but with the wrong line spacing.
				// IF you specify multiple inline styles, they will be on different lines when
				// alignment is specified, and if you don't specify alignment, then the
				// line spacing will be way out of wack.
				// if there is inline stlying, create ranges inside block
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

	const getLayoutMode = (slide) => {
		const layoutModeCustomization = slide.layoutCustomizations.find((c) => 'LayoutMode' === c.type)
		const {mode: slideLayoutMode} = layoutModeCustomization  || {mode: null}
		const layoutModeAuto = slide.layoutCustomizations.find((c) => 'LayoutModeAuto' === c.type)
		const {mode: slideLayoutModeAuto} = layoutModeAuto || {mode: null}
		const finalLayoutMode = slideLayoutMode !== null ? slideLayoutMode :
			(slideLayoutModeAuto !== null ? slideLayoutModeAuto : LAYOUT_MODE_TELL)

		return (finalLayoutMode)
	}

	const pptSlide = pptx.addSlide();
	const backgroundColor = getBackGroundColor(slide); 
	pptSlide.bkgd = backgroundColor;
	const layoutMode = getLayoutMode(slide);
	const asset = slide.assets[0];
	bentoSchema.containers.forEach(container => {
		let assetURL = null;
		let assetCoordinates = null;
		const hasBleed = layoutMode !== 'Tell';
		const isIntro = layoutMode === 'Intro';
		assetCoordinates = isIntro
		  ? getAssetContainerCoordinates(container.assetContainer, hasBleed)
		  : getAssetCoordinates(container.assetContainer, hasBleed, asset);
		switch (asset.type) {
		  case 'Image': {
			assetURL = 'https://raw.githubusercontent.com/WeTransfer/PptxGenJS/pptXNodeDemo/demos/common/images/Paste-Photo.jpg';
			const imageOptions = {
			  ...assetCoordinates,
			  path: assetURL,
			  type: isIntro ? 'cover' : 'contain',
			};
			pptSlide.addImage(imageOptions);
			break;
		  }
		  case 'OEmbed':
			assetURL = asset.sourceURL;
			switch (asset.content.type) {
			  case 'Photo': {
				const imageOptions = {
				  ...assetCoordinates,
				  path: assetURL,
				  type: isIntro ? 'cover' : 'contain',
				};
				pptSlide.addImage(imageOptions);
				break;
			  }
			  case 'Video': {
				const videoOptions = {
				  ...assetCoordinates,
				  link: assetURL,
				  type: 'online',
				};
				pptSlide.addMedia(videoOptions);
				break;
			  }
			  default:
				break;
			}
			break;
		  case 'Video': {
			assetURL = asset.bestTranscoding.url;
			const videoOptions = {
			  ...assetCoordinates,
			  path: assetURL,
			  type: 'video',
			};
			pptSlide.addMedia(videoOptions);
			break;
		  }
		  default:
			break;
		}
		const { textBlocks, textOptions } = getTextOptions(
		  layoutMode,
		  container,
		);
		pptSlide.addText(textBlocks, textOptions);
	});
}

// ==================================================================================================================

if ( typeof module !== 'undefined' && module.exports ) {
	module.exports = {
		execGenSlidesFuncs: execGenSlidesFuncs
	}
}