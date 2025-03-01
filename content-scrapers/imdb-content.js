let namePage, titlePage

// const pageTypeChecker = () => {

//   if (window.location.href.includes('/name/')) {
//     namePage = true
//   } else {

//     namePage = false
//   }
//   if (window.location.href.includes('/title/')) {
//     titlePage = true
//   } else {
//     titlePage = false
//   }
//   chrome.runtime.sendMessage({ action: "togglePageType", contentExtension: "imdb", namePage: namePage, titlePage: titlePage });
// }
// let lastUrl = location.href;
// pageTypeChecker()

// const urlChangeObserver = new MutationObserver(() => {
//   if (location.href !== lastUrl) {
//     console.log("URL changed to:", location.href);
//     lastUrl = location.href;
//     pageTypeChecker()
//     // Perform actions on URL change
//   }
// });

// // Observe changes in the document body (for SPAs)
// urlChangeObserver.observe(document.body, { childList: true, subtree: true });


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.type === 'imdbInfoRequestForNetwork') {
    console.log("IMDB Info request received: ");
    let profile = getIMDbProfile()
    profile.type = titlePage ? 'title' : 'name'
    console.log("Profile:", profile)
    sendResponse({ status: 'success', data: profile, imdbUrl: window.location.href });
  }
});

console.log('Reporting: imdb-content.js loaded ');

const getIMDbProfile = () => {


  const profile = {}
  addName(profile)

  titlePage = window.location.href.includes('/title/')
  namePage = window.location.href.includes('/name/')
  if (titlePage) {
    addType(profile)
    addRating(profile)
    addImage(profile)
    addPeriod(profile)
    addChipsAndAbout(profile)
    addCast(profile)
    addMoreLikeThis(profile)
  }
  if (namePage) {
    addImage(profile)
    addBirthDeath(profile)
    addBio(profile)
    addPersonSubtype(profile)
    addPortfolio(profile)
    addKnownFor(profile)

  }
  return profile
}

const addName = (profile) => {
  profile.name = document.querySelector('h1').querySelector('span').textContent
}

const addType = (profile) => {
  const h1 = document.querySelector('h1')
  profile.type = "Movie"
  if (h1) {
    let nextSib = h1.nextElementSibling
    if (nextSib.textContent.startsWith('Original title')) {
      nextSib = nextSib.nextElementSibling
    }

    const nextSibLi = nextSib.querySelector('li')
    const type = nextSibLi.textContent
    if (type === 'TV Series' || type === 'TV Mini Series') {
      profile.subtype = type
    } else {
      profile.subtype = "Movie"
    }
  }
}


const addPeriod = (profile) => {
  const h1 = document.querySelector('h1')
  if (h1) {
    let nextSib = h1.nextElementSibling
    if (nextSib.textContent.startsWith('Original title')) {
      nextSib = nextSib.nextElementSibling
    }

    if (profile.subtype === "Movie") {
      const nextSibLi = nextSib.querySelector('li:nth-of-type(1)')
      const period = nextSibLi.textContent
      if (period) {
        profile.period = period
      }

    } else {
      const nextSibLi = nextSib.querySelector('li:nth-of-type(2)')
      const period = nextSibLi.textContent
      if (period) {
        profile.period = period
      }
    }
  }
}

const addBirthDeath = (profile) => {
  let birthDeathDivs = document.querySelectorAll('div[data-testid="birth-and-death-birthdate"]');
  if (birthDeathDivs.length > 0) {
    const birth = birthDeathDivs[0].querySelector('span:nth-of-type(2)').textContent
    if (birth) {
      profile.birthDate = birth
    }
  }
  let deathDivs = document.querySelectorAll('div[data-testid="birth-and-death-deathdate"]');

  if (deathDivs.length > 0) {
    const death = deathDivs[0].querySelector('span:nth-of-type(2)').textContent
    if (death) {
      profile.deathDate = death
    }
  }

}

const addImage = (profile) => {
  const h1 = document.querySelector('h1')
  if (h1) {
    const grandparent = h1.parentElement.parentElement
    if (grandparent) {
      const nextElementSibling = grandparent.nextElementSibling
      if (nextElementSibling) {
        const img = nextElementSibling.querySelector('img')
        if (img) {
          profile.image = img.src

        }
      }
    }
  }
}

