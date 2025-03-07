chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // I will let ChatGPT explain:
  // chrome.tabs.sendMessage() only supports synchronous message passing by default. If the content script's listener is asynchronous, it doesn't return a response immediately, and sendMessage() doesn't actually wait for the async operation to complete. Instead, it resolves as soon as the listener returns, which may happen before your async operation is done.

  // Solution:
  // You need to return a Promise inside the message listener.
  // Explanation:
  // The message listener is asynchronous, but since the callback itself isn't async, we manually wrap it in an IIFE (Immediately Invoked Function Expression).
  // The sendResponse function is used inside the async operation.
  // The critical part: returning true from the listener keeps the messaging channel open, allowing the async operation to complete before sending the response.

  (async () => {
    try {
      console.log("Received message:", message);
      if (message.type === 'spotifyRequestForNetwork') {
        console.log("Network Navigator Spotify Info request received: ");
        let profile = await getSpotifyProfile();
        console.log("Profile:", profile)
        sendResponse({ status: 'success', data: profile, pageUrl: window.location.href });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  })();
  return true; // Keeps the message channel open for async sendResponse

});

console.log('spotify-content.js loaded - Network Navigator extension is active');

const getSpotifyProfile = async () => {
  const profile = {}
  profile.pageTitle = document.title;
  profile.pageUrl = window.location.href;
  // if url contains /artist/ 
  if (window.location.href.includes('/artist/')) {
    profile.subtype = 'artist'
    const x = await scrapeArtistData(profile);
  } else
    if (window.location.href.includes('/album/')) {
      profile.subtype = 'album'
      const x = await scrapeAlbumData(profile);
    } else {
      profile.subtype = 'song'
      const x = await scrapeSongData(profile);
    }
  return profile
}

