/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable import/newline-after-import */
/* eslint-disable no-else-return */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable yoda */

import { ContentState, EditorState, convertFromRaw } from 'draft-js';
import * as Filestack from '../utils/Filestack';
import * as Schema from '../types/Schema';
import { Asset } from '../types/Schema';
import { calcOverallAssetSize } from '../utils/AssetUtils';

import { colorAnalysis, desaturateBlackBackground } from '../utils/ColorAnalysis';

export const LAYOUT_MODE_SHOW = 'Show';
export const LAYOUT_MODE_TELL = 'Tell';
export const LAYOUT_MODE_INTRO = 'Intro';

export const ASSET_FRAME_NONE = 'None';
export const ASSET_FRAME_SHADOW = 'Shadow';
export const ASSET_FRAME_ROUNDED = 'Rounded';
export const ASSET_FRAME_FILL = 'Fill';
export const ASSET_FRAME_PHONE = 'Phone';
export const ASSET_FRAME_PHONE_X = 'PhoneX';
export const ASSET_FRAME_TABLET = 'Tablet';
export const ASSET_FRAME_WINDOW = 'Window';
export const ASSET_FRAME_LAPTOP = 'Laptop';
export const ASSET_FRAME_DESKTOP = 'Desktop';

export const White = '#FFFFFF';

const builtInColorPalettes: {
    light: Schema.AssetColorPalette;
    medium: Schema.AssetColorPalette;
    dark: Schema.AssetColorPalette;
  } = {
    light: {
      common: 'rgba(255, 255, 255, 1)',
      background: 'rgba(255, 255, 255, 1)',
      thumbnailBackground: 'rgba(255, 255, 255, 1)',
      isLight: true,
      text: 'rgba(0, 0, 0, 1)',
      shadow: 'rgba(0, 0, 0, 0.15)',
    },
    medium: {
      common: 'rgba(241, 241, 241, 1)',
      background: 'rgba(241, 241, 241, 1)',
      thumbnailBackground: 'rgba(241, 241, 241, 1)',
      isLight: true,
      text: 'rgba(0, 0, 0, 1)',
      shadow: 'rgba(0, 0, 0, 0.15)',
    },
    dark: {
      common: 'rgba(0, 0, 0, 1)',
      background: 'rgba(26, 26, 26, 1)',
      thumbnailBackground: 'rgba(26, 26, 26, 1)',
      isLight: false,
      text: 'rgba(255, 255, 255, 1)',
      shadow: 'rgba(0, 0, 0, 0.5)',
    },
  };

export default class SlideViewModel {
  private filestackPolicy: Filestack.Policy | null;
  private slide: Schema.Slide;
  public readonly assets: Array<Asset>;
  public contentState: ContentState;

  constructor(
    filestackPolicy: Filestack.Policy | null,
    slide: Schema.Slide,
  ) {
    this.filestackPolicy = filestackPolicy;
    this.slide = slide;

    try {
      // If this fails and throws an error the app crashes. So if somehow
      // there is the chance we have corrupt data here, just insert a blank
      // body locally and log an error which we will see in newrelic
      this.contentState = convertFromRaw(slide.body);
    } catch (err) {
      const editorState = EditorState.createEmpty();
      this.contentState = editorState.getCurrentContent();

      console.error(
        `Slide body is corrupt, convertFromRaw failed.  slideLocalId: ${slide.localId}`,
        err,
      );
    }
    this.assets = slide.assets

   }

  get localId(): Schema.SlideLocalId {
    return this.slide.localId;
  }

  get backgroundColor(): string | null {
    return this.slide.backgroundColor || null;
  }

  public hasText(): boolean {
    return this.contentState && this.contentState.hasText();
  }

  public numAssets(): number {
    return this.assets.length;
  }

  public hasShadow = (
  ): boolean => {
    // overrideAssetFrame includes values for both hasShadow and assetFrame
    const layoutMode = this.getLayoutMode();
    return layoutMode !== LAYOUT_MODE_INTRO
      ? this.slide.hasShadow
      : false;
  };

  get hasMultipleAssets(): boolean {
    return this.numAssets() > 1;
  }

  public getAsset(index: number): Asset | null {
    return index >= 0 && index < this.numAssets() ? this.assets[index] : null;
  }

  public getAssetIndexByLocalId = (
    slide: SlideViewModel | Schema.Slide,
    assetLocalId: Schema.AssetLocalId,
  ): number =>
    slide instanceof SlideViewModel
      ? slide.assets.findIndex(asset => assetLocalId === asset.metadata.assetLocalId)
      : slide.assets.findIndex(
          asset => asset && asset.metadata && assetLocalId === asset.metadata.assetLocalId,
        );

