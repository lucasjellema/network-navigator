chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.type === 'googlemapsInfoRequestForNetwork') {
    console.log("Web Memo Info request received: for ", message.scope);
    let profile = getLocationProfile();
    console.log("Profile for Location:", profile)
    sendResponse({ status: 'success', data: profile, pageUrl: window.location.href });
  }
});

console.log('google-maps-content.js loaded - Web Memo extension is active');

const getLocationProfile = () => {
  const profile = {}
  profile.pageTitle = document.title;
  profile.pageUrl = window.location.href;
  profile.locationDetails = getLocationDetails();
  return profile
}

function getLocationDetails() {
  let locationDetails = {};

  // Try extracting place name
  let placeName = document.querySelector("h1")?.innerText || "";
  
  // Extract coordinates from the URL
  let match = window.location.href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  let lat = match ? match[1] : null;
  let lng = match ? match[2] : null;

  if (placeName || lat) {
    locationDetails = {
      name: placeName,
      latitude: lat,
      longitude: lng,
      url: window.location.href
    };
  }
const revealCard = document.getElementById('reveal-card');
if (revealCard) {
 const locationDiv = revealCard.querySelector(':scope > div').querySelector(':scope > div:nth-of-type(2)');
 console.log(locationDiv);
  // const placeName = revealCard.querySelector('.place-name').textContent;
  // const address = revealCard.querySelector('.address').textContent;
}

  return locationDetails;
}