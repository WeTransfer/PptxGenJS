
import * as Schema from '../types/Schema';
import { Dimensions } from '../types/types';
import { Asset, AssetColorPalette, Size } from '../types/Schema';
import { dpi } from '../layout/GeneratePPTCoordinates';
import { 
    getCalculatedFontSize
} from '../utils/AssetUtils';
import { scaleToContainFit } from '../utils/SizeUtils';
import SlideViewModel from '../viewmodel/SlideViewModel';

export const TEXT_MAX_PADDING = 60;
export const TEXT_MIN_PADDING = 10;

export interface AssetStyle {
    assetContainerStyle: any;
}

export type AssetType =
  | 'AssetNone'
  | 'AssetSquare'
  | 'AssetLandscape'
  | 'AssetLandscapeWide'
  | 'AssetLandscapeDoubleWide'
  | 'AssetPortrait'
  | 'AssetPortraitTall';

export interface AssetLayout {
    top: number;
    left: number;
    width: number;
    height: number;
    scale: number;
}
  
export interface MultiAssetLayout {
    multiAssetContainerStyle: any;
    assetStyles: AssetStyle[];
    assetLayouts: AssetLayout[];
    multiAssetGutter: number;
    fontSize: number;
    // If you add a property here, update layoutEquals to include it.
}

export interface MultiAssetRow {
    size: Size;
    indexStart: number;
    scale: number;
    numAssets: number;
    gutter: number;
}

export type MultiAssetType =
    | 'Mixed'
    | 'Portrait'
    | 'TallPortrait'
    | 'Landscape'
    | 'LandscapeDoubleWide';

export interface MultiAssetHint {
    rows: MultiAssetRow[];
    numRows: number;
    containerSize: Size;
    type: MultiAssetType;
    gutter: number;
    assetSizes: Schema.Size[];
}
  
export const getPadding = (container: Size) => {
    return Math.min(TEXT_MAX_PADDING / dpi, Math.max(TEXT_MIN_PADDING / dpi, container.width * 0.03));
  };

const getPrintViewPadding = (container: Size, padding?: number) => {
    const minPrintViewPadding = 5;
    return padding
      ? Math.max(padding, minPrintViewPadding)
      : Math.max(getPadding(container), minPrintViewPadding);
};
  
export const getFrame = (container: Size, padding?: number) => {
    let calcPadding = padding || 0;
    return {
        top: calcPadding,
        left: calcPadding,
        width: container.width - calcPadding,
        height: container.height - calcPadding,
    };
};

export const getNormalizedAssetSizes = (
    slide: SlideViewModel,
    gutter: number,
    containerFrame: Size,
    assets: Asset[],
  ) => {
    const newAssetSizes: Size[] = [];
    let assetContainerSize: Size = { width: 0, height: 0 };
    let totalAssetWidth = 0;
    if (assets) {
      // find all asset sizes and scale to fit container height
      // to make row calculations easier
      const containerHeight = containerFrame.height;
      const defaultAssetSize = { width: containerHeight, height: containerHeight };
      assets.forEach((asset, index) => {
        if (index < 4) {
          if (!asset) {
            newAssetSizes[index] = { width: containerHeight, height: containerHeight };
          } else {
            // multi-assets can be in the middle of being dragged to rearrange
            // so indexes of assets collection may not match the indexes in slide.assets
            // so lookup by assetLocalId
            const assetIndex = slide.getAssetIndexById(asset.metadata.assetLocalId);
            const assetSize = slide.getOverallAssetSize(
              assetIndex,
            );
            // skipped assetTypeWithoutSize calculations
            const intialAssetSize = assetSize;
            const finalAssetSize = intialAssetSize ? intialAssetSize : defaultAssetSize;
            newAssetSizes[index] = {
              width: (finalAssetSize.width * containerHeight) / finalAssetSize.height,
              height: containerHeight,
            };
            totalAssetWidth = totalAssetWidth + newAssetSizes[index].width;
          }
        }
      });
      assetContainerSize = {
        width: totalAssetWidth,
        height: containerHeight,
      };
      return { assetSizes: newAssetSizes, assetContainerSize };
    }
  };

