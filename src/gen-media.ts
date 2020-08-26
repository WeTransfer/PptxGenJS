/**
 * PptxGenJS: Media Methods
 */

import * as JSZip from 'jszip'
import { IMG_BROKEN } from './core-enums'
import { IFontRel, ISlide, ISlideLayout, ISlideRelMedia } from './core-interfaces'

const sharp = require('sharp');

const getExtension = (filename: string):string => {
	return filename.split('.').pop();
}

// for local files and non https files
function zipBase64MediaData(fs: any, rel: any, zip: JSZip) {
	if (rel.type !== 'online' && rel.type !== 'hyperlink') {
		// A: Loop vars
		let data: string = rel.data && typeof rel.data === 'string' ? rel.data : ''

		// B: Users will undoubtedly pass various string formats, so correct prefixes as needed
		if (data.indexOf(',') === -1 && data.indexOf(';') === -1) data = 'image/png;base64,' + data
		else if (data.indexOf(',') === -1) data = 'image/png;base64,' + data
		else if (data.indexOf(';') === -1) data = 'image/png;' + data
		zip.file(rel.Target.replace('..', 'ppt'), data.split(',').pop(), { base64: true })
	}
}

/**
 * Encode Image/Audio/Video into base64
 * @param {ISlide | ISlideLayout} layout - slide layout
 * @return {Promise} promise of generating the rels
 */
export function encodeSlideMediaRels(layout: ISlide | ISlideLayout, zip: JSZip): Promise<string>[] {
	const fs = typeof require !== 'undefined' && typeof window === 'undefined' ? require('fs') : null // NodeJS
	const https = typeof require !== 'undefined' && typeof window === 'undefined' ? require('https') : null // NodeJS
	let imageProms: Promise<string>[] = []

	// A: Read/Encode each audio/image/video thats not already encoded (eg: base64 provided by user)
	console.error('relsMedia = ', JSON.stringify(layout.relsMedia));
	const filteredRelsMedia = layout.relsMedia.filter(rel => rel.type !== 'online' && !rel.data)
	console.error('filteredRelsMedia = ', JSON.stringify(filteredRelsMedia));
	filteredRelsMedia
		.forEach((rel, index) => {
			// media objects generate 2 rels, so check to see if the previous rel has the same target
			if (index === 0 || rel.Target.localeCompare(filteredRelsMedia[index -1].Target) !== 0) {
				imageProms.push(
					new Promise((resolve, reject) => {
						if (fs && rel.path.indexOf('http') !== 0) {
							// // DESIGN: Node local-file encoding is syncronous, so we can load all images here, then call export with a callback (if any)
							try {
								let bitmap = fs.readFileSync(rel.path)
								rel.data = Buffer.from(bitmap).toString('base64')
								zipBase64MediaData(fs, rel, zip)
								resolve('done')
							} catch (ex) {
								rel.data = IMG_BROKEN
								reject('ERROR: Unable to read media: "' + rel.path + '"\n' + ex.toString())
							}
						} else if (fs && https && rel.path.indexOf('http') === 0) {
							console.error('about to download image/ video');
							console.error('rel = ', JSON.stringify(rel));
							https.get(rel.path, res => {
								let rawData = ''
								res.setEncoding('binary') // IMPORTANT: Only binary encoding works
								res.on('data', chunk => (rawData += chunk))
								res.on('end', () => {
									rel.data = Buffer.from(rawData, 'binary')
									// check for webp image and convert to png if so
									console.error('about to try sharp, rel.Type = ', JSON.stringify(rel.type))
									if (!rel.type.includes('video')) {
										try {
											const image = sharp(rel.data)
											image
												.metadata()
												.then((metadata) => {
													console.error('metadata.format = ', JSON.stringify(metadata.format))
													if (metadata.format === 'webp') {
														return image
															.png()
															.toBuffer();
													} else {
														return rel.data
													}
												})
												.then((data) => {
													console.error('in then, rel = ', JSON.stringify(rel));
													zip.file(rel.Target.replace('..', 'ppt'), data, { binary: true })
													console.error('past zip');
													resolve('done')
												})
										 }
										catch (e) {
											console.error('in catch');
											zip.file(rel.Target.replace('..', 'ppt'), rel.data, { binary: true })
											resolve('done')
										}
									} else {
										console.error('rel.type was video, skipping sharp');
										zip.file(rel.Target.replace('..', 'ppt'), rel.data, { binary: true })
										resolve('done')
									}
		
								})
								res.on('error', ex => {
									console.error('in on error');
									rel.data = IMG_BROKEN
									reject(`ERROR! Unable to load image: ${rel.path}`)
								})
							})
						} else {
							// A: Declare XHR and onload/onerror handlers
							// DESIGN: `XMLHttpRequest()` plus `FileReader()` = Ablity to read any file into base64!
							let xhr = new XMLHttpRequest()
							xhr.onload = () => {
								let reader = new FileReader()
								reader.onloadend = () => {
									rel.data = reader.result
									if (!rel.isSvgPng) {
										zipBase64MediaData(fs, rel, zip)
										resolve('done')
									} else {
										createSvgPngPreview(rel)
											.then(() => {
												zipBase64MediaData(fs, rel, zip)
												resolve('done')
											})
											.catch(ex => {
												reject(ex)
											})
									}
								}
								reader.readAsDataURL(xhr.response)
							}
							xhr.onerror = ex => {
								rel.data = IMG_BROKEN
								reject(`ERROR! Unable to load image: ${rel.path}`)
							}
	
							// B: Execute request
							xhr.open('GET', rel.path)
							xhr.responseType = 'blob'
							xhr.send()
						}
					})
				)
			}

		})

	// B: SVG: base64 data still requires a png to be generated (`isSvgPng` flag this as the preview image, not the SVG itself)
	layout.relsMedia
		.filter(rel => rel.isSvgPng && rel.data)
		.forEach(rel => {
			if (fs) {
				//console.log('Sorry, SVG is not supported in Node (more info: https://github.com/gitbrent/PptxGenJS/issues/401)')
				rel.data = IMG_BROKEN
				imageProms.push(Promise.resolve().then(() => 'done'))
			} else {
				imageProms.push(createSvgPngPreview(rel))
			}
		})

	return imageProms
}

