const cache = (() => {
	// Try to get data from the cache, but fall back to fetching it live.
	async function getData(url) {
		const cacheVersion = 1;
		const cacheName = `currencies-${cacheVersion}`;
		let cachedData = await getCachedData(cacheName, url);

		if (cachedData) {
			console.log('Retrieved cached data');
			return cachedData;
		}

		console.log('Fetching fresh data');

		const cacheStorage = await caches.open(cacheName);
		await cacheStorage.add(new Request(url, { cache: 'reload' }));
		cachedData = await getCachedData(cacheName, url);
		await deleteOldCaches(cacheName);

		return cachedData;
	}

	// Get data from the cache.
	async function getCachedData(cacheName, url) {
		const cacheStorage = await caches.open(cacheName);
		const cachedResponse = await cacheStorage.match(url);

		if (!cachedResponse || !cachedResponse.ok) {
			return false;
		}

		const date = new Date(cachedResponse.headers.get('date'));

		const endOfDay = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
			23,
			59,
			59,
		);

		if (new Date() > endOfDay.getTime()) {
			return false;
		}

		return await cachedResponse.json();
	}

	// Delete any old caches to respect user's disk space.
	async function deleteOldCaches(currentCache) {
		const keys = await caches.keys();

		for (const key of keys) {
			const isOurCache = 'currencies-' === key.substr(0, 11);

			if (currentCache === key || !isOurCache) {
				continue;
			}

			caches.delete(key);
		}
	}

	return { getData };
})();
