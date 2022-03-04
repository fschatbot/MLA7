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
		.then(() => alert("Citation Generated!"))
		.catch((error) => {
			console.log(error);
			console.log(Object.keys(error));
			console.log(error.status);
			alert("Error!\n" + error.message);
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
	SaveCitation({ author, title, titleShort, publisher, issued, accessed, URL });
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
	citation = { ...citation };
	let citations = JSON.parse(localStorage.getItem("citations")) || [];
	// Convert the dates into numbers
	// Some kind of error to be fixed here
	// citation.issued = new Date(dateToString(citation.issued)).getTime();
	// citation.accessed = new Date(dateToString(citation.accessed)).getTime();
	citations.push(citation);
	localStorage.setItem("citations", JSON.stringify(citations));
}

/*
 * This function takes a date array and returns a string
 * @param {array} date
 * @return {string}
 */
function dateToString(date) {
	let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	if (!isNaN(date) && typeof date == typeof 2) {
		date = new Date(date);
		return `${date.getDate()} ${months[date.getMonth()]}. ${date.getFullYear()}`;
	}
	if (date[0].length == 0) return "";
	else date = date[0];
	// The magic happens here
	let year = date[0],
		month = date[1],
		day = date[2];
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
	if (url.length == 0 || !url || !/https?:\/\/(www.)?/.test(url)) return;
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
	// Creating Elements
	let div = document.createElement("div");
	let span = document.createElement("span");
	let button = document.createElement("button");
	// Adding Classes and Attributes
	div.classList.add("citation");
	button.classList.add("delete");
	span.innerText = DataToCitation(citation);
	// Heroicons: trash-outline
	button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>`;
	// Appending Elements
	div.appendChild(span);
	div.appendChild(button);
	document.getElementById("previous-citation").appendChild(div);
	// Adding Eevent Listener
	span.addEventListener(
		"click",
		DoubleClickListner(() => {
			navigator.clipboard.writeText(div.textContent);
			alert("Citation Copied!");
		})
	);
	button.addEventListener("click", () => {
		let index = citations.indexOf(citation);
		citations.splice(index, 1);
		localStorage.setItem("citations", JSON.stringify(citations));
		div.remove();
	});

	// Final Structure
	/*
	<div class="citation" event={copy}>
		<span> ${text} </span>
		<button class="delete" event={delete citation}>
			<svg class="icon" viewBox="0 0 24 24">...</svg>
		</button>
	</div>
	*/
});

if (JSON.stringify(citations) === JSON.stringify([])) document.querySelector("#previous-citation").style.display = "none";

// Answer from https://stackoverflow.com/a/46812691/13703806
/*
 * Lets you listen for double click on an element
 * @param {function} callback This will be called when the element is double clicked
 * @param {number} click_delay This is the maximum amount of time between clicks
 * @return {function} This function returns the listener
 */
function DoubleClickListner(callback, click_delay = 300) {
	let clicks = 0,
		timeout;
	return function () {
		clicks++;
		if (clicks === 1) {
			// Make sure to listen for another click in 500ms
			timeout = setTimeout(() => (clicks = 0), click_delay);
		} else {
			clearTimeout(timeout);
			callback.apply(this, arguments);
			clicks = 0;
		}
	};
}

/*
 * This function is an replacement for the builtin alert function
 * @param {string} text
 * @return {void}
 */
function alert(string) {
	let NotificationCont = document.getElementById("notification-container");
	let NotificationElem = document.getElementById("Notification-Template").content.cloneNode(true);

	NotificationElem.querySelector("[notification-text]").textContent = string;
	let d = Date.now() * Math.random();
	NotificationElem.querySelector("[notification-text]").setAttribute("_KEY_", d);
	NotificationCont.appendChild(NotificationElem);
	// Replace the document-fragment with proper node
	NotificationElem = NotificationCont.querySelector(`[_KEY_="${d}"]`).parentElement;
	NotificationElem.removeAttribute("_KEY_");

	// Remove the notification after 5 seconds
	setTimeout(() => {
		NotificationElem.classList.add("SlideOut");
		setTimeout(() => NotificationElem.remove(), 500);
	}, 5000);
}