export function encodeFontRels(fontRel: IFontRel, zip: JSZip): Promise<string> {
	const fs = typeof require !== 'undefined' && typeof window === 'undefined' ? require('fs') : null // NodeJS
	let imageProm: Promise<string> = new Promise((resolve, reject) => {
		try {
			fs.readFile(fontRel.fileName, function read(err, data) {
				zip.file('ppt/' + fontRel.Target, data, { binary: true })
				resolve('done')
			})	
		} catch (ex) {
			reject('ERROR: Unable to read font: "' + fontRel.fileName + '"\n' + ex.toString())
		}
	})
	return imageProm
}

/**
 * Create SVG preview image
 * @param {ISlideRelMedia} rel - slide rel
 * @return {Promise} promise
 */
function createSvgPngPreview(rel: ISlideRelMedia): Promise<string> {
	return new Promise((resolve, reject) => {
		// A: Create
		let image = new Image()

		// B: Set onload event
		image.onload = () => {
			// First: Check for any errors: This is the best method (try/catch wont work, etc.)
			if (image.width + image.height === 0) {
				image.onerror('h/w=0')
			}
			let canvas: HTMLCanvasElement = document.createElement('CANVAS') as HTMLCanvasElement
			let ctx = canvas.getContext('2d')
			canvas.width = image.width
			canvas.height = image.height
			ctx.drawImage(image, 0, 0)
			// Users running on local machine will get the following error:
			// "SecurityError: Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported."
			// when the canvas.toDataURL call executes below.
			try {
				rel.data = canvas.toDataURL(rel.type)
				resolve('done')
			} catch (ex) {
				image.onerror(ex)
			}
			canvas = null
		}
		image.onerror = ex => {
			rel.data = IMG_BROKEN
			reject(`ERROR! Unable to load image: ${rel.path}`)
		}

		// C: Load image
		image.src = typeof rel.data === 'string' ? rel.data : IMG_BROKEN
	})
}

/**
 * FIXME: TODO: currently unused
 * TODO: Should return a Promise
 */
function getSizeFromImage(inImgUrl: string): { width: number; height: number } {
	const sizeOf = typeof require !== 'undefined' ? require('sizeof') : null // NodeJS

	if (sizeOf) {
		try {
			let dimensions = sizeOf(inImgUrl)
			return { width: dimensions.width, height: dimensions.height }
		} catch (ex) {
			console.error('ERROR: sizeOf: Unable to load image: ' + inImgUrl)
			return { width: 0, height: 0 }
		}
	} else if (Image && typeof Image === 'function') {
		// A: Create
		let image = new Image()

		// B: Set onload event
		image.onload = () => {
			// FIRST: Check for any errors: This is the best method (try/catch wont work, etc.)
			if (image.width + image.height === 0) {
				return { width: 0, height: 0 }
			}
			let obj = { width: image.width, height: image.height }
			return obj
		}
		image.onerror = () => {
			console.error(`ERROR: image.onload: Unable to load image: ${inImgUrl}`)
		}

		// C: Load image
		image.src = inImgUrl
	}
}
