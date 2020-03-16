import {
    Dimensions,
    Layoutable,
  } from '../schema/Types';

export interface DisplayBleedDimensions {
    width: string;
    height: string;
    left: string | null;
    top: string | null;
}

interface Size {
    width: number;
    height: number;
}

// port of some of the Bento code to convert Bento schema into positions
const relativePosition = ({ layoutOptions }: Layoutable ) => {
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
}

const percentWidth = (width: number) => (width ? width / 12 : 1);
const percentHeight = (height: number) => (height ? height / 6 : 1);

const gridWidth = (width: number) => `${percentWidth(width) * 100}%`;
const gridHeight = (height: number) => `${percentHeight(height) * 100}%`;

const gridX = (x: number | 'center') =>
      x === 'center' ? 'calc(50% - (var(--grid-width) / 2))' : `${(x / 12) * 100}%`;

const gridY = (y: number | 'center') =>
      y === 'center' ? 'calc(50% - (var(--grid-height) / 2))' : `${(y / 6) * 100}%`;

export const gridVariables = ({ layoutOptions }: Layoutable) => {
    const fallbackWidth = layoutOptions.x === 'center' ? 8 : null;
    return {
        '--grid-width': gridWidth(layoutOptions.width || fallbackWidth),
        '--grid-height': gridHeight(layoutOptions.height),
        '--grid-x': gridX(layoutOptions.x),
        '--grid-y': gridY(layoutOptions.y),
    };
}

export const getDisplayBleedProps = (
    artboard: Dimensions,
    content: Layoutable,
    hasBleed: boolean,
): DisplayBleedDimensions => {
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
}

const scaleToContainFit = ({
    containerSize,
    sizeToFit,
    gutterWidth = 0,
    gutterHeight = 0,
  }: {
    containerSize: Size;
    sizeToFit: Size;
    gutterWidth?: number;
    gutterHeight?: number;
  }): number => {
    const widthFactor = (containerSize.width - gutterWidth) / sizeToFit.width;
    const heightFactor = (containerSize.height - gutterHeight) / sizeToFit.height;
    return Math.min(widthFactor, heightFactor);
  }

export const fitToContainer = ({
    source,
    target,
  }: {
    source: Size;
    target: Size;
  }): Size => {
    const scaleFactor = scaleToContainFit({
      sizeToFit: source,
      containerSize: target,
    });
    const fitSize = {
      height: source.height * scaleFactor,
      width: source.width * scaleFactor,
    };
    return fitSize;
  }