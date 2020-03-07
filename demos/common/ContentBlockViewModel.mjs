export class AbstractContentBlock {
    slug;
    displayOptions;
    layoutOptions;
    type;
  
    constructor(block) {
      this.slug = block.slug;
      this.displayOptions = block.displayOptions;
      this.layoutOptions = block.layoutOptions;
    }
  }

export class TextContentBlockViewModel extends AbstractContentBlock {
  textOptions;
  textBody = null;
  type = 'Text';

  constructor(block) {
    super(block);
    this.textOptions = block.textOptions;
    this.textBody = block.textBody;
  }
}
