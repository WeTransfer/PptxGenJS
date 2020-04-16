function getTimestamp() {
	var dateNow = new Date();
	var dateMM = dateNow.getMonth() + 1; dateDD = dateNow.getDate(); dateYY = dateNow.getFullYear(), h = dateNow.getHours(); m = dateNow.getMinutes();
	return dateNow.getFullYear() +''+ (dateMM<=9 ? '0' + dateMM : dateMM) +''+ (dateDD<=9 ? '0' + dateDD : dateDD) + (h<=9 ? '0' + h : h) + (m<=9 ? '0' + m : m);
}

// ==================================================================================================================

function execGenSlidesFuncs(type) {
	// STEP 1: Instantiate new PptxGenJS object
	var pptx;
	// var PptxGenJsLib;
	// var fs = require('fs');
	// if (fs.existsSync('../../dist/pptxgen.cjs.js')) {
	// 	PptxGenJsLib = require('../../dist/pptxgen.cjs.js'); // for LOCAL TESTING
	// }
	let pptxgen = require("../../dist/pptxgen.cjs.js")
	pptx = new pptxgen();

	genSlides_Paste(pptx);
	
	// Export Presentation
	return pptx.writeFile('PptxGenJS_Demo_Node_'+type+'_'+getTimestamp());
}

function genSlides_Paste(pptx) {
	
	const pptSlide = pptx.addSlide();
	pptSlide.addText(
		[{"text":"https://www.google.com","options":{"bold":false,"italic":false,"hyperlink":{"rId":0,"url":"https://www.google.com"},"color":"f68270","fontSize":14,"lineSpacing":21,"paraSpaceAfter":0,"paraSpaceBefore":0,"bullet":false,"align":"left","valign":"center","fontFace":"AvenirNext-Regular"}}],
		{"x":2.000000000000001,"y":0.5624999999999999,"w":5.999999999999998,"h":4.5,"color":"f68270","align":"left","valign":"center","inset":0.26}
	);
}

// ==================================================================================================================

if ( typeof module !== 'undefined' && module.exports ) {
	module.exports = {
		execGenSlidesFuncs: execGenSlidesFuncs
	}
}