import { getAssetContainerCoordinates, getAssetCoordinates, getTextOptions} from './GeneratePPTCoordinates.mjs';
import { fromSlideViewModel, getBackGroundColor, getLayoutMode} from './fromSlideViewModel.mjs';
import PptxGenJS from '../../dist/pptxgen.cjs.js';
import pasteSchema from './json/PasteSchema.json';

const getTimestamp = () => {
	var dateNow = new Date();
    var dateMM = dateNow.getMonth() + 1; 
    var dateDD = dateNow.getDate(); 
    var h = dateNow.getHours(); 
    var m  = dateNow.getMinutes();
	return dateNow.getFullYear() +''+ (dateMM<=9 ? '0' + dateMM : dateMM) +''+ (dateDD<=9 ? '0' + dateDD : dateDD) + (h<=9 ? '0' + h : h) + (m<=9 ? '0' + m : m);
}

const genSlides_Paste = (pptx) => {
    pasteSchema.deck.slides.forEach(slide => {
        const bentoSchema = fromSlideViewModel(slide);
        const pptSlide = pptx.addSlide();
        const backgroundColor = getBackGroundColor(slide); 
        pptSlide.bkgd = backgroundColor;
        const layoutMode = getLayoutMode(slide);
        const asset = slide.assets[0];
        bentoSchema.containers.forEach(container => {
            let assetURL = null;
            let assetCoordinates = null;
            const hasBleed = layoutMode !== 'Tell';
            const isIntro = layoutMode === 'Intro';
            assetCoordinates = isIntro
              ? getAssetContainerCoordinates(container.assetContainer, hasBleed)
              : getAssetCoordinates(container.assetContainer, hasBleed, asset);
            switch (asset.type) {
              case 'Image': {
                assetURL = asset.content.metadata.url;
                const imageOptions = {
                  ...assetCoordinates,
                  path: assetURL,
                  type: isIntro ? 'cover' : 'contain',
                };
                pptSlide.addImage(imageOptions);
                break;
              }
              case 'OEmbed':
                assetURL = asset.content.photo.url;
                switch (asset.content.type) {
                  case 'Photo': {
                    const imageOptions = {
                      ...assetCoordinates,
                      path: assetURL,
                      type: isIntro ? 'cover' : 'contain',
                    };
                    pptSlide.addImage(imageOptions);
                    break;
                  }
                  case 'Video': {
                    const videoOptions = {
                      ...assetCoordinates,
                      link: assetURL,
                      type: 'online',
                    };
                    pptSlide.addMedia(videoOptions);
                    break;
                  }
                  default:
                    break;
                }
                break;
              case 'Video': {
                assetURL = asset.bestTranscoding.url;
                const videoOptions = {
                  ...assetCoordinates,
                  path: assetURL,
                  type: 'video',
                };
                pptSlide.addMedia(videoOptions);
                break;
              }
              default:
                break;
            }
            const { textBlocks, textOptions } = getTextOptions(
              layoutMode,
              container,
            );
            pptSlide.addText(textBlocks, textOptions);
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