import { colorAnalysis, colorToHex } from './ColorAnalysis.mjs';
import { TextContentBlockViewModel } from './ContentBlockViewModel.mjs';
import Editor from 'draft-js';

const White = '#FFFFFF';

export const getTextAssetPosition = (slide) => {

    const textPositionCustomization = slide.layoutCustomizations.find((c) => 'TextAssetPosition' === c.type)

    const {position: assetPosition} = textPositionCustomization || {position: null}

    // return auto position if position not defined in schema or as override
    return assetPosition;
}

export const getLayoutMode = (slide) => {
    const layoutModeCustomization = slide.layoutCustomizations.find((c) => 'LayoutMode' === c.type)
    const {mode: slideLayoutMode} = layoutModeCustomization  || {mode: null}
    const layoutModeAuto = slide.layoutCustomizations.find((c) => 'LayoutModeAuto' === c.type)
    const {mode: slideLayoutModeAuto} = layoutModeAuto || {mode: null}
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

const defaultContainer = {
  assetContainer: null,
  text: null,
  layoutOptions: {
    x: 0,
    y: 0,
    width: 12,
    height: 6,
  },
};

const addTextContentBlock = (
  container,
  options,
) => {
  const displayOptions = {};
  const layoutOptions = {
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
  };

  const content = new TextContentBlockViewModel({
    displayOptions,
    layoutOptions,
    textBody: options.textBody,
    textOptions: {
      align: options.align,
      valign: options.valign,
      color: options.color,
    },
  });

  return {
    ...container,
    text: content,
  };
};

const addAssetContentBlock = (
  container,
  options,
) => {
  const layoutOptions = {
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
  };

  return {
    ...container,
    assetContainer: {
      assets: options.content,
      layoutOptions,
    },
  };
};

const tellLayout = (slide, contentState) => {
  const assetPosition = getTextAssetPosition(slide);
  let container;

  switch (assetPosition) {
    case 'MediaTop':
      container = addAssetContentBlock(
        addTextContentBlock(defaultContainer, {
          textBody: contentState,
          align: 'left',
          valign: 'center',
          color: getTextColor(slide),
          x: 'center',
          y: 3,
          width: null,
          height: 3,
        }),
        {
          content: slide.assets,
          x: 0,
          y: 0,
          width: null,
          height: 3,
        },
      );
      break;
    case 'MediaBottom':
      container = addAssetContentBlock(
        addTextContentBlock(defaultContainer, {
          textBody: contentState,
          align: 'left',
          valign: 'center',
          color: getTextColor(slide),
          x: 'center',
          y: 0,
          width: null,
          height: 3,
        }),
        {
          content: slide.assets,
          x: 0,
          y: 3,
          width: null,
          height: 3,
        },
      );
      break;
    case 'MediaLeft':
      // Possibly no Text
      container = addAssetContentBlock(
        addTextContentBlock(defaultContainer, {
          textBody: contentState,
          align: 'left',
          valign: 'center',
          color: getTextColor(slide),
          x: 6,
          y: 0,
          width: 6,
          height: null,
        }),
        {
          content: slide.assets,
          x: 0,
          y: 0,
          width: 6,
          height: null,
        },
      );
      break;
    default:
      // no assets
      if (!slide.assets.length) {
        container = addTextContentBlock(defaultContainer, {
          textBody: contentState,
          align: 'left',
          valign: 'center',
          color: getTextColor(slide),
          x: 'center',
          y: 0,
          width: null,
          height: null,
        });
        break;
      }
    // fall through to MediaRight if slide has assets
    case 'MediaRight':
      container = addAssetContentBlock(
        addTextContentBlock(defaultContainer, {
          textBody: contentState,
          align: 'left',
          valign: 'center',
          color: getTextColor(slide),
          x: 0,
          y: 0,
          width: 6,
          height: null,
        }),
        {
          content: slide.assets,
          x: 6,
          y: 0,
          width: 6,
          height: null,
        },
      );
      break;
  }

  return container;
};

const showLayout = (slide, contentState) => {
  const assetPosition = getTextAssetPosition(slide);
  let container;

  switch (assetPosition) {
    case 'MediaTop':
      container = addAssetContentBlock(
        addTextContentBlock(defaultContainer, {
          textBody: contentState,
          align: 'center',
          valign: 'top',
          color: getTextColor(slide),
          x: 'center',
          y: 5,
          width: null,
          height: 1,
        }),
        {
          content: slide.assets,
          x: 0,
          y: 0,
          width: null,
          height: 5,
        },
      );
      break;
    case 'MediaBottom':
      container = addAssetContentBlock(
        addTextContentBlock(defaultContainer, {
          textBody: contentState,
          align: 'center',
          valign: 'top',
          color: getTextColor(slide),
          x: 'center',
          y: 0,
          width: null,
          height: 1,
        }),
        {
          content: slide.assets,
          x: 0,
          y: 1,
          width: null,
          height: 5,
        },
      );
      break;
    case 'MediaLeft':
      // Possibly no Text
      container = addAssetContentBlock(
        addTextContentBlock(defaultContainer, {
          textBody: contentState,
          align: 'left',
          valign: 'top',
          color: getTextColor(slide),
          x: 9,
          y: 0,
          width: 3,
          height: null,
        }),
        {
          content: slide.assets,
          x: 0,
          y: 0,
          width: 9,
          height: null,
        },
      );
      break;
    default:
      // no assets
      if (!slide.assets.length) {
        container = addTextContentBlock(defaultContainer, {
          textBody: contentState,
          align: 'left',
          valign: 'top',
          color: getTextColor(slide),
          x: 0,
          y: 0,
          width: 8,
          height: null,
        });
        break;
      }
    // fall through to MediaRight if slide has assets
    case 'MediaRight':
      container = addAssetContentBlock(
        addTextContentBlock(defaultContainer, {
          textBody: contentState,
          align: 'left',
          valign: 'top',
          color: getTextColor(slide),
          x: 0,
          y: 0,
          width: 3,
          height: null,
        }),
        {
          content: slide.assets,
          x: 3,
          y: 0,
          width: 9,
          height: null,
        },
      );
      break;
  }

  return container;
};

const introLayout = (slide, contentState) => {
  const container = addTextContentBlock(
    addAssetContentBlock(defaultContainer, {
      content: slide.assets,
      x: 0,
      y: 0,
      width: null,
      height: null,
    }),
    {
      textBody: contentState,
      align: 'center',
      valign: 'center',
      color: getTextColor(slide),
      x: 'center',
      y: 0,
      width: null,
      height: null,
    },
  );

  return container;
};

// fromSlideViewModel is responsible for taking a SlideViewModel
// and turning it into an object renderable by the bento component
export const fromSlideViewModel = (slide) => {
  const layoutMode = getLayoutMode(slide);
  const contentState = Editor.convertFromRaw(slide.body);
  switch (layoutMode) {
    case 'Intro':
      return {
        containers: [introLayout(slide, contentState)],
        layoutOptions: { x: 0, y: 0, width: 12, height: 6 },
      };

    case 'Show':
      return {
        containers: [showLayout(slide, contentState)],
        layoutOptions: { x: 0, y: 0, width: 12, height: 6 },
      };

    case 'Tell':
    default:
      return {
        containers: [tellLayout(slide, contentState)],
        layoutOptions: { x: 0, y: 0, width: 12, height: 6 },
      };
  }
};
