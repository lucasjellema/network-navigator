chrome.runtime.onInstalled.addListener(() => {
console.log('background.js Network Navigator loaded - go set up context Menu');
  chrome.contextMenus.create({
    id: "linkInfoForNetworkNavigator",
    title: "Add Page, Link & Linked Page to Network Navigator",
    contexts: ["link"]
  });
  chrome.contextMenus.create({
    id: "googleMapsInfoForNetwork",
    title: "Make Web Memo for Google Maps Location",
    documentUrlPatterns: ["https://www.google.com/maps/*"]
  });
  chrome.contextMenus.create({
    id: "linkedInInfoForNetwork",
    title: "Add LinkedIn Details to Network Navigator",
    contexts: ["page"],
    documentUrlPatterns: ["*://www.linkedin.com/*"]
  });
  chrome.contextMenus.create({
    id: "imdbInfoForNetwork",
    title: "Add IMDb Details to Network Navigator",
    contexts: ["page"],
    documentUrlPatterns: ["*://www.imdb.com/*"]
  });
  chrome.contextMenus.create({
    id: "ociInfoForNetwork",
    title: "Add OCI Details to Network Navigator",
    contexts: ["page"],
    documentUrlPatterns: ["*://cloud.oracle.com/*"]
  });
  chrome.contextMenus.create({
    id: "githubInfoForNetwork",
    title: "Make Network Navigator entry for GitHub Repository",
    documentUrlPatterns: ["*://github.com/*"]
  });
  chrome.contextMenus.create({
    id: "goodreadsInfoForNetwork",
    title: "Add Goodreads Book Details to Network Navigator",
    documentUrlPatterns: ["*://www.goodreads.com/*"]
  });
  chrome.contextMenus.create({
    id: "spotifyInfoForNetwork",
    title: "Add Spotify Song to Network Navigator",
    documentUrlPatterns: ["*://open.spotify.com/*"]
  });
  chrome.contextMenus.create({
    id: "wikipediaInfoForNetwork",
    title: "Add Wikipedia Page to Network Navigator",
    documentUrlPatterns: ["*://en.wikipedia.org/*"]
  });

});


// chrome.runtime.onMessage.addListener((message, sender) => {
//   console.log("Received message:", message);
//   if (message.action === "togglePageType") {
//     if (message.contentExtension === "linkedin") {

//       chrome.contextMenus.update("linkedInInfoForNetwork", {
//         visible: message.personPage || message.companyPage,
//         title: message.personPage ? "Add LinkedIn Person Details to Network Navigator" : "Add LinkedIn Company Details to Network Navigator"
//       });
//     }
//     if (message.contentExtension === "imdb") {

//       chrome.contextMenus.update("imdbInfoForNetwork", {
//         visible: message.namePage || message.titlePage,
//         title: message.namePage ? "Add IMDB Person Details to Network Navigator" : "Add IMBD Title Details to Network Navigator"
//       });
//     }
//   }
// });

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "linkInfoForNetworkNavigator") {
    await handleLinkInfo(info, tab);
  }
  if (info.menuItemId === "linkedInInfoForNetwork") {
    await handleLinkedInInfo(info, tab);
  }
  if (info.menuItemId === "ociInfoForNetwork") {
    await handleOCIInfo(info, tab);
  }
  if (info.menuItemId === "imdbInfoForNetwork") {
    await handleImdbInfo(info, tab);
  }
  if (info.menuItemId === "googleMapsInfoForNetwork") {
    await handleGoogleMapsInfo(info, tab);
  }
  if (info.menuItemId === "githubInfoForNetwork") {
    await handleGitHubInfo(info, tab);
  }
  if (info.menuItemId === "goodreadsInfoForNetwork") {
    await handleGoodreadsInfo(info, tab);
  }
  if (info.menuItemId === "spotifyInfoForNetwork") {
    await handleSpotifyInfo(info, tab);
  }
  if (info.menuItemId === "wikipediaInfoForNetwork") {
    await handleWikipediaInfo(info, tab);
  }
});

