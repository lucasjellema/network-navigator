import { initializeCytoscape } from './graph.js';

document.addEventListener('DOMContentLoaded', function () {
    fetch("network-navigator.html")
      .then(response => response.text())
      .then(data => {
        document.getElementById("network-navigator-app").innerHTML = data;
    
        // The DOMContentLoaded event fires when the initial HTML document has been completely parsed, but it does not wait for external resources like images, stylesheets, or scripts fetched asynchronously (e.g., via fetch()).
    
    // Why is DOMContentLoaded not enough for fetch()?
    // DOMContentLoaded fires when the HTML is parsed but before fetch() completes.
    // The fetch() request is asynchronous, so the external HTML content is loaded after DOMContentLoaded.
    // Instead of relying on DOMContentLoaded, you should ensure the content is fully loaded before using it.
        console.log("Content loaded:");
        // Fire a custom event to notify that content has been loaded
        document.dispatchEvent(new Event("networkNavigatorContentLoaded"));
        
      });
    })
    