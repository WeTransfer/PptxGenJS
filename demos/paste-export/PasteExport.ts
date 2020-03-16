import * as Schema from './schema/Schema';
import { fromSlideViewModel } from './layout/fromSlideViewModel';
import { getAssetOptions, getOverlayOptions, getTextOptions } from './layout/GeneratePPTCoordinates';
import { getBackGroundColor, getLayoutMode } from './viewmodel/SlideViewModel';
import pptxgen from '../../dist/pptxgen.cjs.js';
import pasteSchema from './json/PasteSchema.json';
import policySchema  from './json/PastePolicy.json';
import { Slide } from './schema/Schema';

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
    const policy = policySchema
    deck.slides.forEach(slide => {
        const bentoSchema = fromSlideViewModel(slide);
        const pptSlide = pptx.addSlide();
        const layoutMode = getLayoutMode(slide);
        const backgroundColor = getBackGroundColor(slide);
        pptSlide.bkgd = backgroundColor;
        bentoSchema.containers.forEach(container => {
            const {
              assetType,
              assetOptions
            } = 
              getAssetOptions(
                pptx,
                container,
                slide,
                layoutMode,
                policy
              );
            if (assetOptions !== null ) {
              switch (assetType) {
                case 'image':
                  pptSlide.addImage(assetOptions);
                  break;
                case 'media':
                  pptSlide.addMedia(assetOptions);
                  break;
                case 'unsupported':
                  pptSlide.addText('Embed type not supported', assetOptions);
                  break;
              }
            }
            const {
              textBlocks,
              textOptions
            } = getTextOptions(
              layoutMode,
              container,
            );
            if (textOptions != null && assetOptions != null && layoutMode === 'Intro') {
              // if there is an asset and text in Intro mode,
              // add a transparent shape over the asset
              const overlayOptions = getOverlayOptions(
                container,
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