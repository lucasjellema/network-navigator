let namePage, titlePage

const pageTypeChecker = () => {

  if (window.location.href.includes('/name/')) {
    namePage = true
  } else {

    namePage = false
  }
  if (window.location.href.includes('/title/')) {
    titlePage = true
  } else {
    titlePage = false
  }
  chrome.runtime.sendMessage({ action: "togglePageType", contentExtension: "imdb", namePage: namePage, titlePage: titlePage });
}
let lastUrl = location.href;
pageTypeChecker()

const urlChangeObserver = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    console.log("URL changed to:", location.href);
    lastUrl = location.href;
    pageTypeChecker()
    // Perform actions on URL change
  }
});

// Observe changes in the document body (for SPAs)
urlChangeObserver.observe(document.body, { childList: true, subtree: true });


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.type === 'ociInfoRequest') {
    console.log("OCI Info request received: ");
    let profile = getProfile()
    profile.type = 'ociResource'
    console.log("Profile:", profile)
    sendResponse({ status: 'success', data: profile, ociUrl: window.location.href });
  }
});

console.log('oci-content.js loaded - OCI extension');

const getProfile = () => {


  const profile = {}
  getResourceType(profile)
  return profile
}

const getResourceType = (profile) => {

  // Wait for the iframe to load
  let iframes = document.querySelectorAll("iframe");

  for (let iframe of iframes) {

    //
    try {
      let iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const breadcrumb = iframeDoc.querySelector('ul[aria-label="Breadcrumb"]');

      if (breadcrumb) {
        console.log("breadcrumb ", breadcrumb)
        profile.resourceType = breadcrumb.lastElementChild.textContent.replace(' details', '').replace(' Details', '')
        profile.ociService = breadcrumb.firstElementChild.textContent
      }

      const copyActions = iframeDoc.querySelectorAll('span[data-name="copy-action"]');
      // we need a copyAction that has a first DIV ancestor that contains OCID in the text content


      // This section of code attempts to find the OCID of the resource in the page.
      // The OCID is a unique identifier for the resource in OCI.
      // We are looking for a copyAction that has a first DIV ancestor that contains "OCID" in the text content.
      // If we find one, we extract the OCID from the text content of the first SPAN element inside the copyAction.
      // If we don't find one, we leave the profile.ocid property as undefined.
      if (copyActions) {
        for (const copyAction of copyActions) {
          console.log("copyAction ", copyAction)
          const divAncestor = copyAction.closest("div"); // Finds the closest ancestor <div>
          if (divAncestor && divAncestor.textContent.includes("OCID")) { // Checks if the text content of the ancestor <div> includes "OCID"
            const ocid = copyAction.querySelector(':scope > span').firstElementChild.textContent // Extracts the OCID from the text content of the first SPAN element inside the copyAction
            profile.ocid = ocid
            profile.subtype = ocid.split('.')[1] // Extracts the subtype from the OCID
            break; // Stops looking once we found one
          }
        }
      }
      const h1 = iframeDoc.querySelector('h1');
      if (h1) {
        console.log("h1 ", h1)
        const name = getImmediateTextContent(h1)
        profile.name = name
      }
      const span = iframeDoc.querySelector('span.compartment-path');
      if (span) {
        console.log("span ", span)
        const compartment = span.textContent
        profile.compartment = compartment
      }
      const compartmentA = iframeDoc.querySelector('a[aria-label="Compartment"]');
      if (compartmentA) {
        console.log("compartmentA", compartmentA)
        const compartment = compartmentA.textContent
        profile.compartment = compartment
        const compartmentHref = compartmentA.href
        profile.compartmentHref = compartmentHref
        if (compartmentHref) {
          const parts = compartmentHref.split('/');
          const compartmentId = parts[parts.length - 1]; // .pop() removes and returns the last element, we can achieve the same by accessing the last element
          profile.compartmentOCID = compartmentId;
        }
      }
      // find all references to other OCI resources
      const references = iframeDoc.querySelectorAll('a');
      if (references) {
        const ociResourceReferences = []
        for (let reference of references) {
          const href = reference.href
          if (href && !href.startsWith(location.href)) // not a local link 
            // if href refers to https://cloud.oracle.com/ and contains /ocid1. then this is an OCI resource reference
            if (href.startsWith('https://cloud.oracle.com/') && href.includes('/ocid1.') && !reference.textContent.includes('Skip to main content')) {
              console.log("href ", href)
              const ociResourceReference = {}
              const parts = href.split('/');
              const resourceId = parts[parts.length - 1]; // .pop() removes and returns the last element, we can achieve the same by accessing the last element
              if (resourceId.startsWith('ocid1.')) {
                ociResourceReference.ocid = resourceId.split('?')[0]
                ociResourceReference.href = href
                ociResourceReference.name = reference.textContent
                ociResourceReference.service = parts[3]
                ociResourceReference.type = resourceId.split('.')[1]

                ociResourceReferences.push(ociResourceReference)
              }
            }
        }
        profile.ociResourceReferences = ociResourceReferences

      }
    }


    catch (error) {
      // at least one iframe gives an error SecurityError: Failed to read a named property 'document' from 'Window': Blocked a frame with origin "https://cloud.oracle.com" from accessing a cross-origin frame.
      console.log("error ", error)
    }
  }

}

const getImmediateTextContent = (element) => {
  return Array.from(element.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE) // Get only text nodes
    .map(node => node.textContent.trim()) // Trim whitespace
    .join(" "); // Join if multiple text nodes
}