/*
 * NAME: demo.js
 * AUTH: Brent Ely (https://github.com/gitbrent/)
 * DATE: 20200202
 * DESC: PptxGenJS feature demos for Node.js
 * REQS: npm 4.x + `npm install pptxgenjs`
 *
 * USAGE: `node demo.js`       (runs local tests with callbacks etc)
 * USAGE: `node demo.js All`   (runs all pre-defined tests in `../common/demos.js`)
 * USAGE: `node demo.js Text`  (runs pre-defined single test in `../common/demos.js`)
 */

// ============================================================================
let verboseMode = true;
let PptxGenJS = require("pptxgenjs");
let demo = require("../common/demos.js");
let pptx = new PptxGenJS();

if (verboseMode) console.log(`\n-----==~==[ STARTING DEMO ]==~==-----\n`);
if (verboseMode) console.log(`* pptxgenjs ver: ${pptx.version}`);
if (verboseMode) console.log(`* save location: ${__dirname}`);

// STEP 2: Run predefined test from `../common/demos.js` //-OR-// Local Tests (callbacks, etc.)
Promise.resolve()
	.then(() => {
		return demo.execGenSlidesFuncs();
	})
	.catch(err => {
		throw err;
	})
	.then(fileName => {
		console.log("EX1 exported: " + fileName);
	})
	.catch(err => {
		console.log("ERROR: " + err);
	});

// ============================================================================

if (verboseMode) console.log(`\n-----==~==[ DEMO COMPLETE! ]==~==-----\n`);