const addChipsAndAbout = (profile) => {
  let chipDiv = document.querySelector("div.ipc-chip-list");
  if (chipDiv) {
    const chips = chipDiv.querySelector('div:nth-of-type(2)').querySelectorAll('a');
    if (chips) {
      profile.chips = [...chips].map(chip => chip.textContent.trim());
    }
  }
  let plotP = chipDiv.nextElementSibling
  if (plotP) {
    profile.plot = plotP.querySelector('span:nth-of-type(2)').textContent.trim();
  }
  let detailsDiv = plotP.nextElementSibling
  if (detailsDiv) {
    const detailLines = detailsDiv.querySelector('ul').querySelectorAll(':scope >li');
    if (detailLines) {
      for (let i = 0; i < detailLines.length; i++) {
        const detail = detailLines[i];
        const detailKey = detail.firstElementChild.textContent?.trim();
        let detailValue = detail.querySelector('div')?.textContent?.trim();

        // next sibling is a DIV with UL with LIs for each writer, creator, director, star  ; in the LI: an ANCHOR to the IMDB page of the person and text content with the name
        // create entries for each person 
        const detailLIs = detail.querySelector('div').querySelector('ul').querySelectorAll(':scope >li');
        if (detailLIs) {
          detailValue = []
          detailLIs.forEach((li) => {

            detailValue.push({
              name: li.querySelector('a')?.textContent?.trim(),
              url: li.querySelector('a')?.href?.trim()
            })
          })
        }
        profile[detailKey] = detailValue;
      }
      //      profile.details = [...detailLines].map(detail => detail.textContent.trim());
    }
  }
}

const addKnownFor = (profile) => {
  // find div with data-testid="nm_kwn_for_0"
  const knownForDiv = document.querySelector('div[data-testid="nm_kwn_for_0"]');
  if (knownForDiv) {
    const parentKnownForDiv = knownForDiv.parentElement
    if (parentKnownForDiv) {
      const knownFor = []
      for (const child of parentKnownForDiv.children) {
        const production = {}
        production.image = child.querySelector('img').src
        production.movieUrl = child.querySelector('a').href
        production.description = child.querySelector('a').ariaLabel
        production.rating = child.querySelector('span.ipc-rating-star--rating').textContent
        production.type = child.querySelector('div.ipc-primary-image-list-card__title-type')?.textContent

        const div = child.querySelector(':scope > div:nth-of-type(2)')
        if (div) {
          const title = div.querySelector(':scope > div:nth-of-type(1)')
          if (title) {
            production.title = title.textContent.trim()
          }
          const character = div.querySelector(':scope > div:nth-of-type(3)')
          if (character) {
            production.character = character.textContent.trim()
          }
          const period = div.querySelector(':scope > div:nth-of-type(4)')
          if (period) {
            production.period = period.textContent.trim()
          }
        }

        knownFor.push(production)
      }
      profile.knownFor = knownFor
    }
  }
}


const addPortfolio = (profile) => {
  let filmographyDiv = document.querySelector('div[data-testid="Filmography"]');
  if (filmographyDiv) {

    const portfolioDiv = filmographyDiv.querySelector(':scope > section:nth-of-type(1)')?.querySelector(':scope > div:nth-of-type(5)')
    if (portfolioDiv) {
      // const portfolioUl = portfolioDiv.querySelector('ul:nth-of-type(2)');
      // console.log('portfolioUl', portfolioUl)
      // if (portfolioUl) {
      //   profile.portfolio = [...portfolioUl.querySelectorAll('li')].map(portfolio => portfolio.textContent.trim());
      // }


      // TODO distinguish between actor performance and director performance  id: accordion-item-director-previous-projects
      // as well as writer and producer
      const portfolio = []
      const perspectives = ['actor', 'actress', 'director', 'writer', 'producer']
      for (const perspective of perspectives) {
        const portfolioUl = document.getElementById(`accordion-item-${perspective}-previous-projects`)?.querySelector('ul');

        if (portfolioUl) {
          const items = portfolioUl.querySelectorAll(':scope > li');
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const performance = { perspective }
            performance.image = item.querySelector(':scope > div').querySelector('img')?.src;
            const anchor = item.querySelector(':scope > div:nth-of-type(2)').querySelector('a')
            if (anchor) {
              performance.title = anchor.textContent.trim();
              performance.url = anchor.href;
            }
            const ul = anchor.nextElementSibling.nextElementSibling
            if (ul) {
              const characterLIs = ul.querySelectorAll(':scope > li');
              if (characterLIs) {
                performance.character = [...characterLIs].map(character => character.textContent.trim());
              }
            }

            const detailsDiv = item.querySelector(':scope > div:nth-of-type(2)').querySelector(':scope > div:nth-of-type(2)')
            const detailsUL = detailsDiv?.querySelector('ul')
            if (detailsUL) {
              const detailsLIs = detailsUL.querySelectorAll(':scope > li');
              if (detailsLIs) {
                performance.details = [...detailsLIs].map(detail => detail.textContent.trim());
              }
            }

            portfolio.push(performance)
          }
        }
      }
      profile.portfolio = portfolio
    }
  }
}

