const utils = (function () {
	const createUrl = (curr1, curr2) =>
		`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${curr1}/${curr2}.json`;

	const createLIElement = (value) => {
		const text = document.createTextNode(value);
		const li = document.createElement('li');

		li.appendChild(text);

		return li;
	};

	var prepareUrls = (firstCurrency, secondCurrency) => {
		const firstCurrencyToLowerCase = firstCurrency.toLowerCase();
		const secondCurrencyToLowerCase = secondCurrency.toLowerCase();

		return [
			createUrl(firstCurrencyToLowerCase, secondCurrencyToLowerCase),
			createUrl(secondCurrencyToLowerCase, firstCurrencyToLowerCase),
		];
	};

	const groupCurrencies = (currencies) => {
		return currencies.reduce(
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
	};

	const longestArray = (currencies) => {
		if (currencies.length === 0) {
			return 0;
		}

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

	return { createLIElement, prepareUrls, groupCurrencies, longestArray };
})();
