import { exportSlides} from "./PasteExport.mjs";
let verboseMode = true;

if (verboseMode) console.log(`\n-----==~==[ STARTING Paste Schema Export ]==~==-----\n`);

Promise.resolve()
	.then(() => {
		return exportSlides();
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
