import { SlideBody, TextOptions } from '@present-app/types/Schema';
import { TextContentBlockViewModel } from '@present-app/viewmodel/ContentBlockViewModel';

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
  assets: ContentBlock[];
}

export interface Slide extends Layoutable {
  containers: Container[];
}
