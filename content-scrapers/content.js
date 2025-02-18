chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.type === 'linkInfoRequest') {
    if (message.href) {
      console.log("Link received: ", message.href);
      const link = getLinkInfo(message.href);
      sendResponse({ status: 'success', link });
    }
    else {
      sendResponse({ status: 'error', message });
    }
  }
});
console.log('content.js loaded - context-menu-clipboard extension');

function getLinkInfo(linkUrl) {
  console.log(`inside console.js `, linkUrl)

  let theLink
  const links = document.querySelectorAll(`a`);
  // print href for every link
  for (let i = 0; i < links.length; i++) {
    //    console.log(links[i].href);
    if (links[i].href == linkUrl) {
      console.log("Link found as global link: ", linkUrl);
      theLink = links[i];
      break;
    }
  }
  if (!theLink) {
    const linkUrlWithoutSource = linkUrl.replace(window.location.href, '');


    for (let i = 0; i < links.length; i++) {
      //    console.log(links[i].href);
      if (links[i].href == linkUrlWithoutSource) {
        console.log("Link found as local link: ", linkUrlWithoutSource);
        theLink = links[i];
        break;
      }
    }
  }

  if (theLink) {
    const linkElement = theLink;
    const linkText = linkElement.innerText || linkElement.textContent;
    const pageTitle = document.title;
    const sourceUrl = window.location.href;
    const id = linkElement.id;
    return {
      linkText: linkText,
      linkUrl: linkUrl,
      title: pageTitle,
      sourceUrl: sourceUrl,
      href: linkUrl,
      id: id
    };
  }


  return { linkUrl: "ELEMENT NOT FOUND" };
}