export const getAssetType = (assetSize: Size, checkForExtremeRatios?: boolean): AssetType => {
    if (!assetSize) {
        return 'AssetNone';
    }

    const aspectRatio = assetSize.width / assetSize.height;
    const wideAspectRatio = 9 / 5;
    const veryWideAspectRatio = 2;
    const portraitTallRatio = 1 / 2;

    if (Math.abs(aspectRatio - 1) < 0.001) {
        return 'AssetSquare';
    } else if (aspectRatio >= wideAspectRatio) {
        return checkForExtremeRatios && aspectRatio >= veryWideAspectRatio
        ? 'AssetLandscapeDoubleWide'
        : 'AssetLandscapeWide';
    } else if (aspectRatio >= 1) {
        return 'AssetLandscape';
    } else {
        return checkForExtremeRatios && aspectRatio <= portraitTallRatio
        ? 'AssetPortraitTall'
        : 'AssetPortrait';
    }
};

export const getMultiAssetHint = (
    assetSizes: Size[],
    gutter: number,
    multiAssetContainer: Size,
    containerSize: Size,
): MultiAssetHint => {
    const rows: MultiAssetRow[] = [];
    for (let rowsIndex = 0; rowsIndex < 4; rowsIndex++) {
        rows[rowsIndex] = {
        size: { width: 0, height: 0 },
        indexStart: rowsIndex,
        scale: 1,
        numAssets: 0,
        gutter: 0,
        };
    }

    let minDifference = 0;
    let assetWidths = 0;
    let areAllTallPortrait = true;
    let areAnyTallPortrait = false;
    let areAllLandscapeDoubleWide = true;
    let areAtLeastLandscape = true;
    let areAtLeastPortrait = true;

    // find where to split rows by detecting which combination is closest to half
    // of the total width
    for (let index = 0; index < assetSizes.length; index++) {
        assetWidths = assetWidths + assetSizes[index].width;
        const newDifference = Math.abs(assetWidths - multiAssetContainer.width / 2);
        if (index === 0 || newDifference < minDifference) {
        minDifference = newDifference;
        rows[1].indexStart = index + 1;
        rows[0].size.width = assetWidths;
        }
        const assetType = getAssetType(assetSizes[index], true);
        if (assetType !== 'AssetPortraitTall') {
        areAllTallPortrait = false;
        if (assetType !== 'AssetPortrait') {
            areAtLeastPortrait = false;
        }
        } else {
        areAnyTallPortrait = true;
        }
        if (assetType !== 'AssetLandscapeDoubleWide') {
        areAllLandscapeDoubleWide = false;
        if (assetType !== 'AssetLandscape' && assetType !== 'AssetLandscapeWide') {
            areAtLeastLandscape = false;
        }
        }
    }

    // calculate second row widths
    for (let index = rows[1].indexStart; index < assetSizes.length; index++) {
        rows[1].size.width = rows[1].size.width + assetSizes[index].width;
    }
    rows[0].numAssets = rows[1].indexStart;
    rows[1].numAssets = assetSizes.length - rows[1].indexStart;
    rows[0].gutter = (rows[0].numAssets - 1) * gutter;
    rows[1].gutter = (rows[1].numAssets - 1) * gutter;
    rows[0].size.height = assetSizes[0].height;

    // asset heights have been normalized, so row heights are equal here
    rows[1].size.height = assetSizes[0].height;

    const numAssets = assetSizes.length;
    // default to 1 asset per row if all assets are landScapeDoubleWide
    // defaut to 2 rows if there are 4 assets, but
    // prevent 2 rows if all assets are tallPortrait or the aspect ratio will be too narrow
    // also prefer 2 rows for cases where a single row has a very short aspect ratio
    const numRows = areAllLandscapeDoubleWide
        ? numAssets
        : numAssets === 4 && !areAtLeastPortrait
        ? 2
        : 1;
    if (numRows > 2) {
        // set indexStart and row height to reflect the fact that each asset is on its own line
        for (let index = 0; index < numRows; index++) {
        rows[index].indexStart = index;
        rows[index].size.height = assetSizes[index].height;
        }
    }
    const type: MultiAssetType = areAtLeastPortrait
        ? areAllTallPortrait
        ? 'TallPortrait'
        : 'Portrait'
        : areAtLeastLandscape
        ? areAllLandscapeDoubleWide
        ? 'LandscapeDoubleWide'
        : 'Landscape'
        : 'Mixed';

    const calcMultiAssetContainer = {
        width: rows[0].size.width,
        height: rows[0].size.height * numRows,
    };
    return { rows, numRows, type, containerSize: calcMultiAssetContainer, gutter, assetSizes };
};

