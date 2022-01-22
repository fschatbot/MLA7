/*
 * The Function Simply makes a request to the API and returns the response
 * @param {string} url
 * @return {promise}
 */
function fetchData(url) {
	// API URL Usage: https://autocite.citation-api.com/api/v3/query?url={URL}
	return fetch("https://autocite.citation-api.com/api/v3/query?url=" + url)
		.then((response) => response.json())
		.then(JSONTOMLA7)
		.then(displayData);
}

/*
 * This function simply takes the given data and extracts the needed information
 * @param {object} data
 * @return {void}
 */

function JSONTOMLA7(data) {
	let csl = data.results[0].csl;
	let author = csl.author.length ? csl.author[0].family : "",
		title = csl.title,
		titleShort = csl["title-short"],
		publisher = csl.publisher,
		issued = csl.issued["date-parts"] ? csl.issued["date-parts"] : "",
		accessed = csl.accessed["date-parts"] ? csl.accessed["date-parts"] : "",
		URL = csl.URL;
	return { author, title, titleShort, publisher, issued, accessed, URL };
}

/*
 * This functions simply displays the given data in the DOM
 * @param {string} author
 * @param {string} title
 * @param {string} titleShort
 * @param {string} publisher
 * @param {string} issued
 * @param {string} accessed
 * @param {string} URL
 * @return {void}
 */
function displayData({ author, title, titleShort, publisher, issued, accessed, URL }) {
	let data = document.getElementById("citation");
	issued = dateToString(issued);
	accessed = dateToString(accessed);
	let string = "";
	if (author) string += `${author}. `;
	if (title) string += `"${title}" `;
	if (titleShort) string += `${titleShort}.`;
	else string += `. `;
	if (publisher) string += ` ${publisher}, `;
	if (issued) string += `${issued}. `;
	if (accessed) string += `Web ${accessed}. `;
	if (URL) string += `\n<${URL}>`;
	data.value = string;
}

/*
 * This function takes a date array and returns a string
 * @param {array} date
 * @return {string}
 */
function dateToString(date) {
	if (date[0].length == 0) return "";
	else date = date[0];
	// The magic happens here
	let year = date[0],
		month = date[1],
		day = date[2];
	let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	return `${day} ${months[Number(month) - 1]}. ${year}`;
}

/*
 * Handle the click event on the button
 * @param {event} event
 */
function handleClick(event) {
	// Get the URL from the input
	const url = document.getElementById("url").value;
	// Check if the URL is valid using regex
	if (url.length == 0) return;
	// Made the request and handle it
	fetchData(url);
}

document.getElementById("btn").addEventListener("click", handleClick);

document.getElementById("copy").addEventListener("click", () => {
	/* document.getElementById('copyArea').select();
    document.execCommand('copy'); */
	let copyArea = document.getElementById("citation");
	navigator.clipboard.writeText(copyArea.value);
});
