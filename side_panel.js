import { createEdgeWithLabel, createNode, findNodeByProperty } from './utils.js';
import { processLinkedInProfile } from './content-processors/processLinkedInProfile.js';
import { processImdbProfile } from './content-processors/processImdbProfile.js';
import { processOciProfile } from './content-processors/processOciProfile.js';
import { processGoodreadsProfile } from './content-processors/processGoodreadsProfile.js';
import { processWikipediaProfile } from './content-processors/processWikipediaProfile.js';
import { processSpotifyProfile } from './content-processors/processSpotifyProfile.js';

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === 'linkInfo') {
//     const contentDiv = document.getElementById('content');
//     contentDiv.textContent = `
//         Link Text: ${message.linkText}
//         Title: ${message.title}
//         Source URL: ${message.sourceUrl}
//         Link Href: ${message.href}
//         Element ID: ${message.id}
//       `;
//   }
// });

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
      initializeScrapeConfiguration()

    });
})


let cy

document.addEventListener("cyInitialized", (event) => {
  cy = event.detail;
  console.log("Cytoscape instance injected into the module!", cy);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.type === 'linkedInProfile') {
    processLinkedInProfile(cy, message);
  }
  if (message.type === 'imdbProfile') {
    processImdbProfile(cy, message);
  }
  if (message.type === 'ociProfile') {
    processOciProfile(cy, message);
  }
  if (message.type === 'goodreadsProfile') {
    processGoodreadsProfile(cy, message);
  }
  if (message.type === 'wikipediaProfile') {
    processWikipediaProfile(cy, message);
  }
  if (message.type === 'spotifyProfile') {
    processSpotifyProfile(cy, message);
  }

  if (message.type === 'linkInfoForNetworkNavigator') {
    console.log("Received linkInfoForNetwork message:", message);
    addLink(cy, {
      targetUrl: message.href,
      targetLabel: message.linkText,
      sourceUrl: message.sourceUrl,
      sourceTitle: message.title

    })

    const contentDiv = document.getElementById('content');
    if (contentDiv) {
      contentDiv.textContent = `
        Link Text: ${message.linkText}
        Title: ${message.title}
        Source URL: ${message.sourceUrl}
        Link Href: ${message.href}
        Element ID: ${message.id}
      `;
    }
  }
});



const addLink = (cy, link) => {
  let newNodes = cy.collection();
  const { targetUrl, targetLabel, sourceUrl, sourceTitle } = link;
  let sourceNode = findNodeByProperty(cy, 'url', sourceUrl);
  if (!sourceNode) {
    sourceNode = createNode(cy, sourceTitle);
    sourceNode.data('url', sourceUrl);
    sourceNode.data('type', 'webpage');
    newNodes = newNodes.add(sourceNode);
  }

  let targetNode = findNodeByProperty(cy, 'url', targetUrl);
  if (!targetNode) {
    targetNode = createNode(cy, targetLabel);
    targetNode.data('url', targetUrl);
    targetNode.data('type', 'webpage');
    newNodes = newNodes.add(targetNode);
  }
  // add edge for hyperlink
  const edge = createEdgeWithLabel(cy, sourceNode, targetNode, targetLabel, true)
  //  edge.data('label', targetLabel);
  edge.data('type', 'hyperlink');

  // run layout for new nodes
  newNodes.layout({
    name: 'random',
    animate: true,
    animateFilter: function (node, i) {
      return true;
    },
    animationDuration: 1000,
    animationEasing: undefined,
    fit: true,
  })
    .run();

};

let contentScrapeConfigurationButton
const initializeScrapeConfiguration = () => {
  // find button contentScrapeConfigurationButton
  contentScrapeConfigurationButton = document.getElementById("contentScrapeConfigurationButton")

  document.addEventListener('click', (event) => {
    // TODO if click is not on panel then
    const panel = document.getElementById("scrapeConfigurationPanel")

    if (!panel.contains(event.target) && !contentScrapeConfigurationButton.contains(event.target)) hideScrapeConfigurationPanel()
  })
  if (contentScrapeConfigurationButton) {
    contentScrapeConfigurationButton.style.display = "block"
    contentScrapeConfigurationButton.addEventListener('click', () => openScrapeConfigurationPanel(cy))
  }


  const select = document.getElementById("selectContentScraper")
  select.addEventListener("change", function () {
    console.log("Selected:", this.value);
  });
}

const openScrapeConfigurationPanel = (cy) => {
  const panel = document.getElementById("scrapeConfigurationPanel")
  panel.style.display = "block"
}

const hideScrapeConfigurationPanel = (cy) => {

  const panel = document.getElementById("scrapeConfigurationPanel")
  panel.style.display = "none"


}


