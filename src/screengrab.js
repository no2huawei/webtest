const debugLog = (msg, msgObj) => {
    let _degugMode = false;
    
    if (_degugMode) {
      	var _msg = msg;
        if (msgObj !== undefined && msgObj !== null) {
            _msg = JSON.stringify({message: msg, detail: msgObj});
        }

        console.log(_msg);  
    }
};

/**
https://github.com/GoogleChrome/puppeteer/
https://github.com/puppeteer/puppeteer/tree/master/experimental/puppeteer-firefox

arg [0] = node.exe
arg [1] = src\screengrab.js
arg [2] = https://design.test.auditanalytics.com/
arg [3] = 1280*1024
arg [4] = output file name (no extension, for png and error)
arg [5] = output root dir (need trailing slash, screenshot image will be saved in output\{browser}\w{width}\)
arg [6] = f | c (firefox or chrome, default chrome)
arg [7] = 500 (delay, default 500 ms)

node src\screengrab.js https://design.test.auditanalytics.com/ 1280*1024 pageLink1 C:/workspace/webtest/output/ f 500 xx
**/
if (process.argv.length < 6 || process.argv.length > 8)
{
	console.info('Usage: screengrab.js pageURL width*height outputFileName outputRootDir browser delay');

	process.argv.forEach((val, index, array) => {
		console.info('arg [' + index + '] = ' + val);
	});

	process.exit();
}

var pageLink = process.argv[2];

var wh = process.argv[3].split('*');
var screenWidth = parseInt(wh[0], 10);
var screenHeight = parseInt(wh[1], 10);
var screenSize = {'width': screenWidth, 'height': screenHeight};

debugLog('width = ' + screenWidth + ' height = ' + screenHeight);

var lib = 'puppeteer';
var browser = 'chrome'; 
var delay = 500;

if (process.argv.length > 6) {
    if (process.argv[6] == 'f') {
        lib = 'puppeteer-firefox';
        browser = 'firefox';
    }
    
    if (process.argv.length == 8) {
        delay = parseInt(process.argv[7]);      
    }
}

const pptr = require(lib);
const fs = require('fs');
const makeDir = require('make-dir');

var targetPath = process.argv[5] + browser + '/w' +  screenWidth + '/';
var screeniePng = targetPath + process.argv[4] + '.png';

debugLog('lib = ' + lib);
debugLog('screeniePng = ' + screeniePng);

(async () => {
    if (!fs.existsSync(targetPath)){
        await makeDir(targetPath);
    }
	const browser = await pptr.launch({ignoreHTTPSErrors: true,
                                        args: [
                                            '--proxy-server="direct://"',
                                            '--proxy-bypass-list=*'
                                        ]});
    let bver = await browser.version();
    debugLog('browser version = ' + bver);
    const page = await browser.newPage();
    await page.setViewport(screenSize);
    await page.goto(pageLink);
    await page.waitFor(delay);
    await page.screenshot({path: screeniePng, fullPage: true});
    await browser.close();
})().catch( e => {console.error(e)} );

console.log('Done');