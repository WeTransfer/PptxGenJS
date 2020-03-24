/* Takes Paste deck schmea and policy JSON files and generates a PowerPoint deck from them */

import * as Filestack from './utils/Filestack';
import * as Schema from './types/Schema';
import { 
  addAssetsToSlide,
  artBoardDimensions,
  getOverlayOptions,
  getPPTCoordinates,
  getTextOptions,
  hasAssets,
  hasText,
} from './layout/GeneratePPTCoordinates';
import { colorToHex } from './utils/ColorAnalysis';
import { filterTextContentBlock } from './layout/SlideLayout'; 
import { fromSlideViewModel } from './layout/fromSlideViewModel';
import pptxgen from '../../dist/pptxgen.cjs.js';
import pasteSchema from './json/PasteSchema.json';
import policySchema  from './json/PastePolicy.json';
import SlideViewModel from './viewmodel/SlideViewModel';

const getTimestamp = () => {
	var dateNow = new Date();
    var dateMM = dateNow.getMonth() + 1; 
    var dateDD = dateNow.getDate(); 
    var h = dateNow.getHours(); 
    var m  = dateNow.getMinutes();
	return dateNow.getFullYear() +''+ (dateMM<=9 ? '0' + dateMM : dateMM) +''+ (dateDD<=9 ? '0' + dateDD : dateDD) + (h<=9 ? '0' + h : h) + (m<=9 ? '0' + m : m);
}

const genSlides_Paste = (pptx: any) => {
    const deck = pasteSchema as Schema.PresentationSnapshot
    const policy = policySchema as unknown as Filestack.Policy
    deck.slides.forEach(slide => {
        const slideViewModel = new SlideViewModel(policy, slide)
        let slideLayout = fromSlideViewModel(slideViewModel, null, null);

        // remove empty text if viewing grid, or when not in edit mode and slide has assets
        if (slideViewModel.numAssets() > 0) {
          slideLayout = filterTextContentBlock(slideLayout, (content: Schema.TextContentBlock) =>
            content.textBody.hasText(),
          );
        }
        const pptSlide = pptx.addSlide();
        const layoutMode = slideViewModel.getLayoutMode(null);
        const backgroundColor = colorToHex(slideViewModel.getColorPalette().background);
        pptSlide.bkgd = backgroundColor;
        // get overall coordinates of slide in coordinates used by PowerPoint (inches) 
        const slideCoordinates = getPPTCoordinates(artBoardDimensions, slideLayout.layoutOptions);
        slideLayout.containers.forEach(container => {
            const doesHaveAssets = hasAssets(container);
            const doesHaveText = hasText(container);
            addAssetsToSlide(
              pptx,
              pptSlide,
              slideViewModel,
              slideCoordinates,
              container,
              layoutMode,
              policy
            );
            const {
              textBlocks,
              textOptions
            } = getTextOptions(
              layoutMode,
              container,
            );
            
            if (textOptions != null && doesHaveAssets && layoutMode === 'Intro') {
              // if there is an asset and text in Intro mode,
              // add a transparent shape over the asset to make text more visible
              const overlayOptions = getOverlayOptions(
                container,
                slideCoordinates,
                backgroundColor,
              )
              pptSlide.addShape(pptx.ShapeType.rect, overlayOptions);
            }
            if (textOptions != null) {
              pptSlide.addText(textBlocks, textOptions);
            }
        });
    })
}

export const exportSlides = () => {
	// STEP 1: Instantiate new PptxGenJS object
	var pptx;
	pptx = new pptxgen();

	genSlides_Paste(pptx);
	// Export Presentation
	return pptx.writeFile('PptxGenJS_Demo_Node_'+getTimestamp());
}