import {
    ContentBlock,
    ContentBlockType,
    DisplayOptions,
    LayoutOptions,
  } from '../schema/Schema';
  
  export abstract class AbstractContentBlock {
    slug: string;
    displayOptions: DisplayOptions;
    layoutOptions: LayoutOptions;
    type: ContentBlockType;
  
    constructor(block: Partial<ContentBlock>) {
      this.slug = block.slug;
      this.displayOptions = block.displayOptions;
      this.layoutOptions = block.layoutOptions;
    }
  }
  