import { Size } from '../types/Schema';

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