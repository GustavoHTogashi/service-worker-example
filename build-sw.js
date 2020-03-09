// ? IMPORTS
const fs = require('fs');
const proc = require('child_process');

// ? SCRIPT
const BUILD_SCRIPT = `ng build --prod`
log('info', '[PROCESS] - Start...')
log('run', '[NG BUILD] - Running...')

const NG_BUILD_LOG = proc.execSync(BUILD_SCRIPT).toString();
const NG_BUILD_HASH = NG_BUILD_LOG
	.split('\n')
	.find(line => line.includes('Hash:'))
	.match(/(Hash: )(\w+)/gi)[0]
	.split(':')[1]
	.trimLeft();

	if(!NG_BUILD_LOG) {
		log('error', '[NG BUILD] - failed')
		process.exit(1);
	}

	if (!NG_BUILD_HASH) {
		log('sucess', '[NG BUILD] - hash inexists')
		process.exit(1);
	}

log('sucess', '[NG BUILD] - Completed')
log('sucess', NG_BUILD_LOG)

const APP_NAME = `pwa-app`
const FOLDER_PATH = `${__dirname}\\dist\\${APP_NAME}`;
const SW_PATH = `${__dirname}\\dist\\${APP_NAME}\\sw.js`;

log('run', '[UPDATE SW.JS] - updating files cache name...')
writeLineByKeyword('FILES_CACHE_NAME', `pwa-files ${NG_BUILD_HASH}`)
log('sucess', '[UPDATE SW.JS] - updated files cache name...')

log('run', '[UPDATE SW.JS] - updating assets cache name...')
writeLineByKeyword('ASSETS_CACHE_NAME', `pwa-assets ${NG_BUILD_HASH}`)
log('sucess', '[UPDATE SW.JS] - updated assets cache names...')

log('run', '[READ BUILD FILES] - reading file/assets...')

const ASSETS_EXTENSIONS = ['png', 'jpg', 'svg', 'ico'];
const FILES_EXTENSIONS = ['js', 'html', 'css', 'webmanifest'];
const IGNORED_FILES = ['sw.js', 'sw-register.js'];

const ASSETS_CACHE_LIST = readRecursive(FOLDER_PATH)
	.filter(d => d.indexOf('.') !== 0 && ASSETS_EXTENSIONS.includes(d.split('.')[d.split('.').length - 1]));

const FILES_CACHE_LIST = fs
	.readdirSync(FOLDER_PATH)
	.filter(f => f.indexOf('.') !== 0 && !IGNORED_FILES.includes(f) && FILES_EXTENSIONS.includes(f.split('.')[f.split('.').length - 1]));

log('sucess', '[READ BUILD FILES] - file/assets ok...')

log('run', '[UPDATE SW.JS] - updating assets list...')
writeLineByKeyword('appAssetsUrls', formatFileListToTextArray(ASSETS_CACHE_LIST));
log('sucess', '[UPDATE SW.JS] - updated assets list...')

log('run', '[UPDATE SW.JS] - updating files list...')
writeLineByKeyword('appFilesUrls', formatFileListToTextArray(FILES_CACHE_LIST));
log('sucess', '[UPDATE SW.JS] - updated files list...')

log('info', '[PROCESS] - Finished...')



function formatFileListToTextArray(l) { 
	return l instanceof Array ? l.toString().replace(/,/g, `',\n'`) : `${l}`;
}

function readRecursive(dir, x = []) {
	fs.readdirSync(dir).forEach(f => {
		let p = `${dir}/${f}`;
		fs.lstatSync(p).isDirectory()
			? readRecursive(p, x)
			: x.push(p.replace(`${FOLDER_PATH}/`, ''));
	});
	return x;
}

function writeLineByKeyword(kWord, text) {
	let fText = fs
		.readFileSync(SW_PATH)
		.toString()
		.split('\n');
	const i = fText.findIndex(line => line.includes(kWord));

	if (text.includes('\n')) {
		fText.splice(i, 1, `var ${kWord} = [\n'${text}'\n];`);
	} else {
		fText.splice(i, 1, `var ${kWord} = '${text}';`);
	}

	fs.writeFileSync(SW_PATH, fText.join('\n'), err => {
		err ? log('error', `ERROR WRITING FILE: ${err}`) : null;
		return false;
	});

	log('sucess', `OK - ${kWord}`)
	return true;
}

function log(type, msg) {
	if (type === 'error') {
		console.log('\x1b[31m', msg, '\x1b[0m');
		return;
	}
	if (type === 'sucess') {
		console.log('\x1b[32m', msg, '\x1b[0m');
		return;
	}
	if (type === 'info') {
		console.log('\x1b[36m', msg, '\x1b[0m');
		return;
	}
	if (type === 'run') {
		console.log('\x1b[35m', msg, '\x1b[0m');
		return;
	}

	console.log(
		`%c[SERVICE WORKER] ➡ ${msg}`,
		'color: #; background: #000',
		content
	);
	return;
}