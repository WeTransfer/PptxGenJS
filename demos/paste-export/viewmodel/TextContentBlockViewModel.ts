import { SlideBody, TextContentBlock, TextOptions } from '../schema/Schema';

import { AbstractContentBlock } from './AbstractContentBlock';

export class TextContentBlockViewModel extends AbstractContentBlock implements TextContentBlock {
  textOptions: TextOptions;
  textBody: SlideBody = null;
  type: 'Text' = 'Text';

  constructor(block: Partial<TextContentBlock>) {
    super(block);
    this.textOptions = block.textOptions;
    this.textBody = block.textBody;
  }
}