  public getAssetIndexById(
    assetLocalId: Schema.AssetLocalId,
  ): number | null {
    const index = this.getAssetIndexByLocalId(this.slide, assetLocalId);
    return index >= 0 && index < this.numAssets() ? index : null;
  }

  public getOverallAssetSize(
    index: number,
  ): Schema.Size | null {
    // returns the size of the asset in its frame
    if (!(index >= 0 && index < this.numAssets())) {
      return null;
    }
    const asset = this.assets[index];
    const layoutMode = this.getLayoutMode();
    return asset
      ? calcOverallAssetSize(asset, null, layoutMode, this.hasMultipleAssets)
      : null;
  }

  get autoColorPalette(): Schema.AssetColorPalette {
    // For now, just return the first asset's `colorPalette`, or the default built-in one.
    const colorPalette: Schema.AssetColorPalette =
      this.numAssets() > 0 ? this.assets[0].metadata.colorPalette : null;

    return colorPalette;
  }

  static get defaultBuiltInColorPalette(): Schema.AssetColorPalette {
    return builtInColorPalettes.light;
  }

  public getColorPalette(): Schema.AssetColorPalette {
    let colorPalette = null;
    if (this.backgroundColor == null) {
      if (this.autoColorPalette == null) {
        colorPalette = colorAnalysis(White);
      } else {
        colorPalette = this.autoColorPalette;
      }
    } else {
      colorPalette = colorAnalysis(this.backgroundColor);
    }
    if (this.numAssets() > 0 &&
      this.hasShadow() &&
      this.getLayoutMode() !== LAYOUT_MODE_INTRO
    ) {
      colorPalette = desaturateBlackBackground(colorPalette);
    }
    return colorPalette;
  }

  get colorPalette(): Schema.AssetColorPalette {
    return this.getColorPalette();
  }

  get autoTextColor(): string {
    return this.colorPalette.text;
  }

  get isBackgroundColorAutomatic(): boolean {
    return this.colorPalette === this.autoColorPalette;
  }

  get textColor(): string {
    return this.slide.textColor || this.autoTextColor;
  }

  public getTextAssetPosition(
    overrideTextAssetPosition: Schema.TextAssetPosition,
    autoTextAssetPosition?: Schema.TextAssetPosition,
  ): Schema.TextAssetPosition | null {
    const calcedAutoTextAssetPosition =
      autoTextAssetPosition != null ? autoTextAssetPosition : null;

    const textPositionCustomization = this.slide.layoutCustomizations.find(
      c => 'TextAssetPosition' === c.type,
    );

    const {
      position: assetPosition,
    } = (textPositionCustomization as Schema.TextAssetPositionCustomization) || { position: null };

    // return auto position if position not defined in schema or as override
    return overrideTextAssetPosition
      ? overrideTextAssetPosition
      : assetPosition
      ? assetPosition
      : calcedAutoTextAssetPosition;
  }

  public getLayoutMode(overridelayoutMode?: Schema.LayoutMode): Schema.LayoutMode | null {
    const layoutModeCustomization = this.slide.layoutCustomizations.find(
      c => 'LayoutMode' === c.type,
    );

    const {
      mode: slideLayoutMode,
    } = (layoutModeCustomization as Schema.LayoutModeCustomization) || { mode: null };

    const layoutModeAuto = this.slide.layoutCustomizations.find(c => 'LayoutModeAuto' === c.type);

    const { mode: slideLayoutModeAuto } = (layoutModeAuto as Schema.LayoutModeCustomization) || {
      mode: null,
    };

    const finalLayoutMode =
      slideLayoutMode !== null
        ? slideLayoutMode
        : slideLayoutModeAuto !== null
        ? slideLayoutModeAuto
        : LAYOUT_MODE_TELL;

    return (overridelayoutMode != null ? overridelayoutMode : finalLayoutMode) as Schema.LayoutMode;
  }

  get textAssetPositionCustomization(): Schema.TextAssetPositionCustomization {
    const textPositionCustomization = this.slide.layoutCustomizations.find(
      c => 'TextAssetPosition' === c.type,
    );
    const textAssetPosition = (textPositionCustomization as Schema.TextAssetPositionCustomization) || {
      position: null,
    };
    return textAssetPosition != null ? textAssetPosition.position : null;
  }
}