export const calculateMultiAssetLayout = ({
    slide,
    slideSize,
    containerSize,
    assets,
    assetSizes,
    hasShadow,
    multiAssetHint,
    numRows,
    layoutMode,
    colorPalette = SlideViewModel.defaultBuiltInColorPalette,
  }: {
    slide: SlideViewModel;
    slideSize: Size;    
    containerSize: Size;
    assets: Asset[];
    assetSizes: Size[];
    hasShadow: boolean;
    multiAssetHint: MultiAssetHint;
    numRows: number;
    layoutMode: Schema.LayoutMode,
    colorPalette?: AssetColorPalette;
  }) => {
    const numAssets = slide.numAssets();
    const calculatedFontSize = getCalculatedFontSize(
        slideSize,
        layoutMode,
    );
    const rows = multiAssetHint.rows;
    const newRows: MultiAssetRow[] = [];
    const assetStyles: AssetStyle[] = [];
    const assetLayouts: AssetLayout[] = [];
    const assetContainerSize = multiAssetHint.containerSize;
    const gutter = multiAssetHint.gutter;
  
    for (let rowsIndex = 0; rowsIndex < 4; rowsIndex++) {
      newRows[rowsIndex] = {
        size: { width: rows[rowsIndex].size.width, height: rows[rowsIndex].size.height },
        indexStart: rows[rowsIndex].indexStart,
        scale: rows[rowsIndex].scale,
        numAssets: rows[rowsIndex].numAssets,
        gutter: rows[rowsIndex].gutter,
      };
    }
  
    if (numAssets === 0 || !containerSize) {
      return null;
    } else {
      let gutterHeight = 0;
      let overallScale = 1;
      switch (numRows) {
        case 1:
          // multiAssetHint assigned all assets to rows 0 and 1
          // so add their widths
          newRows[0].size = {
            width: newRows[0].size.width + newRows[1].size.width,
            height: newRows[0].size.height,
          };
          const row0ContainerSize = {
            width: newRows[0].size.width,
            height: assetSizes[0].height,
          };
          const row0GutterWidth = (numAssets - 1) * gutter;
          newRows[0].scale = scaleToContainFit({
            containerSize,
            sizeToFit: row0ContainerSize,
            gutterWidth: row0GutterWidth,
          });
  
          assetContainerSize.width = newRows[0].size.width * newRows[0].scale + row0GutterWidth;
          assetContainerSize.height = newRows[0].size.height * newRows[0].scale;
          break;
        case 2:
          gutterHeight = gutter;
          // first try sizing with row 1 width and row 1 + row 2 height
          // scale row 2 height based on row 1's width
          const assetContainerSizeToTryRow0 = {
            width: newRows[0].size.width,
            height:
              newRows[0].size.height +
              ((newRows[0].size.width - newRows[1].gutter) * newRows[1].size.height) /
                newRows[1].size.width,
          };
          const row0Scale1 = scaleToContainFit({
            containerSize,
            sizeToFit: assetContainerSizeToTryRow0,
            gutterWidth: newRows[0].gutter,
            gutterHeight,
          });
          newRows[0].scale = row0Scale1;
          const row1Scale1 =
            (newRows[0].size.width * newRows[0].scale + newRows[0].gutter - newRows[1].gutter) /
            newRows[1].size.width;
          // next try to size to row 2 width and row 1 + row 2 height
          // scale row 1 height based on row 2's width
          const assetContainerSizeToTryRow1 = {
            width: newRows[1].size.width,
            height:
              newRows[1].size.height +
              ((newRows[1].size.width - newRows[0].gutter) * newRows[0].size.height) /
                newRows[0].size.width,
          };
          const row2Scale2 = scaleToContainFit({
            containerSize,
            sizeToFit: assetContainerSizeToTryRow1,
            gutterWidth: newRows[1].gutter,
            gutterHeight,
          });
          newRows[1].scale = Math.min(row1Scale1, row2Scale2);
  
          // set row1 scale to fit with resulting row2 scale
          newRows[0].scale =
            (newRows[1].size.width * newRows[1].scale + newRows[1].gutter - newRows[0].gutter) /
            newRows[0].size.width;
          newRows[0].size.height = newRows[0].scale * newRows[0].size.height;
          newRows[1].size.height = newRows[1].scale * newRows[1].size.height;
          assetContainerSize.width = newRows[0].size.width * newRows[0].scale + newRows[0].gutter;
          assetContainerSize.height = newRows[0].size.height + newRows[1].size.height + gutter;
          break;
        case 3:
        case 4:
          // Fit all assets to the container width first
          // and then fit all rows to the overall height of the container
          gutterHeight = (numRows - 1) * gutter;
          let rowHeights = 0;
          assetSizes.forEach((assetSize, index) => {
            newRows[index].scale = containerSize.width / assetSizes[index].width;
            rowHeights = rowHeights + assetSize.height * newRows[index].scale;
          });
          overallScale = scaleToContainFit({
            containerSize,
            sizeToFit: { width: containerSize.width, height: rowHeights },
            gutterHeight,
          });
          for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
            newRows[rowIndex].size.height =
              assetSizes[rowIndex].height * newRows[rowIndex].scale * overallScale;
          }
          assetContainerSize.width = assetSizes[0].width * newRows[0].scale * overallScale;
          assetContainerSize.height = rowHeights * overallScale + gutterHeight;
        default:
          break;
      }
  
      assets.forEach((asset, index) => {
        // there is some unknown issue where more than 4 assets can be added
        // so avoid an error by only rendering the first 4
        if (index < 4) {
          const rowIndex =
            numRows > 2 ? index : numRows === 1 ? 0 : index >= newRows[1].indexStart ? 1 : 0;
          let assetLeft = numRows > 2 ? 0 : (index - newRows[rowIndex].indexStart) * gutter;
          for (let assetsInRow = newRows[rowIndex].indexStart; assetsInRow < index; assetsInRow++) {
            assetLeft =
              assetLeft + assetSizes[assetsInRow].width * newRows[rowIndex].scale * overallScale;
          }
          const assetWidth = assetSizes[index].width * newRows[rowIndex].scale * overallScale;
          const assetHeight = assetSizes[index].height * newRows[rowIndex].scale * overallScale;
          let assetTop =
            rowIndex === 0
              ? 0
              : newRows
                  .map((row, rowCounterIndex) => {
                    return rowCounterIndex < rowIndex ? newRows[rowCounterIndex].size.height : 0;
                  })
                  .reduce((a, b) => {
                    return a + b;
                  }, 0);
          assetTop = assetTop + rowIndex * gutter;
          const assetContainerStyle = Object.assign(
            {},
            {
              marginTop: 0,
              top: 0,
              left: 0,
              width: assetWidth,
              height: assetHeight,
            },
          );
          assetLayouts[index] = {
              top: assetTop,
              left: assetLeft,
              width: assetWidth,
              height: assetHeight,
              scale: 50,
          };
          assetStyles[index] = {
            assetContainerStyle,
          };
        }
      });
      const multiAssetContainerStyle = Object.assign(
        {},
        {
          width: assetContainerSize.width,
          height: assetContainerSize.height,
          fontSize: calculatedFontSize,
        },
      );
      return Object.assign(
        {},
        {
          multiAssetContainerStyle,
          assetLayouts,
          assetStyles,
          fontSize: calculatedFontSize,
          multiAssetGutter: gutter,
        },
      );
    }
  };

