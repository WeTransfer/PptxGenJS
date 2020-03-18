import { Container } from './Schema';

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

export interface Slide extends Layoutable {
  containers: Container[];
}