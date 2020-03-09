import pptxgen from '../../dist/pptxgen.cjs.js';


// ==================================================================================================================

export const execGenSlidesFuncs = (type) => {
	// STEP 1: Instantiate new PptxGenJS object
	var pptx;
	// var PptxGenJsLib;
	// var fs = require('fs');
	// if (fs.existsSync('../../dist/pptxgen.cjs.js')) {
	// 	PptxGenJsLib = require('../../dist/pptxgen.cjs.js'); // for LOCAL TESTING
	// }
	// else {
	// 	PptxGenJsLib = require("pptxgenjs");
	// }
	pptx = new pptxgen();

	
	// Export Presentation
	return pptx.writeFile('PptxGenJS_Demo_Node_'+type+'_'+getTimestamp());
}