import { getAssetOptions, getTextOptions } from './GeneratePPTCoordinates.mjs';
import { fromSlideViewModel, getBackGroundColor, getLayoutMode } from './fromSlideViewModel.mjs';
import pptxgen from '../../dist/pptxgen.cjs.js';
import pasteSchema from './json/PasteSchema.json';
import policySchema from './json/PastePolicy.json';

const getTimestamp = () => {
	var dateNow = new Date();
    var dateMM = dateNow.getMonth() + 1; 
    var dateDD = dateNow.getDate(); 
    var h = dateNow.getHours(); 
    var m  = dateNow.getMinutes();
	return dateNow.getFullYear() +''+ (dateMM<=9 ? '0' + dateMM : dateMM) +''+ (dateDD<=9 ? '0' + dateDD : dateDD) + (h<=9 ? '0' + h : h) + (m<=9 ? '0' + m : m);
}

const genSlides_Paste = (pptx) => {
    const policy = policySchema;
    pasteSchema.slides.forEach(slide => {
        const bentoSchema = fromSlideViewModel(slide);
        const pptSlide = pptx.addSlide();
        const layoutMode = getLayoutMode(slide);
        pptSlide.bkgd = getBackGroundColor(slide); ;
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
                case 'unspported':
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
            if (textOptions != null) {
              pptSlide.addText(textBlocks, textOptions);
            }
        });
    })
}

export const exportSlides = (type) => {
	// STEP 1: Instantiate new PptxGenJS object
	var pptx;
	pptx = new pptxgen();

	genSlides_Paste(pptx);
	// Export Presentation
	return pptx.writeFile('PptxGenJS_Demo_Node_'+type+'_'+getTimestamp());
}