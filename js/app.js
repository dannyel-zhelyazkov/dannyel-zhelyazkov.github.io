((
	{ createLIElement, prepareUrls, groupCurrencies, longestArray },
	{ getData },
) => {
	/**
	 *
	 * VARIABLES
	 *
	 */

	const currenciesSelector = document.querySelector('#currencies-selector');
	const longestArrayResult = document.querySelector('#longest-array-length');
	const groups = document.querySelectorAll('ul[id^=values]');

	/**
	 *
	 * HANDLERS
	 *
	 */

	const handleChangeCurrency = async () => {
		const currenciesOptions = currenciesSelector.options;
		const selectedCurrency =
			currenciesOptions[currenciesOptions.selectedIndex].value;

		// Get currencies names
		const currenciesValues = Object.values(currenciesOptions).map(
			(option) => option.value,
		);

		// Clear the groups before populating with new result
		groups.forEach((g) => (g.innerHTML = ''));

		const urlsToFetch = [];

		// Prepare the urls for fetching
		currenciesValues.forEach((value) => {
			if (value !== selectedCurrency) {
				urlsToFetch.push(...prepareUrls(value, selectedCurrency));
			}
		});

		// Make requests
		const promises = urlsToFetch.map(async (url) => {
			return await getData(url);
		});

		// Handle requests
		const data = await Promise.all(promises)
			.then((value) => value)
			.catch((error) => console.error(error));

		// Preparing the data for the end user ( ex: usd: 1.23 -> USD-BGN: 1.23 )
		const currenciesNameValue = Object.keys(data).reduce((acc, key, index) => {
			if (data[index + 1]) {
				const entry = Object.entries(data[key]);
				const nextEntry = Object.entries(data[index + 1]);

				entry[1][0] = `${entry[1][0].toUpperCase()}-${nextEntry[1][0].toUpperCase()}`;

				acc.push(entry[1]);
			}

			return acc;
		}, []);

		const sortedCurrencies = Object.assign([], currenciesNameValue).sort(
			(a, b) => a[1] - b[1],
		);

		const groupedCurrencies = groupCurrencies(sortedCurrencies);

		// Populating the groups
		Object.values(groupedCurrencies).forEach((value, index) => {
			value.forEach((result) => {
				const listItem = createLIElement(result);
				groups[index].appendChild(listItem);
			});

			const listItem = createLIElement(`Count: ${value.length}`);
			groups[index].appendChild(listItem);
		});

		// Displaying the result of longest array
		longestArrayResult.innerText = longestArray(
			Object.values(sortedCurrencies).map((value) => value[1]),
		);
	};

	currenciesSelector.addEventListener('change', handleChangeCurrency);

	document.onreadystatechange = async () => {
		if (document.readyState === 'complete') {
			handleChangeCurrency();
		}
	};
})(utils, cache);
