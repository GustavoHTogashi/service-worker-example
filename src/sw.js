var FILES_CACHE_NAME = "";

var ASSETS_CACHE_NAME = "";

var appAssetsUrls = [];
var appFilesUrls = [];

self.addEventListener("install", function (e) {
	log("info", "installing...");
	self.skipWaiting();
});

self.addEventListener("activate", function (e) {
	log("sucess", "activate");

	var currentCaches = [ASSETS_CACHE_NAME, FILES_CACHE_NAME];

	e.waitUntil(
		caches
			.keys()
			.then(cacheNames => {
				return cacheNames.filter(
					cacheName => !currentCaches.includes(cacheName)
				);
			})
			.then(cachesToRemove => {
				log("error", "caches to remove");
				console.log(cachesToRemove);
				return Promise.all(
					cachesToRemove.map(cacheToRemove => {
						return caches.delete(cacheToRemove);
					})
				);
			})
			.then(() => self.clients.claim())
	);
});

self.addEventListener("fetch", e => {
	if (!self.navigator.onLine) {
		log("info", `fetch from cache... ${e.request.url}`);
		e.respondWith(
			caches
				.match(e.request)
				.then(res => res)
				.catch(err => log("error", "error", err))
		);
		return;
	}

	// findOldCaches().then(res => console.log(res))

	e.respondWith(
		caches
			.match(e.request)
			.then(cache => {
				return findOldCaches()
					.then(oldCaches => {
						if (cache && oldCaches.length === 0) {
							log('info', 'fetch from cache...', cache)
							return cache
						}

						return fetch(e.request)
							.then(res => {
								log("info", `fetch from web... ${e.request.url}`);

								const resClone = res.clone();

								var assetsFiletypes = [...new Set(getFiletypes(appAssetsUrls))];
								var filesFiletypes = [...new Set(getFiletypes(appFilesUrls))];

								if (isEmpty(assetsFiletypes) || isEmpty(filesFiletypes)) {
									log('error', 'no config defined to cache')
								}

								if (self.registration.scope === res.url) {
									caches.open(FILES_CACHE_NAME).then(cache => {
										cache.put(e.request, resClone);
									});

									return res;
								}

								if (assetsFiletypes.find(filetype => res.url.includes(filetype))) {
									caches.open(ASSETS_CACHE_NAME).then(cache => {
										cache.put(e.request, resClone);
									});

									return res;
								}

								if (filesFiletypes.find(filetype => res.url.includes(filetype))) {
									caches.open(FILES_CACHE_NAME).then(cache => {
										cache.put(e.request, resClone);
									});

									return res;
								}

								return res;
							})
							.catch(err => { log("error", "error", err); })
					})
					.then(x => x);
			})
	);
});

function findOldCaches() {
	return caches.keys()
		.then((cachesNames) => {
			return cachesNames.filter((cacheName) => ![FILES_CACHE_NAME, ASSETS_CACHE_NAME].includes(cacheName));
		})
		.then((filtered) => filtered);
}


function getFiletypes(originArr) {
	if (!isEmpty(originArr)) {
		return originArr.map(x => {
			var s = x.split(".");
			return s[s.length - 1];
		});
	}

	return [];
}

function log(type, msg, content = "") {
	if (type === "error") {
		console.log(
			`%c[SERVICE WORKER] ➡ ${msg}`,
			"color: #EB3941; background: #000",
			content
		);
		return;
	}
	if (type === "sucess") {
		console.log(
			`%c[SERVICE WORKER] ➡ ${msg}`,
			"color: #5FA613; background: #000",
			content
		);
		return;
	}
	if (type === "info") {
		console.log(
			`%c[SERVICE WORKER] ➡ ${msg}`,
			"color: #1976D2; background: #000",
			content
		);
		return;
	}

	console.log(
		`%c[SERVICE WORKER] ➡ ${msg}`,
		"color: #; background: #000",
		content
	);
	return;
}

function isEmpty(arr) {
	return arr.length === 0
}
