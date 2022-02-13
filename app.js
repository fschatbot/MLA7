/*
 * The Function Simply makes a request to the API and returns the response
 * @param {string} url
 * @return {promise}
 */
function fetchData(url) {
	// API URL Usage: https://autocite.citation-api.com/api/v3/query?url={URL}
	return fetch("https://autocite.citation-api.com/api/v3/query?url=" + url)
		.then((response) => {
			if (response.status == 200) return response.json();
			else throw new Error("Bad API response! Status: " + response.status);
		})
		.then(JSONTOMLA7)
		.then(DataToCitation)
		.then(ShowText)
		.catch((error) => {
			console.log(error);
			console.log(Object.keys(error));
			console.log(error.status);

			ShowText(error.status + error.message);
		});
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
	citation_data = { author, title, titleShort, publisher, issued, accessed, URL };
	SaveCitation(citation_data);
	return citation_data;
}

/*
 * This functions simply converts the given data to a citation string
 * @param {string} author
 * @param {string} title
 * @param {string} titleShort
 * @param {string} publisher
 * @param {string} issued
 * @param {string} accessed
 * @param {string} URL
 * @return {void}
 */
function DataToCitation({ author, title, titleShort, publisher, issued, accessed, URL }) {
	issued = dateToString(issued);
	accessed = dateToString(accessed);
	let string = "";
	if (author) string += `${author}. `;
	if (title) string += `"${title}" `;
	if (titleShort) string += `${titleShort}. `;
	else string += `. `;
	if (publisher) string += ` ${publisher}, `;
	if (issued) string += `${issued}. `;
	if (accessed) string += `Web ${accessed}. `;
	if (URL) string += `\n<${URL}>`;
	return string;
}

/*
 * This function saves the citation in the local storage
 * @param {object} citation
 * @return {void}
 */
function SaveCitation(citation) {
	let citations = JSON.parse(localStorage.getItem("citations")) || [];
	citations.push(citation);
	localStorage.setItem("citations", JSON.stringify(citations));
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
 * This function simply displays the given text in the DOM
 * @param {string} text
 * @return {void}
 */
function ShowText(text) {
	document.getElementById("citation").value = text;
	resizeTextarea();
}

/*
 * Handle the click event on the button
 * @param {event} event
 */
function handleClick(event) {
	const url = document.getElementById("url").value;
	if (url.length == 0 || !url || /https?:\/\/(www.)?/.test(url)) return;
	ShowText("Loading...");
	fetchData(url);
}

document.getElementById("btn").addEventListener("click", handleClick);

document.getElementById("copy").addEventListener("click", () => {
	/* document.getElementById('copyArea').select();
    document.execCommand('copy'); */
	let copyArea = document.getElementById("citation");
	navigator.clipboard.writeText(copyArea.value);
});

/*
 * This function increases the textarea height based on the content
 * @return {void}
 */
function resizeTextarea() {
	const textarea = document.getElementById("citation");
	textarea.style.height = "10px";
	textarea.style.height = `${textarea.scrollHeight + 10}px`;
}

// Add all the previous citations to a box
let citations = JSON.parse(localStorage.getItem("citations")) || [];
citations.forEach((citation) => {
	let div = document.createElement("div");
	div.textContent = DataToCitation(citation);
	document.getElementById("previous-citation").appendChild(div);
});
