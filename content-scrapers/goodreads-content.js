chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {


  // // I will let ChatGPT explain:
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
      if (message.type === 'goodreadsRequestForNetwork') {
        console.log("Network Navigator Goodreads Info request received: ");
        let profile = await getGoodreadsProfile();
        console.log("Sending Profile Asynch:", profile)
        sendResponse({ status: 'success', data: profile, pageUrl: window.location.href });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  })();
  return true; // Keeps the message channel open for async sendResponse
});

console.log('goodreads-content.js loaded - Network Navigator extension is active');

const getGoodreadsProfile = async () => {
  const profile = {}
  profile.pageTitle = document.title;
  profile.pageUrl = window.location.href;
  const isBookPage = window.location.href.includes('/book/')
  const isAuthorPage = window.location.href.includes('/author/')
  profile.subtype = isBookPage ? 'book' : isAuthorPage ? 'person' : 'book'
  if (isBookPage) {
    const x = await scrapeBookData(profile);
  } else if (isAuthorPage) {
    scrapeAuthorData(profile);
  }
  return profile
}

const scrapeBookData = async (profile) => {
  const bookCardElement = document.querySelector('div.BookCard');
  if (bookCardElement) {
    // find image
    const imageElement = bookCardElement.querySelector('img');
    profile.image = imageElement.src;
  }
  // find div with BookPageTitleSection
  const bookPageTitleSectionElement = document.querySelector('div.BookPageTitleSection');
  if (bookPageTitleSectionElement) {
    // find title
    const titleElement = bookPageTitleSectionElement.querySelector('h1');
    profile.title = titleElement.textContent.trim();

    const subtitleElement = bookPageTitleSectionElement.querySelector('h3');
    profile.subtitle = subtitleElement?.textContent.trim();
  }

  // div with BookPageMetadataSection
  const bookPageMetadataSectionElement = document.querySelector('div.BookPageMetadataSection');
  if (bookPageMetadataSectionElement) {
    // find author
    const authorElement = bookPageMetadataSectionElement.querySelector('a');
    profile.author = authorElement?.textContent.trim();

    // div class RatingStatistics__rating
    const ratingElement = bookPageMetadataSectionElement.querySelector('div.RatingStatistics__rating');
    profile.rating = ratingElement?.textContent.trim();

    // p with attribute data-testid="publicationInfo"
    const publicationInfoElement = bookPageMetadataSectionElement.querySelector('p[data-testid="publicationInfo"]');
    profile.publicationInfo = publicationInfoElement?.textContent.trim();

    // p with attribute data-testid="pagesFormat"
    const pagesFormatElement = bookPageMetadataSectionElement.querySelector('p[data-testid="pagesFormat"]');
    profile.pagesFormat = pagesFormatElement?.textContent.trim();
    // div class TruncatedContent__text  
    const truncatedContentElement = bookPageMetadataSectionElement.querySelector('div.TruncatedContent__text');
    profile.truncatedContent = truncatedContentElement?.textContent.trim();

  }
  // more author details
  const authorDiv = document.querySelector('div.AuthorPreview')
  if (authorDiv) {
    const authorImage = authorDiv.querySelector('img[data-testid="image"]')
    if (authorImage) {
      profile.authorImage = authorImage.src
      profile.authorUrl = authorImage.parentElement.href
    }
  }

    // const authorAnchor = authorDiv.querySelector('a.ContributorLink')
    // if (authorAnchor) {
    //   const authorUrl = authorAnchor.href
    //   const authorName = authorAnchor.textContent.trim()
    //   profile.authorUrl = authorUrl
    //   profile.authorName = authorName

    // }}

    // div with data-testid="genresList"
    const genresListElement = document.querySelector('div[data-testid="genresList"]');
    if (genresListElement) {
      // all span children with class BookPageMetadataSection__genreButton
      const genreButtons = genresListElement.querySelectorAll('span.BookPageMetadataSection__genreButton');
      if (genreButtons) {
        profile.genres = [...genreButtons].map(genreButton => genreButton.textContent.trim());
      }

    }

    // div with class BookDetails
    const bookDetailsElement = document.querySelector('div.BookDetails');
    // find first button  in div
    if (bookDetailsElement) {
      const bookDetailsButton = bookDetailsElement.querySelector('button');
      if (bookDetailsButton) {
        bookDetailsButton.click();
        await delay(700)
        const dtElements = bookDetailsElement.querySelectorAll('dt');
        for (const dtElement of dtElements) {
          const dtText = dtElement.textContent.trim();
          if (dtText === "Setting") {
            const settingValueElement = dtElement.nextElementSibling;
            profile.setting = settingValueElement.textContent.trim();
          } else if (dtText === "Characters") {
            const charactersValueElement = dtElement.nextElementSibling;
            profile.characters = charactersValueElement.textContent.trim();
          }
        }
        // div class EditionDetails
        const editionDetailsElement = document.querySelector('div.EditionDetails');
        if (editionDetailsElement) {
          // all divs with class="DescListItem"
          const descListItems = editionDetailsElement.querySelectorAll('div.DescListItem');
          if (descListItems) {
            for (const descListItem of descListItems) {
              const dtElement = descListItem.querySelector('dt');
              const ddElement = descListItem.querySelector('dd');
              if (dtElement && ddElement) {
                profile[dtElement.textContent.trim()] = ddElement.textContent.trim();
              }
            }
          }
        }

      }
    }
    // find similar books
    // ul with class="CarouselGroup"
    const similarBooksElement = document.querySelector('ul.CarouselGroup');
    if (similarBooksElement) {
      const similarBooks = similarBooksElement.querySelectorAll('li');
      if (similarBooks) {
        // iterate over similar books
        profile.similarBooks = [];
        for (const similarBook of similarBooks) {
          const book = {}
          // find image
          const imageElement = similarBook.querySelector('img');
          book.image = imageElement.src;
          // div element with data-testid="title"
          const titleElement = similarBook.querySelector('div[data-testid="title"]');
          book.title = titleElement.textContent?.trim();
          const authorElement = similarBook.querySelector('div[data-testid="author"]');
          book.author = authorElement.textContent?.trim();
          book.pageUrl = similarBook.querySelector('a')?.href;
          // find span with class AverageRating__ratingValue
          const ratingElement = similarBook.querySelector('span.AverageRating__ratingValue');
          book.rating = ratingElement.textContent.trim();
          profile.similarBooks.push(book);
        }

      }
    }
  }

  const scrapeAuthorData = (profile) => {
    // div with class authorLeftContainer
    const authorLeftContainerElement = document.querySelector('div.authorLeftContainer');
    if (authorLeftContainerElement) {
      // find image
      const imageElement = authorLeftContainerElement.querySelector('img');
      profile.image = imageElement.src;
    }
    // find div with BookPageTitleSection
    const authorNameElement = document.querySelector('h1.authorName');
    if (authorNameElement) {
      profile.name = authorNameElement.textContent.trim();

      const div = authorNameElement.parentElement.parentElement
      if (div) {
        // iterate over all child nodes
        for (const child of div.children) {
          if (child.tagName === 'DIV' && "Born" === child.textContent?.trim()) {
            console.log("Born", child.textContent.trim());
            console.log("Born next - where", child.nextSibling.textContent.trim());
            profile.birthplace = child.nextSibling.textContent.trim();
            console.log("Born next next - when", child.nextSibling.nextSibling.textContent.trim());
            profile.birthdate = child.nextSibling.nextSibling.textContent.trim();

          }
          if (child.tagName === 'DIV' && "Died" === child.textContent?.trim()) {
            console.log("Died", child.textContent.trim());
            console.log("Died next - ", child.nextSibling.textContent?.trim());
            console.log("Died next next - when", child.nextSibling.nextSibling.textContent?.trim());
            profile.died = child.nextSibling.nextSibling.textContent?.trim();
          }
          if (child.tagName === 'DIV' && "Website" === child.textContent?.trim()) {
            console.log("Website", child.textContent.trim());
            console.log("Website next - ", child.nextElementSibling.textContent?.trim());
            profile.website = child.nextElementSibling.textContent?.trim();
          }
          if (child.tagName === 'DIV' && "Genre" === child.textContent?.trim()) {
            console.log("Genre", child.textContent.trim());
            console.log("Genere next - ", child.nextElementSibling.textContent?.trim());
            profile.genres = child.nextElementSibling.textContent?.trim();
          }
        }

      }
    }


    // div with class aboutAuthorInfo
    const aboutAuthorInfoElement = document.querySelector('div.aboutAuthorInfo');
    if (aboutAuthorInfoElement) {
      // find description
      const descriptionElement = aboutAuthorInfoElement.querySelector('span');
      profile.description = descriptionElement?.textContent.trim();
    }

    // div with itemtype="https://schema.org/Collection"
    const collectionElement = document.querySelector('div[itemtype="https://schema.org/Collection"]');
    if (collectionElement) {
      // find table
      const tableElement = collectionElement.querySelector('table');
      if (tableElement) {
        // find all tr in table
        const trElements = tableElement.querySelectorAll('tr');
        if (trElements) {
          const books = []
          // iterate over all tr elements
          for (const trElement of trElements) {
            // find all td elements in tr
            const tdElements = trElement.querySelectorAll('td');
            if (tdElements) {
              const book = {}
              book.image = tdElements[0].querySelector('img').src
              book.title = tdElements[0].querySelector('a').title
              book.goodreadsUrl = tdElements[0].querySelector('a').href
              const bookText = tdElements[1].querySelector('div')?.textContent
              if (bookText) {
                // find string published and then extract the next 5 characters
                const publishedIndex = bookText.indexOf("published")
                book.published = bookText.substring(publishedIndex + 12, publishedIndex + 16)
                // find string "avg rating" and extract the 5 characters  before that string
                const avgRatingIndex = bookText.indexOf("avg rating")
                book.avgRating = bookText.substring(avgRatingIndex - 5, avgRatingIndex)

              }

              books.push(book)
            }
          }
          profile.books = books
        }
      }
    }
  }

  function delay(milliseconds) {
    return new Promise(resolve => {
      setTimeout(resolve, milliseconds);
    });
  }
