export const initializeImdbScrapeConfiguration = () => {
    //    oninput="document.getElementById('book-rating-value').innerText = this.value;"
    fetch("imdbPanel.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("imdbConfig").innerHTML = data;

            // The DOMContentLoaded event fires when the initial HTML document has been completely parsed, but it does not wait for external resources like images, stylesheets, or scripts fetched asynchronously (e.g., via fetch()).

            // Why is DOMContentLoaded not enough for fetch()?
            // DOMContentLoaded fires when the HTML is parsed but before fetch() completes.
            // The fetch() request is asynchronous, so the external HTML content is loaded after DOMContentLoaded.
            // Instead of relying on DOMContentLoaded, you should ensure the content is fully loaded before using it.
            console.log("Content loaded: for imdbPanel");



        })
}

export const prepareImdbPanelFromScrapeConfiguration = (scrapeConfiguration) => {
    const person = document.querySelector('input[name="person"][value="' + (scrapeConfiguration.imdb?.person ?? "update") + '"]');
    if (person) {
        person.checked = true;
    }
    const cast = document.querySelector('input[name="cast"][value="' + (scrapeConfiguration.imdb?.cast ?? "update") + '"]');
    if (cast) {
        cast.checked = true;
    }
    const castLimit = document.getElementById("cast-limit");
    castLimit.value = scrapeConfiguration.imdb?.castLimit;

    const moreLikeThis = document.querySelector('input[name="more-like-this"][value="' + (scrapeConfiguration.imdb?.person ?? "update") + '"]');
    if (moreLikeThis) {
        moreLikeThis.checked = true;
    }

    const moreLikeThisLimit = document.getElementById("more-like-this-limit");
    moreLikeThisLimit.value = scrapeConfiguration.imdb?.moreLikeThisLimit;

    const moreLikeThisRating = document.getElementById("more-like-this-rating-limit");
    moreLikeThisRating.value = scrapeConfiguration.imdb?.moreLikeThisRating;

    const chips = document.querySelector('input[name="chips"][value="' + (scrapeConfiguration.imdb?.person ?? "update") + '"]');
    if (chips) {
        chips.checked = true;
    }

    const stars = document.querySelector('input[name="stars"][value="' + (scrapeConfiguration.imdb?.person ?? "update") + '"]');
    if (stars) {
        stars.checked = true;
    }

    const starsLimit = document.getElementById("stars-limit");
    starsLimit.value = scrapeConfiguration.imdb?.starsLimit;

    const directors = document.querySelector('input[name="directors"][value="' + (scrapeConfiguration.imdb?.person ?? "update") + '"]');
    if (directors) {
        directors.checked = true;
    }
    const directorsLimit = document.getElementById("directors-limit");
    directorsLimit.value = scrapeConfiguration.imdb?.directorsLimit;

    const creators = document.querySelector('input[name="creators"][value="' + (scrapeConfiguration.imdb?.person ?? "update") + '"]');
    if (creators) {
        creators.checked = true;
    }
    const creatorsLimit = document.getElementById("creators-limit");
    creatorsLimit.value = scrapeConfiguration.imdb?.creatorsLimit;

    const writers = document.querySelector('input[name="writers"][value="' + (scrapeConfiguration.imdb?.person ?? "update") + '"]');
    if (writers) {
        writers.checked = true;
    }

    const writersLimit = document.getElementById("writers-limit");
    writersLimit.value = scrapeConfiguration.imdb?.writersLimit;
    const knownFor = document.querySelector('input[name="known-for"][value="' + (scrapeConfiguration.imdb?.person ?? "update") + '"]');
    if (knownFor) {
        knownFor.checked = true;
    }

    const knownForLimit = document.getElementById("known-for-limit");
    knownForLimit.value = scrapeConfiguration.imdb?.knownForLimit;
    const knownForRatingLimit = document.getElementById("known-for-rating-limit");
    knownForRatingLimit.value = scrapeConfiguration.imdb?.knownForRatingLimit;
    const knownForStartyear = document.getElementById("known-for-startyear");
    knownForStartyear.value = scrapeConfiguration.imdb?.knownForStartyear;

    const portfolio = document.querySelector('input[name="portfolio"][value="' + (scrapeConfiguration.imdb?.person ?? "update") + '"]');
    if (portfolio) {
        portfolio.checked = true;
    }

    const portfolioLimit = document.getElementById("portfolio-limit");
    portfolioLimit.value = scrapeConfiguration.imdb?.portfolioLimit;
    const portfolioRatingLimit = document.getElementById("portfolio-rating-limit");
    portfolioRatingLimit.value = scrapeConfiguration.imdb?.portfolioRatingLimit;
    const portfolioStartyear = document.getElementById("portfolio-startyear");
    portfolioStartyear.value = scrapeConfiguration.imdb?.portfolioStartyear;



    const title = document.querySelector('input[name="title"][value="' + (scrapeConfiguration.imdb?.person ?? "update") + '"]');
    if (title) {
        title.checked = true;
    }


}

export const addImdbScrapeConfiguration = (scrapeConfiguration) => {
    const title = document.querySelector('input[name="title"]:checked').value;
    const cast = document.querySelector('input[name="cast"]:checked').value;
    const castLimit = document.getElementById("cast-limit").value;
    const moreLikeThis = document.querySelector('input[name="more-like-this"]:checked').value;
    const moreLikeThisLimit = document.getElementById("more-like-this-limit").value;
    const moreLikeThisRating = document.getElementById("more-like-this-rating-limit").value;
    const chips = document.querySelector('input[name="chips"]:checked').value;

    const stars = document.querySelector('input[name="stars"]:checked').value;
    const starsLimit = document.getElementById("stars-limit").value;

    const directors = document.querySelector('input[name="directors"]:checked').value;
    const directorsLimit = document.getElementById("directors-limit").value;
    const creators = document.querySelector('input[name="creators"]:checked').value;
    const creatorsLimit = document.getElementById("creators-limit").value;
    const writers = document.querySelector('input[name="writers"]:checked').value;
    const writersLimit = document.getElementById("writers-limit").value;



    const person = document.querySelector('input[name="person"]:checked').value;
    const knownFor = document.querySelector('input[name="known-for"]:checked').value;
    const knownForLimit = document.getElementById("known-for-limit").value;
    const knownForRatingLimit = document.getElementById("known-for-rating-limit").value;
    const knownForStartyear = document.getElementById("known-for-startyear").value;
    const portfolio = document.querySelector('input[name="portfolio"]:checked').value;
    const portfolioLimit = document.getElementById("portfolio-limit").value;
    const portfolioRatingLimit = document.getElementById("portfolio-rating-limit").value;
    const portfolioStartyear = document.getElementById("portfolio-startyear").value;


    scrapeConfiguration.imdb = {
        title,
        cast, castLimit, moreLikeThis, moreLikeThisLimit, moreLikeThisRating
        , chips,
        stars, starsLimit, directors, directorsLimit, creators, creatorsLimit
        , writers, writersLimit,
        person, knownFor, knownForLimit, knownForRatingLimit
        , knownForStartyear, portfolio, portfolioLimit, portfolioRatingLimit
        , portfolioStartyear
    }

}
