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
import { execGenSlidesFuncs} from "../common/demos.mjs";
let verboseMode = true;

if (verboseMode) console.log(`\n-----==~==[ STARTING DEMO ]==~==-----\n`);

// STEP 2: Run predefined test from `../common/demos.js` //-OR-// Local Tests (callbacks, etc.)
Promise.resolve()
	.then(() => {
		return execGenSlidesFuncs();
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
