import * as Schema from '../schema/Schema';
import { Container, ContentBlock, Slide } from '../schema/types';
import { getTextAssetPosition, getTextColor, getLayoutMode } from '../viewmodel/SlideViewModel';
import { Asset, LayoutMode, TextAssetPosition, TextOptionsAlign } from '../schema/Schema';
import { TextContentBlockViewModel } from '../viewmodel/TextContentBlockViewModel';
import Editor, { ContentState } from 'draft-js';

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
  container: Container,
  options: {
    content: Asset[];
    x: number | 'center';
    y: number;
    width: number | null;
    height: number | null;
  },
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

const tellLayout = (slide: Schema.Slide, contentState: any) => {
  const assetPosition = getTextAssetPosition(slide);
  let container;

  switch (assetPosition) {
    case 'MediaTop':
      container = addAssetContentBlock(
        addTextContentBlock(defaultContainer, {
          textBody: contentState,
          align: TextOptionsAlign.Left,
          valign: TextOptionsAlign.Center,
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
          align: TextOptionsAlign.Left,
          valign: TextOptionsAlign.Center,
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
          align: TextOptionsAlign.Left,
          valign: TextOptionsAlign.Center,
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
          align: TextOptionsAlign.Left,
          valign: TextOptionsAlign.Center,
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
          align: TextOptionsAlign.Left,
          valign: TextOptionsAlign.Center,
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

const showLayout = (slide: Schema.Slide, contentState: any) => {
  const assetPosition = getTextAssetPosition(slide);
  let container;

  switch (assetPosition) {
    case 'MediaTop':
      container = addAssetContentBlock(
        addTextContentBlock(defaultContainer, {
          textBody: contentState,
          align: TextOptionsAlign.Center,
          valign: TextOptionsAlign.Top,
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
          align: TextOptionsAlign.Center,
          valign: TextOptionsAlign.Top,
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
          align: TextOptionsAlign.Left,
          valign: TextOptionsAlign.Top,
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
          align: TextOptionsAlign.Left,
          valign: TextOptionsAlign.Top,
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
          align: TextOptionsAlign.Left,
          valign: TextOptionsAlign.Top,
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

const introLayout = (slide: Schema.Slide, contentState: any) => {
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
      align: TextOptionsAlign.Center,
      valign: TextOptionsAlign.Center,
      color: getTextColor(slide),
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
export const fromSlideViewModel = (slide: Schema.Slide) => {
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