export const  getMultiAssetLayout = (
    containerSize: Dimensions,
    slideSize: Size,
    slide: SlideViewModel,
    layoutMode: Schema.LayoutMode,
) => {
    const padding = getPadding(slideSize);
    const multiAssetGutter = padding / 4;
    const frame = getFrame(slideSize, padding);
    const assets = slide.assets;

    const { assetSizes, assetContainerSize } = getNormalizedAssetSizes(
      slide,
      multiAssetGutter,
      frame,
      assets,
    );

    const multiAssetHint = getMultiAssetHint(
      assetSizes,
      multiAssetGutter,
      assetContainerSize,
      frame,
    );

    let multiAssetLayout = calculateMultiAssetLayout({
      slide,
      slideSize,
      containerSize,
      assets,
      assetSizes,
      hasShadow: slide.hasShadow(),
      multiAssetHint,
      numRows: multiAssetHint.numRows,
      layoutMode,
      colorPalette: slide.colorPalette,
    });

    if (multiAssetHint.numRows < assets.length) {
      const multiAssetLayoutStacked = calculateMultiAssetLayout({
        slide,
        slideSize,
        containerSize,
        assets,
        assetSizes,
        hasShadow: slide.hasShadow(),
        multiAssetHint,
        numRows: assets.length,
        layoutMode,
        colorPalette: slide.colorPalette,
      });

      // check if, on average, assets are larger in the stacked layout
      let relativeScales = 0;
      for (let index = 0; index < assets.length; index++) {
        relativeScales +=
          multiAssetLayoutStacked.assetLayouts[index].width /
          multiAssetLayout.assetLayouts[index].width;
      }

      if (relativeScales / assets.length > 1) {
        multiAssetLayout = multiAssetLayoutStacked;
      }
    }

    return multiAssetLayout;
  }