const scrapeSongData = async (profile) => {
  // section with data-testid="track-page"
  const trackPageElement = document.querySelector('section[data-testid="track-page"]');
  if (trackPageElement) {
    // find image
    const imageElement = trackPageElement.querySelector('img');
    profile.image = imageElement.src;
    profile.songTitle = imageElement.alt;

    // find div with class trackInfo
    const div = imageElement.parentElement.parentElement.parentElement
    // find span with data-testid="entityTitle" in div
    const span = div.querySelector('span[data-testid="entityTitle"]');
    if (span) {
      profile.title = span.textContent.trim();
      const divWithArtist = span.nextElementSibling
      if (divWithArtist) {
        // find span with data-testid="creator-link"
        const aWithArtist = divWithArtist.querySelector('a[data-testid="creator-link"]');
        if (aWithArtist) {
          profile.artist = aWithArtist.textContent.trim();
          profile.artistUrl = aWithArtist.href;
          const grandparentDiv = aWithArtist.parentElement.parentElement
          if (grandparentDiv) {
            // find image of artist
            const artistImage = grandparentDiv.querySelector('img');
            if (artistImage) {
              profile.artistImage = artistImage.src;
            }
            const albumSpan = grandparentDiv.nextElementSibling.nextElementSibling
            if (albumSpan) {
              // find anchor   element inside
              const albumAnchor = albumSpan.querySelector('a');
              if (albumAnchor) {
                profile.album = albumAnchor.textContent.trim();
                profile.albumUrl = albumAnchor.href;
              }
              const yearSpan = albumSpan.nextElementSibling.nextElementSibling
              if (yearSpan) {
                profile.year = yearSpan.textContent.trim();
              }
              const durationSpan = yearSpan.nextElementSibling.nextElementSibling
              if (durationSpan) {
                profile.duration = durationSpan.textContent.trim();
              }

            }
          }
        }

      }
    }

    // recommended based on this song
    // find div with aria-label="Recommended"
    const recommendedElement = document.querySelector('div[aria-label="Recommended"]');
    if (recommendedElement) {
      // find all divs with data-testid="tracklist-row"
      const tracklistRowDivs = recommendedElement.querySelectorAll('div[data-testid="tracklist-row"]');
      // iterate over all divs and add their text content to the recommended property
      const recommended = []
      for (const tracklistRowDiv of tracklistRowDivs) {
        const recommendedTrack = {}
        const div = tracklistRowDiv.querySelector('div')
        // find first child of div
        const firstChild = div.firstElementChild
        if (firstChild) {
          // find image
          const image = firstChild.querySelector('img')
          if (image) {
            recommendedTrack.image = image.src
          }
        }

        // second div child of div 
        const secondDiv = div.children[1]
        if (secondDiv) {
          // has anchor element
          const anchor = secondDiv.querySelector('a')
          if (anchor) {
            recommendedTrack.songUrl = anchor.href
            recommendedTrack.songTitle = anchor.textContent.trim()
          }
          // has span element
          const span = secondDiv.querySelector('span')
          if (span) {
            recommendedTrack.artist = span.textContent.trim()
            // span has anchor with href for artist
            const artistAnchor = span.querySelector('a')
            if (artistAnchor) {
              recommendedTrack.artistUrl = artistAnchor.href
            }
          }
        }
        // fourth div has duration
        const fourthDiv = div.children[3]
        if (fourthDiv) {
          recommendedTrack.duration = fourthDiv.textContent.trim()
        }
        recommended.push(recommendedTrack)
      }
      profile.recommended = recommended
    }


    // find div with id context-menu
    const contextMenuElement = document.querySelector('div#context-menu');
    if (contextMenuElement) {
      // iterate over all spans and find the one with textcontent "View credits" in div
      for (const span of contextMenuElement.querySelectorAll('span')) {
        if (span.textContent.trim() === 'View credits') {

          const button = span.parentElement
          button.click();
          // wait 500 ms, then continue
          await delay(500);
          // find dialog with aria-label="Credits"
          const dialog = document.querySelector('dialog[aria-label="Credits"]');
          if (dialog) {

            // find P element with textcontext Written by
            const p = dialog.querySelectorAll('p');
            if (p) {
              for (const pElement of p) {
                if (pElement.textContent.trim() === 'Written by') {
                  // find all siblings (of type anchor and span) under same parent element  
                  const siblings = pElement.parentElement.querySelectorAll('a, span');
                  // iterate over all siblings and add their text content to the writtenBy property
                  const writtenBy = []
                  for (const sibling of siblings) {
                    if (sibling.tagName === 'A' || sibling.tagName === 'SPAN') {
                      // TODO add href for Anchor elements
                      writtenBy.push(sibling.textContent.trim())
                    }
                  }
                  profile.writtenBy = writtenBy
                }
                if (pElement.textContent.trim() === 'Performed by') {
                  // find all siblings (of type anchor and span) under same parent element  
                  const siblings = pElement.parentElement.querySelectorAll('a, span');
                  const performedBy = []
                  // iterate over all siblings and add their text content to the performedBy property
                  for (const sibling of siblings) {
                    if (sibling.tagName === 'A' || sibling.tagName === 'SPAN') {
                      // TODO add href for Anchor elements
                      performedBy.push(sibling.textContent.trim())
                    }
                  }
                  profile.performedBy = performedBy
                }
                if (pElement.textContent.trim() === 'Produced by') {
                  // find all siblings (of type anchor and span) under same parent element  
                  const siblings = pElement.parentElement.querySelectorAll('a, span');
                  const producedBy = []

                  // iterate over all siblings and add their text content to the producedBy property
                  for (const sibling of siblings) {
                    if (sibling.tagName === 'A' || sibling.tagName === 'SPAN') {
                      // TODO add href for Anchor elements
                      producedBy.push(sibling.textContent.trim())
                    }
                  }
                  profile.producedBy = producedBy
                }
              }
            }
            const button = dialog.querySelector('button[aria-label="Close"]');
            if (button) {
              button.click();
            }
          }

          break;
        }
      }
    }

  }

}


