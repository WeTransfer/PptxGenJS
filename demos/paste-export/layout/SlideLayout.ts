import { ContentBlock, TextContentBlock } from '../types/Schema';
import { Coordinates, Dimensions, Layoutable, Slide } from '../types/types';

const gridX = (x: number | 'center') =>
  x === 'center' ? 'calc(50% - (var(--grid-width) / 2))' : `${(x / 12) * 100}%`;

const gridY = (y: number | 'center') =>
  y === 'center' ? 'calc(50% - (var(--grid-height) / 2))' : `${(y / 6) * 100}%`;

export const percentWidth = (width: number | null) => (width ? width / 12 : 1);
export const percentHeight = (height: number | null) => (height ? height / 6 : 1);
const gridWidth = (width: number | null) => `${percentWidth(width) * 100}%`;
const gridHeight = (height: number | null) => `${percentHeight(height) * 100}%`;

export const gridVariables = (layoutOptions: Coordinates & Dimensions) => {
    const fallbackWidth = layoutOptions.x === 'center' ? 8 : null;
    return {
        '--grid-width': gridWidth(layoutOptions.width || fallbackWidth),
        '--grid-height': gridHeight(layoutOptions.height),
        '--grid-x': gridX(layoutOptions.x),
        '--grid-y': gridY(layoutOptions.y),
    };
}

export const enum RelativePosition {
  Left = 'Left',
  Right = 'Right',
  Top = 'Top',
  Bottom = 'Bottom',
  Full = 'Full',
}

export const relativePosition = ({ layoutOptions }: Layoutable) => {
  const { x, y, width, height } = layoutOptions;

  const isFullWidth = width === 12 || width === null;
  const isFullHeight = height === 6 || height === null;
  const isLeft = x === 0 || x === 'center';
  const isTop = y === 0 || y === 'center';

  if (isLeft && isTop && isFullHeight && !isFullWidth) {
    return RelativePosition.Left;
  }
  if (!isLeft && isTop && isFullHeight && !isFullWidth) {
    return RelativePosition.Right;
  }
  if (isTop && isLeft && isFullWidth && !isFullHeight) {
    return RelativePosition.Top;
  }
  if (!isTop && isLeft && isFullWidth && !isFullHeight) {
    return RelativePosition.Bottom;
  }
  if (isLeft && isTop && isFullWidth && isFullHeight) {
    return RelativePosition.Full;
  }
  return null;
};

export const filterTextContentBlock = (
  slide: Slide,
  fn: (content: TextContentBlock) => boolean,
): Slide => {
  const containers = slide.containers.map(container => {
    const text = container.contentBlocks.find(({ type }) => type === 'Text');
    if (text && text.type === 'Text' && fn(text)) {
      return container;
    }

    const childContainer = {
      ...container.childContainer,
      layoutOptions: {
        x: 0,
        y: 0,
        width: null,
        height: null,
      },
    };

    return {
      ...container,
      text: null,
      childContainer,
    };
  });

  return {
    ...slide,
    containers,
  };
};
