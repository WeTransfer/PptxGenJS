import SlideViewModel from '../viewmodel/SlideViewModel';
import {
  Asset,
  Container,
  ContentBlock,
  LayoutMode,
  TextAssetPosition,
  TextOptionsAlign,
} from '../types/Schema';

import { Slide } from '../types/types';

const defaultContainer: Container = {
  slug: 'slug',
  childContainer: null,
  contentBlocks: [],
  layoutOptions: {
    x: 0,
    y: 0,
    width: 12,
    height: 6,
  },
};

const assetViewModelToContentBlock = (asset: Asset): ContentBlock => {
  // 🚨WARNING: This gets the private asset property of an AssetViewModel.
  // This should only live for a short time.
  return {
    slug: asset && asset.metadata ? asset.metadata.assetLocalId : '12345',
    type: asset.type,
    content: asset,
    layoutOptions: {
      x: 'center',
      y: 'center',
      width: null,
      height: null,
    },
  };
};

const addTextContentBlock = (
  container: Container,
  options: {
    textBody: any;
    align: TextOptionsAlign.Center | TextOptionsAlign.Left;
    valign: TextOptionsAlign.Center | TextOptionsAlign.Top;
    color?: string | null;
    x: number | 'center';
    y: number;
    width: number | null;
    height: number | null;
  },
): Container => {
  const layoutOptions = {
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
  };

  const content = {
    type: 'Text' as 'Text',
    layoutOptions,
    textBody: options.textBody,
    textOptions: {
      align: options.align,
      valign: options.valign,
      color: options.color,
    },
  };

  return {
    ...container,
    contentBlocks: [content],
  };
};

const addAssetContentBlock = (
  container: Container,
  options: {
    content: Asset[];
    x: number | 'center';
    y: number;
    width: number | null;
    height: number | null;
  },
): Container => {
  const layoutOptions = {
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
  };

  return {
    ...container,
    childContainer: {
      slug: '1231231',
      childContainer: null,
      contentBlocks: options.content.map(assetViewModelToContentBlock),
      layoutOptions,
    },
  };
};

const tellLayout = (slide: SlideViewModel, overrideLayoutPosition: TextAssetPosition | null) => {
  const assetPosition = slide.getTextAssetPosition(overrideLayoutPosition);
  let container: Container;

  switch (assetPosition) {
    case 'MediaTop':
      container = addAssetContentBlock(
        addTextContentBlock(defaultContainer, {
          textBody: slide.contentState,
          align: TextOptionsAlign.Left,
          valign: TextOptionsAlign.Center,
          color: slide.textColor,
          x: TextOptionsAlign.Center,
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
          textBody: slide.contentState,
          align: TextOptionsAlign.Left,
          valign: TextOptionsAlign.Center,
          color: slide.textColor,
          x: TextOptionsAlign.Center,
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
          textBody: slide.contentState,
          align: TextOptionsAlign.Left,
          valign: TextOptionsAlign.Center,
          color: slide.textColor,
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
          textBody: slide.contentState,
          align: TextOptionsAlign.Left,
          valign: TextOptionsAlign.Center,
          color: slide.textColor,
          x: TextOptionsAlign.Center,
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
          textBody: slide.contentState,
          align: TextOptionsAlign.Left,
          valign: TextOptionsAlign.Center,
          color: slide.textColor,
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

const showLayout = (slide: SlideViewModel, overrideLayoutPosition: TextAssetPosition | null) => {
  const assetPosition = slide.getTextAssetPosition(overrideLayoutPosition);
  let container: Container;

  switch (assetPosition) {
    case 'MediaTop':
      container = addAssetContentBlock(
        addTextContentBlock(defaultContainer, {
          textBody: slide.contentState,
          align: TextOptionsAlign.Center,
          valign: TextOptionsAlign.Top,
          color: slide.textColor,
          x: TextOptionsAlign.Center,
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
          textBody: slide.contentState,
          align: TextOptionsAlign.Center,
          valign: TextOptionsAlign.Top,
          color: slide.textColor,
          x: TextOptionsAlign.Center,
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
          textBody: slide.contentState,
          align: TextOptionsAlign.Left,
          valign: TextOptionsAlign.Top,
          color: slide.textColor,
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
          textBody: slide.contentState,
          align: TextOptionsAlign.Left,
          valign: TextOptionsAlign.Top,
          color: slide.textColor,
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
          textBody: slide.contentState,
          align: TextOptionsAlign.Left,
          valign: TextOptionsAlign.Top,
          color: slide.textColor,
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

const introLayout = (slide: SlideViewModel) => {
  const container = addTextContentBlock(
    addAssetContentBlock(defaultContainer, {
      content: slide.assets,
      x: 0,
      y: 0,
      width: null,
      height: null,
    }),
    {
      textBody: slide.contentState,
      align: TextOptionsAlign.Center,
      valign: TextOptionsAlign.Center,
      color: slide.textColor,
      x: TextOptionsAlign.Center,
      y: 0,
      width: null,
      height: null,
    },
  );

  return container;
};

// fromSlideViewModel is responsible for taking a SlideViewModel
// and turning it into an object renderable by the bento component
export const fromSlideViewModel = (
  slide: SlideViewModel,
  overrideLayoutMode: LayoutMode | null,
  overrideLayoutPosition: TextAssetPosition | null,
): Slide => {
  const layoutMode = slide.getLayoutMode(overrideLayoutMode);

  switch (layoutMode) {
    case 'Intro':
      return {
        containers: [introLayout(slide)],
        layoutOptions: { x: 0, y: 0, width: 12, height: 6 },
      };

    case 'Show':
      return {
        containers: [showLayout(slide, overrideLayoutPosition)],
        layoutOptions: { x: 0, y: 0, width: 12, height: 6 },
      };

    case 'Tell':
    default:
      return {
        containers: [tellLayout(slide, overrideLayoutPosition)],
        layoutOptions: { x: 0, y: 0, width: 12, height: 6 },
      };
  }
};