const scrapeArtistData = async (profile) => {
  // section with data-testid="artist-page"
  const artistPageElement = document.querySelector('section[data-testid="artist-page"]');
  if (artistPageElement) {

    // span with data-testid="adaptiveEntityTitle"
    const span = artistPageElement.querySelector('span[data-testid="adaptiveEntityTitle"]');
    if (span) {
      profile.artist = span.textContent;
    }
    // find h2 with text context equal to About
    const h2s = artistPageElement.querySelectorAll('h2');
    for (const h2 of h2s) {


      if (h2.textContent.trim() === 'About') {
        // find p element with text context equal to Description
        const div = h2.nextElementSibling;
        if (div) { // button /div /div 2
          // get the textcontent of the div and then take the section that starts after the string "listeners"
          const textContent = div.textContent.trim();
          const startIndex = textContent.indexOf('monthly listeners');
          if (startIndex !== -1) {
            profile.description = textContent.substring(startIndex + 17).trim();
          }
        }

        // the next sibling of the h2 element with text content "About" contains a button
        const button = h2.nextElementSibling.querySelector('button');
        if (button) {
          // that button has a style attribute that contains a background image. This is the image of the artist
          const backgroundImage = button.style.backgroundImage;
          if (backgroundImage) {
            // the background image contains not just a url but also linear-gradient etc.
            //             linear-gradient(rgba(0, 0, 0, 0 0%, rgba(0, 0, 0, 0.7) 100%), \"https://i.scdn.co/image/ab6761670000ecd42eb94932f067684992264040\")"
            // so we need to get the string that starts with https:// and ends with \")

            const urlMatch = backgroundImage.match(/https?:\/\/[^")]+/)
            if (urlMatch) {
              profile.image = urlMatch[0]; //.slice(0, -2); // Remove the trailing \"
            }

          }
        }
      }
    }


  }
  // find section with aria-label="Fans also like" 
  const fansAlsoLikeSection = document.querySelector('section[aria-label="Fans also like"]');
  if (fansAlsoLikeSection) {
    const div = fansAlsoLikeSection.querySelector('div[data-testid="grid-container"]');
    if (div) {
      // iterate over child elements
      const fansAlsoLike = []
      for (const element of div.children) {
        if (element.tagName === 'DIV') {
          const artist = {}
          const image = element.querySelector('img');
          if (image) {
            artist.image = image.src;
          }
          const ref = element.querySelector('a');
          if (ref) {
            artist.url = ref.href;
            artist.name = ref.textContent.trim();
          }
          fansAlsoLike.push(artist)
        }
      }
      profile.fansAlsoLike = fansAlsoLike
    }
  }

  // section with aria-label="Discography"
  const discographySection = document.querySelector('section[aria-label="Discography"]');
  if (discographySection) {

    // div with data-testid="grid-container" 
    const div = discographySection.querySelector('div[data-testid="grid-container"]');
    if (div) {
      // iterate over child elements
      const discography = []
      for (const element of div.children) {
        if (element.tagName === 'DIV') {
          const album = {}
          const image = element.querySelector('img');
          if (image) {
            album.image = image.src;
          }
          const ref = element.querySelector('a');
          if (ref) {
            album.url = ref.href;
            album.name = ref.textContent.trim();

            const divNotes = ref.nextElementSibling
            if (divNotes) {
              // find child of type time and get the text content
              const time = divNotes.querySelector('time');
              if (time) {
                // get datetime attribute
                album.releaseDate = time.getAttribute('datetime');
                // get text node that follows time element
                const textNode = time.nextSibling;
                if (textNode) {
                  album.notes = textNode.textContent.trim();
                }
              }
            }
          }
          discography.push(album)
        }
      }
      profile.discography = discography
    }

    const ul = discographySection.querySelector('ul');
    if (ul) {
      // iterate over child elements
      const discography = []
      for (const element of ul.children) {
        if (element.tagName === 'LI') {
          const album = {}
          const ref = element.querySelector('a');
          if (ref) {
            album.url = ref.href;
            album.name = ref.textContent.trim();
          }
          discography.push(album)
        }
      }
      profile.discography = discography
    }
  }
}


const scrapeAlbumData = async (profile) => {
  // find button with aria-label="View album artwork" 
  const button = document.querySelector('button[aria-label="View album artwork"]');
  if (button) {
    const image = button.querySelector('img');
    if (image) {
      profile.image = image.src;
    }
  }
  // find h1 in the parent of the button
  const h1 = button.parentElement.querySelector('h1');
  if (h1) {
    profile.name = h1.textContent.trim();
  }
  // h1 has a parent with a next element sibling  that is a div with children
  const div = h1.parentElement.nextElementSibling;
  if (div) {
    const children = div.children;
    // the first child is a div that  contains an img with artist's image and the artist's name
    const artistDiv = children[0];
    const artistImage = artistDiv.querySelector('img');
    if (artistImage) {
      profile.artistImage = artistImage.src;
    }
    const artistName = artistDiv.querySelector('a');
    if (artistName) {
      profile.artistName = artistName.textContent.trim();
    }
    // the third child is a span with the release year
    const releaseYearSpan = children[2];
    if (releaseYearSpan) {
      profile.releaseYear = releaseYearSpan.textContent.trim();
    }
    // the 5th child is a div with 3 span children; the first has the number of tracks, the third the duration
    const trackCountSpan = children[4].children[0];
    if (trackCountSpan) {
      profile.numberOfTracks = trackCountSpan.textContent.trim();
    }
    const durationSpan = children[4].children[2];
    if (durationSpan) {
      profile.duration = durationSpan.textContent.trim();
    }
  }

  // find div with data-testid="track-list"
  const trackList = document.querySelector('div[data-testid="track-list"]');
  if (trackList) {
    // iterate over child elements
    const tracks = []
    // find divs in tracklist with data-testid="tracklist-row"
    const divs = trackList.querySelectorAll('div[data-testid="tracklist-row"]');
    for (const div of divs) {
      const track = {}
      const ref = div.querySelector('a');
      if (ref) {
        track.url = ref.href;
        track.name = ref.textContent.trim();

        // the grand parent element of ref has a next element sibling that contains the track's duration
        const grandParent = ref.parentElement.parentElement;
        const duration = grandParent.nextElementSibling;
        if (duration) {
          track.duration = duration.textContent.trim();
        }
      }
      tracks.push(track)
    }
    profile.tracks = tracks
    
}}

function delay(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

