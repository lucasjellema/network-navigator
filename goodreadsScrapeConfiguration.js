export const initializeGoodreadsScrapeConfiguration = () => {
    //    oninput="document.getElementById('book-rating-value').innerText = this.value;"
    fetch("goodreadsPanel.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("goodreadsConfig").innerHTML = data;

            // The DOMContentLoaded event fires when the initial HTML document has been completely parsed, but it does not wait for external resources like images, stylesheets, or scripts fetched asynchronously (e.g., via fetch()).

            // Why is DOMContentLoaded not enough for fetch()?
            // DOMContentLoaded fires when the HTML is parsed but before fetch() completes.
            // The fetch() request is asynchronous, so the external HTML content is loaded after DOMContentLoaded.
            // Instead of relying on DOMContentLoaded, you should ensure the content is fully loaded before using it.
            console.log("Content loaded: for goodreadsPanel");


            const bookRating = document.getElementById("book-rating");
            const bookRatingValue = document.getElementById("book-rating-value");
            if (bookRating) {
                bookRating.addEventListener("input", (event) => {
                    if (bookRatingValue) bookRatingValue.innerText = bookRating.value
                })
            }
        })
}

export const prepareGoodreadsPanelFromScrapeConfiguration = (scrapeConfiguration) => {
    // set checked value in radio group author based on scrapeConfiguration.goodreads.author
    const author = document.querySelector('input[name="author"][value="' + scrapeConfiguration.goodreads?.author ?? "update" + '"]');
    if (author) {
        author.checked = true;
    }

    // set checked value in radio group books based on scrapeConfiguration.goodreads.books
    const books = document.querySelector('input[name="books"][value="' + scrapeConfiguration.goodreads?.books ?? "update" + '"]');
    if (books) {
        books.checked = true;
    }

    const bookRating = document.getElementById("book-rating");
    bookRating.value = scrapeConfiguration.goodreads?.bookRating;
    // set value for bookLimit
    const bookLimit = document.getElementById("book-limit");
    bookLimit.value = scrapeConfiguration.goodreads?.bookLimit;



    // set value for similarLimit
    const similarLimit = document.getElementById("similar-limit");
    similarLimit.value = scrapeConfiguration.goodreads?.similarLimit;
    // set value for similarLimit
    const similarRating = document.getElementById("similar-rating");
    similarRating.value = scrapeConfiguration.goodreads?.similarRating;

}

export const addGoodreadsScrapeConfiguration = (scrapeConfiguration) => {

    const author = document.querySelector('input[name="author"]:checked').value;
    // read value set in radio group books 
    const books = document.querySelector('input[name="books"]:checked').value;
    const bookRating = document.getElementById("book-rating").value;
    // get value from input book-limit
    const bookLimit = document.getElementById("book-limit").value;


    const book = document.querySelector('input[name="book"]:checked').value;
    const bookAuthor = document.querySelector('input[name="book-author"]:checked').value;
    const genres = document.querySelector('input[name="genres"]:checked').value;
    const setting = document.querySelector('input[name="setting"]:checked').value;

    const characters = document.querySelector('input[name="characters"]:checked').value;
    const similarBooks = document.querySelector('input[name="similar-books"]:checked').value;
    const similarLimit = document.getElementById("similar-limit").value;
    const similarRating = document.getElementById("similar-rating").value;


    scrapeConfiguration.goodreads = {
        author: author,
        books: books,
        bookRating: bookRating,
        bookLimit: bookLimit,
        book: book,
        bookAuthor: bookAuthor,
        genres: genres,
        setting: setting,
        characters: characters,
        similarBooks: similarBooks,
        similarLimit: similarLimit,
        similarRating: similarRating
    }

}
