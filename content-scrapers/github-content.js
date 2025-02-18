chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.type === 'githubRequestForNetwork') {
    console.log("Networkl Navigator GiHub Info request received: ");
    let profile = getGitHubProfile(message.linkUrl);
    console.log("Profile:", profile)
    sendResponse({ status: 'success', data: profile, pageUrl: window.location.href });
  }
});

console.log('github-content.js loaded - Network Navigator extension is active');

const getGitHubProfile = () => {


  const profile = {}

  profile.pageTitle = document.title;
  profile.pageUrl = window.location.href;

  //find DIV element with id repository-container-header
  const div = document.getElementById("repository-container-header")
  // find strong with itemprop="name"
  const strongElement = div.querySelector(`strong[itemprop="name"]`);
  profile.repositoryName = strongElement.textContent.replace(/\n/g, '').trim()

  const aboutParentDiv = document.querySelector('.Layout-sidebar') //
  console.log(aboutParentDiv)
  // find h2 with textcontent == "About"
  const allH2 = aboutParentDiv.querySelectorAll('h2')
  for (const h2 of allH2) {
    if (h2.textContent == "About") {
      console.log("found right h2")
      // actual about is next sibling
      const aboutP = h2.nextElementSibling
      console.log(aboutP)
      profile.about = aboutP.textContent.replace(/\n/g, '').trim()

      // iterate through parent's children

      for (const child of h2.parentElement.children) {
        console.log("findDirectDivChildrenOfFirstDiv.",  child.tagName,child.textContent)
        if (child.tagName === 'H3' && child.textContent === 'Stars') {
          const numberOfStarsStrong = child.nextElementSibling.querySelector('strong')
          profile.stars = numberOfStarsStrong.textContent
        }
        if (child.tagName === 'H3' && child.textContent === 'Watchers') {
          const numberOfWatchersStrong = child.nextElementSibling.querySelector('strong')
          profile.watchers = numberOfWatchersStrong.textContent
        }
        if (child.tagName === 'H3' && child.textContent === 'Forks') {
          const numberOfForksStrong = child.nextElementSibling.querySelector('strong')
          profile.forks = numberOfForksStrong.textContent
        }
      }
      break;
    }
  }



  // // find first h1 element
  // const h1Element = document.querySelector('h1');
  // if (h1Element) {
  //   profile.pageHeader = h1Element.innerText || h1Element.textContent;
  // }

  // if (scope == "link") {
  //   profile.linkUrl = window.location.href;
  //   profile.selectionText = window.getSelection().toString();
  //   const linkInfo = getLinkInfo(linkUrl);
  //   if (linkInfo) {
  //     profile.linkText = linkInfo.linkText;
  //     profile.href = linkInfo.href;
  //   }
  // }
  // if (scope == "image") {
  //   profile.imageSrc = imageSrc
  //   // find alt text for image
  //   const imageElement = document.querySelector(`img[src="${imageSrc}"]`);
  //   if (imageElement) {
  //     profile.altText = imageElement.alt;
  //   }
  // }

  return profile
}

