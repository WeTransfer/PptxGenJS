/* customized from the client-side bento code to return dimensions instead of a JSX object */

import { percentHeight, percentWidth, relativePosition } from './SlideLayout';
import { Dimensions, Layoutable } from '../types/types';

export interface DisplayBleedDimensions {
    width: string;
    height: string;
    left: string | null;
    top: string | null;
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