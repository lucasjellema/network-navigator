export const initializeLinkedinScrapeConfiguration = () => {
    //    oninput="document.getElementById('book-rating-value').innerText = this.value;"
    fetch("linkedinPanel.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("linkedinConfig").innerHTML = data;

            // The DOMContentLoaded event fires when the initial HTML document has been completely parsed, but it does not wait for external resources like images, stylesheets, or scripts fetched asynchronously (e.g., via fetch()).

            // Why is DOMContentLoaded not enough for fetch()?
            // DOMContentLoaded fires when the HTML is parsed but before fetch() completes.
            // The fetch() request is asynchronous, so the external HTML content is loaded after DOMContentLoaded.
            // Instead of relying on DOMContentLoaded, you should ensure the content is fully loaded before using it.
            console.log("Content loaded: for linkedinPanel");



        })
}

export const prepareLinkedinPanelFromScrapeConfiguration = (scrapeConfiguration) => {
    const person = document.querySelector('input[name="person"][value="' + scrapeConfiguration.linkedin?.person ?? "update" + '"]');
    if (person) {
        person.checked = true;
    }
    const personExperience = document.querySelector('input[name="person-experience"][value="' + scrapeConfiguration.linkedin?.personExperience ?? "update" + '"]');
    if (personExperience) {
        personExperience.checked = true;
    }
    const personExperienceStartyear = document.getElementById("person-experience-startyear");
    personExperienceStartyear.value = scrapeConfiguration.linkedin?.personExperienceStartyear;
    const personExperienceLimit = document.getElementById("person-experience-limit");
    personExperienceLimit.value = scrapeConfiguration.linkedin?.personExperienceLimit;
    
    
    const personEducation = document.querySelector('input[name="person-education"][value="' + scrapeConfiguration.linkedin?.personEducation ?? "update" + '"]');
    if (personEducation) {
        personEducation.checked = true;
    }
    const personEducationStartyear = document.getElementById("person-education-startyear");
    personEducationStartyear.value = scrapeConfiguration.linkedin?.personEducationStartyear;
    const personEducationLimit = document.getElementById("person-education-limit");
    personEducationLimit.value = scrapeConfiguration.linkedin?.personEducationLimit;

    const company = document.querySelector('input[name="company"][value="' + scrapeConfiguration.linkedin?.person ?? "update" + '"]');
    if (company) {
        company.checked = true;
    }
}

export const addLinkedinScrapeConfiguration = (scrapeConfiguration) => {
    const person = document.querySelector('input[name="person"]:checked').value;
    const personExperience = document.querySelector('input[name="person-experience"]:checked').value;
    const personExperienceLimit = document.getElementById("person-experience-limit").value;
    const personExperienceStartyear = document.getElementById("person-experience-startyear").value;

    const personEducation = document.querySelector('input[name="person-education"]:checked').value;
    const personEducationLimit = document.getElementById("person-education-limit").value;
    const personEducationStartyear = document.getElementById("person-education-startyear").value;

    const company = document.querySelector('input[name="company"]:checked').value;

    scrapeConfiguration.linkedin = {
        person, personExperience, personEducation,
        personExperienceLimit, personEducationLimit, personExperienceStartyear, personEducationStartyear,
        company
    }
    console.log(`linked in scrape config`, scrapeConfiguration.linkedin)
}
