chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "linkInfoForNetwork",
    title: "Add Link to Network Navigator",
    contexts: ["link"]
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
});


chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "togglePageType") {
    if (message.contentExtension === "linkedin") {

      chrome.contextMenus.update("linkedInInfoForNetwork", {
        visible: message.personPage || message.companyPage,
        title: message.personPage ? "Add LinkedIn Person Details to Network Navigator" : "Add LinkedIn Company Details to Network Navigator"
      });
    }
    if (message.contentExtension === "imdb") {

      chrome.contextMenus.update("imdbInfoForNetwork", {
        visible: message.namePage || message.titlePage,
        title: message.namePage ? "Add IMDB Person Details to Network Navigator" : "Add IMBD Title Details to Network Navigator"
      });
    }
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "linkInfoForNetwork") {
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
});

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
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'linkInfoRequestForNetwork', href: info.linkUrl });
    console.log(response);
    // publish link details for use in side_panel.js
    chrome.runtime.sendMessage({
      type: 'linkInfo',
      linkText: response.link.linkText,
      title: response.link.title,
      sourceUrl: response.link.sourceUrl,
      href: response.link.href,
      id: response.link.id || null
    });

  })();
}
