import { Asset, SlideBody, TextOptions } from './Schema';

export interface Coordinates {
  readonly x: number | 'center';
  readonly y: number | 'center';
}

export interface Dimensions {
  readonly width: number | null;
  readonly height: number | null;
}

export interface Layoutable {
  layoutOptions: Coordinates & Dimensions;
}

export interface TextContentBlock extends Layoutable {
  type: 'Text';
  textOptions: TextOptions;
  textBody: SlideBody;
}

export interface ContentBlock extends Layoutable {
  type:
    | 'Text'
    | 'Image'
    | 'OEmbed'
    | 'Video'
    | 'File'
    | 'Placeholder'
    | 'Uploading'
    | 'AssetFramePlaceholder';
}

export interface Container extends Layoutable {
  assetContainer: AssetContainer | null;
  text: TextContentBlock | null;
}

export interface AssetContainer extends Layoutable {
  assets: ContentBlock[] | Asset[];
}

export interface Slide extends Layoutable {
  containers: Container[];
}