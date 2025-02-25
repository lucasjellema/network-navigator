export const initializeSpotifyScrapeConfiguration = () => {
    //    oninput="document.getElementById('book-rating-value').innerText = this.value;"
    fetch("spotifyPanel.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("spotifyConfig").innerHTML = data;

            // The DOMContentLoaded event fires when the initial HTML document has been completely parsed, but it does not wait for external resources like images, stylesheets, or scripts fetched asynchronously (e.g., via fetch()).

            // Why is DOMContentLoaded not enough for fetch()?
            // DOMContentLoaded fires when the HTML is parsed but before fetch() completes.
            // The fetch() request is asynchronous, so the external HTML content is loaded after DOMContentLoaded.
            // Instead of relying on DOMContentLoaded, you should ensure the content is fully loaded before using it.
            console.log("Content loaded: for spotifyPanel");


   
        })
}

export const prepareSpotifyPanelFromScrapeConfiguration = (scrapeConfiguration) => {

}

export const addSpotifyScrapeConfiguration = (scrapeConfiguration) => {

    scrapeConfiguration.spotify = {
    }

}