const addMoreLikeThis = (profile) => {
  // section data-testid="MoreLikeThis"

  const moreLikeThisSection = document.querySelector('section[data-testid="MoreLikeThis"]');
  if (moreLikeThisSection) {
    const moreLikeThisDiv = moreLikeThisSection.querySelector('div[data-testid="shoveler-items-container"]');
    if (moreLikeThisDiv) {
      const moreLikeThis = []
      const items = moreLikeThisDiv.querySelectorAll(':scope > div');
      if (items) {
        for (const item of items) {
          const moreLikeThisItem = {}
          const image = item.querySelector('img')
          if (image) {
            moreLikeThisItem.image = image.src
            moreLikeThisItem.title = image.alt
          }
          const ref = item.querySelector('a')
          if (ref) {
            moreLikeThisItem.titleUrl = ref.href
          }
          // span with class ipc-rating-star--rating 
          const rating = item.querySelector('span.ipc-rating-star--rating')
          if (rating) {
            moreLikeThisItem.rating = rating.textContent
          }

          moreLikeThis.push(moreLikeThisItem)
        }
        profile.moreLikeThis = moreLikeThis
      }
    }
  }
}

const addCast = (profile) => {
  let castDiv = document.querySelector('section[data-testid="title-cast"]');
  if (castDiv) {
    const cast = castDiv.querySelector('div:nth-of-type(2)').querySelector('div:nth-of-type(2)').querySelectorAll(':scope > div');
    if (cast) {
      profile.cast = []
      for (let i = 0; i < cast.length; i++) {
        const character = {}
        const el = cast[i]
        const image = el.querySelector('img')
        if (image) {
          character.image = image.src
          character.name = image.alt
        }
        const el2 = el.querySelector('div:nth-of-type(2)')
        if (el2) {
          character.actorUrl = el2.querySelector('a')?.href
          character.actorName = el2.querySelector('a')?.textContent
          character.characterName = el2.querySelector('div')?.textContent // actuall the div contain a UL with LIs for every character played by the actor
          character.details = el2.querySelector('button:nth-of-type(2)')?.textContent
        }
        profile.cast.push(character)

      }

    }
  }

}


const addRating = (profile) => {
  let starIcon = document.querySelector("svg.ipc-icon--star");
  if (starIcon) {
    const ratingValue = starIcon.parentElement.nextElementSibling.textContent.trim();
    if (ratingValue) {
      profile.rating = ratingValue;
    }
  }
}

const addBio = (profile) => {
  const h1 = document.querySelector('h1')
  if (h1) {
    const grandparent = h1.parentElement.parentElement
    if (grandparent) {
      const nextElementSibling = grandparent.nextElementSibling
      const divWithBio = nextElementSibling.querySelector(':scope > div:nth-of-type(2)')
      if (divWithBio) {
        const bio = divWithBio.querySelector('section').querySelector(':scope > div').querySelector(':scope > div').querySelector(':scope > div').querySelector(':scope > div').textContent
        profile.bio = bio
      }
    }
  }

}
const addPersonSubtype = (profile) => {
  const h1 = document.querySelector('h1')
  if (h1) {
    const nextSib = h1.nextElementSibling
    const liWithSubtype = nextSib.querySelectorAll('li')
    let subtype = ""
    for (let i = 0; i < liWithSubtype.length; i++) {
      subtype = +liWithSubtype[i].textContent + ","
    }
    if (subtype.length > 0) profile.subtype = subtype
  }
}
