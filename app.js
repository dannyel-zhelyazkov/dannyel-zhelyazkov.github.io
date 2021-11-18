const currenciesSelector = document.querySelector('#currencies-selector');
const longestArrayResult = document.querySelector('#longest-array-length');
const groups = document.querySelectorAll('ul[id^=values]');

const createUrl = (curr1, curr2) =>
	`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${curr1}/${curr2}.json`;

const createLIElement = (value) => {
	const text = document.createTextNode(value);
	const li = document.createElement('li');

	li.appendChild(text);

	return li;
};

const prepareUrls = (firstCurrency, secondCurrency) => {
	const firstCurrencyToLowerCase = firstCurrency.toLowerCase();
	const secondCurrencyToLowerCase = secondCurrency.toLowerCase();

	return [
		createUrl(firstCurrencyToLowerCase, secondCurrencyToLowerCase),
		createUrl(secondCurrencyToLowerCase, firstCurrencyToLowerCase),
	];
};

const longestArray = (currencies) => {
	if (Math.abs(currencies[0] - currencies[currencies.length - 1]) <= 0.5) {
		return currencies.length;
	}

	const result = currencies.reduce(
		(acc, current) => {
			if (
				current != acc.currentElement &&
				Math.abs(current - acc.currentElement) <= 0.5
			) {
				acc.currentLength += 1;
				return acc;
			}

			if (acc.currentLength > acc.highestLength) {
				acc.currentElement = current;
				acc.highestLength = acc.currentLength;
				acc.currentLength = 0;
			}

			return acc;
		},
		{
			currentElement: currencies[0],
			currentLength: 1,
			highestLength: 1,
		},
	);

	return result.highestLength;
};

const currencies = async () => {
	const currenciesOptions = currenciesSelector.options;
	const selectedCurrency =
		currenciesOptions[currenciesOptions.selectedIndex].value;

	// Get currencies names
	const currenciesValues = Object.values(currenciesOptions).map(
		(option) => option.value,
	);

	// Clear the groups before populating with new result
	groups.forEach((g) => (g.innerHTML = ''));

	let urlsToFetch = [];

	// Prepare the urls for fetching
	currenciesValues.forEach((value) => {
		if (value !== selectedCurrency) {
			urlsToFetch.push(...prepareUrls(value, selectedCurrency));
		}
	});

	// Make requests
	const promises = urlsToFetch.map((url) =>
		fetch(url).then((response) => response.json()),
	);

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

	// Grouping and sorting the data
	const sortedCurrencies = Object.assign([], currenciesNameValue).sort(
		(a, b) => a[1] - b[1],
	);

	const groupedCurrencies = sortedCurrencies.reduce(
		(acc, current) => {
			const item = `${current[0]}: ${current[1].toFixed(2)}`;

			if (current[1] < 1) {
				acc.group1.push(item);
			}

			if (current[1] >= 1 && current[1] < 1.5) {
				acc.group2.push(item);
			}

			if (current[1] >= 1.5) {
				acc.group3.push(item);
			}

			return acc;
		},
		{
			group1: [],
			group2: [],
			group3: [],
		},
	);

	// Populating the groups
	Object.values(groupedCurrencies).forEach((value, index) => {
		value.forEach((result) => {
			const listItem = createLIElement(result);
			groups[index].appendChild(listItem);
		});

		const listItem = createLIElement(`Count: ${value.length}`);
		groups[index].appendChild(listItem);
	});

	longestArrayResult.innerText = longestArray(
		Object.values(sortedCurrencies).map((value) => value[1]),
	);
};

currenciesSelector.addEventListener('change', currencies);

document.onreadystatechange = async () => {
	if (document.readyState === 'complete') {
		currencies();
	}
};
