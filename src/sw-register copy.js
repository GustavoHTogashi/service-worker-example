_register();

function _register() {

	log('info', 'registering');

	navigator.serviceWorker
		.register('/sw.js', { scope: '/' })
		.then((reg) => {

			if (!navigator.serviceWorker.controller) {
				return;
			}

			if (reg.waiting) {
				_updateReady(reg.waiting);
				return;
			}

			if (reg.installing) {
				_trackInstalling(reg);
				return;
			}

			reg.addEventListener('updatefound', function () {
				_trackInstalling(reg);
			});

			log('sucess', 'registered');
		})
		.catch(err => {
			log('error', 'registering failed', err);
		});

	// Garante que o refresh só é executado uma vez
	// var refreshing;
	// navigator.serviceWorker.addEventListener('controllerchange', () => {
	// 	if (refreshing) return;
	// 	window.location.reload();
	// 	refreshing = true;
	// });
}

function _updateReady(worker) {

	worker.postMessage({ action: 'skipWaiting' });

	// ? USER INTERACTION
	// var update = confirm('Nova versão disponível, deseja atualizar ?');

	// if (update) {

	// 	return;
	// }

	// console.log('not Updating');
}

function _trackInstalling(worker) {
	var controller = this;

	if (worker.waiting) {
		worker.waiting.addEventListener('statechange', function () {
			if (worker.state == 'installed') {
				controller._updateReady(worker);
			}
		});
		return;
	}

	if (worker.installing) {
		worker.installing.addEventListener('statechange', function () {
			if (worker.state == 'installing') {
				controller._updateReady(worker);
			}
		});
		return;
	}

	return;
}

function log(type, msg, content = '') {
	if (type === 'error') {
		console.log(
			`%c[SERVICE WORKER] - ${msg}`,
			'color: #EB3941; background: #000',
			content
		);
		return;
	}
	if (type === 'sucess') {
		console.log(
			`%c[SERVICE WORKER] - ${msg}`,
			'color: #5FA613; background: #000',
			content
		);
		return;
	}
	if (type === 'info') {
		console.log(
			`%c[SERVICE WORKER] - ${msg}`,
			'color: #1976D2; background: #000',
			content
		);
		return;
	}

	console.log(
		`%c[SERVICE WORKER] - ${msg}`,
		'color: #; background: #000',
		content
	);
	return;
}