async function handleGoogleMapsInfo(info, tab) {
  console.log('linkedIn person info clicked ', info);
  //await chrome.sidePanel.open({ tabId: tab.id });
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'googlemapsInfoRequestForNetwork' });
    console.log(response);
    chrome.runtime.sendMessage({
      type: 'googlemapsProfile',
      profile: response.data,
      googlemapsUrl: response.pageUrl
    });
  })()
}
async function handleLinkedInInfo(info, tab) {
  console.log('linkedIn person info clicked ', info);
  //await chrome.sidePanel.open({ tabId: tab.id });
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'linkedInInfoRequestForNetwork' });
    console.log(response);
    chrome.runtime.sendMessage({
      type: 'linkedInProfile',
      profile: response.data,
      linkedInUrl: response.linkedInUrl
    });
  })()
}

async function handleOCIInfo(info, tab) {
  console.log('OCI info clicked ', info);
  //await chrome.sidePanel.open({ tabId: tab.id });
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'ociInfoRequest' });
    console.log(response);
    chrome.runtime.sendMessage({
      type: 'ociProfile',
      profile: response.data,
      ociUrl: response.ociUrl
    });
  })()
}


async function handleImdbInfo(info, tab) {
  console.log('imdb info clicked ', info);
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'imdbInfoRequestForNetwork' });
    console.log(response);
    chrome.runtime.sendMessage({
      type: 'imdbProfile',
      profile: response.data,
      imdbUrl: response.imdbUrl
    });
  })()
}


async function handleLinkInfo(info, tab) {
  console.log('link info clicked ', info);
  //await chrome.sidePanel.open({ tabId: tab.id });

  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'linkInfoRequestForNetworkNavigator', href: info.linkUrl });
    console.log(response);
    // publish link details for use in side_panel.js
    chrome.runtime.sendMessage({
      type: 'linkInfoForNetworkNavigator',
      linkText: response.link.linkText,
      title: response.link.title,
      sourceUrl: response.link.sourceUrl,
      href: response.link.href,
      id: response.link.id || null
    });

  })();
}



async function handleGitHubInfo(info, tab) {
  console.log('github info clicked ', info);
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'githubRequestForNetwork' });
    console.log(response);
    chrome.runtime.sendMessage({
      type: 'githubProfile',
      profile: response.data,
    });
  })()
}
async function handleGoodreadsInfo(info, tab) {
  console.log('goodreads info clicked ', info);
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    // const response = await chrome.tabs.sendMessage(tab.id, { type: 'goodreadsRequestForNetwork' });
    // The background script wraps sendMessage() in a Promise.
    // The content script properly handles async responses.
    // The return true; keeps the channel open until sendResponse() is called.
    // Now await chrome.tabs.sendMessage() will actually wait for the response. 🚀
    const goodreadsResponse = await new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, { type: 'goodreadsRequestForNetwork' }, (response) => {
        console.log('in handler', response);
        chrome.runtime.sendMessage({
          type: 'goodreadsProfile',
          profile: response.data,
        });
        resolve(response);
      });

    });
  })()
}

async function handleSpotifyInfo(info, tab) {
  console.log('spotify info clicked ', info);
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const spotifyResponse = await new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, { type: 'spotifyRequestForNetwork' }, (response) => {
        console.log('in handler', response);
        chrome.runtime.sendMessage({
          type: 'spotifyProfile',
          profile: response.data,
        });
        resolve(response);
      });
    });
  })()

}

async function handleWikipediaInfo(info, tab) {
  console.log('wikipedia info clicked ', info);
  (async () => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'wikipediaRequestForNetwork' });
    console.log(response);
    chrome.runtime.sendMessage({
      type: 'wikipediaProfile',
      profile: response.data,
    });
  })()
}

