chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.type === 'wikipediaRequestForNetwork') {
    console.log("Network Navigator Wikipedia request received: ");
    let profile = getWikipediaProfile();
    console.log("Wikipedia Profile:", profile)
    sendResponse({ status: 'success', data: profile, pageUrl: window.location.href });
  }
});

console.log('wikipedia-content.js loaded - Network Navigator extension is active');

const getWikipediaProfile = () => {


  const profile = {}

  profile.pageTitle = document.title;
  profile.pageUrl = window.location.href;

  const allScript = document.querySelectorAll('script')
  for (const script of allScript) {
    try {
      console.log(script.type)
      if ("application/ld+json" == script.type) {
        const content = script.text
        console.log('script', content)
        const context = JSON.parse(content)
        console.log('mainEntity', context.mainEntity)
        const wikidataURL = `${context.mainEntity.replace('http://','https://')}.json`
        profile.wikidataURL = wikidataURL
        // calling Wikidata URL here FAILS BECAUSE OF CORS

        profile.image = context.image
        profile.headline = context.headline
        profile.entityId = context.mainEntity.split('/').pop()

        // find table with class infobox
        const table = document.querySelector('table.infobox')
        const logo = table.querySelector('img')
        if (logo) {
          profile.logoImage = logo.src
        }
        if (table) {
          const props ={}
          const rows = table.querySelectorAll('tr')
          rows.forEach(row => {
            const th = row.querySelector('th')
            const td = row.querySelector('td')
            if (th) {
              props[th.textContent] = td.textContent
              if (th.textContent == "Repository" || th.textContent == "Website") { // we are dealing with an open source software project
                props[th.textContent] = td.querySelector('a').href
                profile.type = 'technology'
              }
            }
          })
          console.log('props', props)
                    Object.assign(profile, props)
        }

      }
    } catch (error) { console.log(error) }
  }



  return profile
}

