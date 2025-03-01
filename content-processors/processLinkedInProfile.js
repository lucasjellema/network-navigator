import { createEdge, createNode, findNodeByProperty, findNodeByProperties, createEdgeWithLabel } from '../utils.js';
import { determineLimit } from './content-processor-utils.js';



export const processLinkedInProfile = (cy, message, linkedinScrapeConfiguration) => {
    const contentDiv = document.getElementById('content');
    contentDiv.textContent = `
          Profile Type: ${JSON.stringify(message.profile.type)} \n
          Profile: ${JSON.stringify(message.profile)}
          LinkedIn URL: ${message.linkedInUrl}
        `;

    const profile = message.profile;
    profile.linkedInUrl = message.linkedInUrl
    let newNodes = cy.collection();
    if (profile.type === 'person') {
        newNodes =processPerson(cy, profile, newNodes, linkedinScrapeConfiguration)
    }
    if (profile.type === 'company') {
        newNodes = processCompany(cy, profile, newNodes, linkedinScrapeConfiguration);
    }
    // run layout for new nodes
    newNodes.layout({
        name: 'random',
        animate: true,
        animateFilter: function (node, i) {
            return true;
        },
        animationDuration: 1000,
        animationEasing: undefined,
        fit: true,
    })
        .run();

}


function processPerson(cy, profile, newNodes, linkedinScrapeConfiguration) {
    let personNode = findNodeByProperties(cy, { 'label': profile.name, 'type': profile.type });
    let newperson = false

    if (!personNode)
        if (linkedinScrapeConfiguration.person === 'update' || linkedinScrapeConfiguration.person === 'add') {
            personNode = createNode(cy, profile.name);
            personNode.data('url', profile.linkedInUrl);
            personNode.data('type', profile.type);
            personNode.data('subtype', `linkedIn${profile.type}`);
            newNodes = newNodes.union(personNode);
            newperson = true
        } else {
            return newNodes
        }
    if (newperson || linkedinScrapeConfiguration.person === 'update') {
        if (profile.currentRole) personNode.data('currentRole', profile.currentRole);
        if (profile.image) personNode.data('image', profile.image);
        personNode.data('about', profile.about);
        if (profile.location) personNode.data('location', profile.location);
        if (profile.currentCompany) personNode.data('currentCompany', profile.currentCompany);
    }
    if (profile.currentCompany && (linkedinScrapeConfiguration.personExperienceLimit ?? 1000) > 1) {
        let companyNode = findNodeByProperties(cy, { 'label': profile.currentCompany, 'type': 'company' });
        if (!companyNode && linkedinScrapeConfiguration.personExperience === 'add') {
            companyNode = createNode(cy, profile.currentCompany);
            companyNode.data('image', profile.currentCompanyLogo);
            //companyNode.data('url', profile.companyUrl);
            companyNode.data('type', 'company');
            companyNode.data('shape', 'square');
            newNodes = newNodes.union(companyNode);
        }
        if (companyNode && (linkedinScrapeConfiguration.personExperience === 'add' || linkedinScrapeConfiguration.personExperience === 'edge')) {
            const edge = createEdgeWithLabel(cy, personNode, companyNode, `works now as ${profile.currentRole}`, true);
            edge.data('type', 'workAt');
            edge.data('role', profile.currentRole);
        }
    }
    if (profile.latestEducation && (linkedinScrapeConfiguration.personEducationLimit ?? 1000) > 1) {
        let educationNode = findNodeByProperties(cy, { 'label': profile.latestEducation, 'type': 'education' });
        if (!educationNode && linkedinScrapeConfiguration.personEducation === 'add') {
            educationNode = createNode(cy, profile.latestEducation);
            educationNode.data('image', profile.latestEducationLogo);
            educationNode.data('type', 'education');
            educationNode.data('shape', 'diamond');
            newNodes = newNodes.union(educationNode);

        }
        if (educationNode && (linkedinScrapeConfiguration.personEducation === 'add' || linkedinScrapeConfiguration.personEducation === 'edge')) {
            const edge = createEdgeWithLabel(cy, personNode, educationNode, 'educated at', true);
            edge.data('type', 'educatedAt');
        }
    }

    // handle experience
    if (profile.experience && linkedinScrapeConfiguration.personExperience !== 'none') {
        // loop over elements in array experience
        let limit = determineLimit(linkedinScrapeConfiguration.personExperienceLimit, 1000)

        const earliestStartyear = determineLimit(linkedinScrapeConfiguration.personExperienceStartyear, 1899) // linkedinScrapeConfiguration.personExperienceStartyear ?? 1899
        let experienceString = ""
        for (let i = 0; i < profile.experience.length; i++) {
            if (i >= limit) break;
            // TODO check if experience is later than earliestStartyear
            if (linkedinScrapeConfiguration.personExperience === "property") {
                experienceString += experience.company + ", "
                continue
            }
            const experience = profile.experience[i];
            let companyNode = findNodeByProperties(cy, { 'label': experience.company, 'type': 'company' });
            let newcompany = false
            if (!companyNode)
                if (linkedinScrapeConfiguration.personExperience === 'add' || linkedinScrapeConfiguration.personExperience === 'update') {
                    companyNode = createNode(cy, experience.company);
                    companyNode.data('type', 'company');
                    companyNode.data('shape', 'square');
                    newNodes = newNodes.union(companyNode);
                    newcompany = true
                } else {
                    continue
                }
            if (newcompany || linkedinScrapeConfiguration.personExperience === 'update') {
                companyNode.data('linkedInUrl', experience.companyUrl);
                companyNode.data('image', experience.companyImageUrl);
                companyNode.data('url', experience.companyUrl);
            }
            const edge = createEdgeWithLabel(cy, personNode, companyNode, `as ${experience.role}`, true);
            edge.data('type', 'workAt');
            edge.data('role', experience.role);
            edge.data('location', experience.location);
            edge.data('period', experience.period);

            const parts = experience.period.split('-')
            const startDate = new Date(`${parts[0]} 1`);
            edge.data('startDate', startDate);
            if (parts[1] === "Present") {
                edge.data('endDate', new Date());
                edge.data('present', true);
            } else {
                const endDate = new Date(`${parts[1]} 1`);
                edge.data('endDate', endDate);
            }
            edge.data('about', experience.about);
            edge.data('involvement', experience.involvement);
        }
        if (linkedinScrapeConfiguration.personExperience === "property") {
            person.experience = experienceString.slice(0, -2); // remove the last ", " that added when constructing the string
        }
    }


    // handle education
    if (profile.education && linkedinScrapeConfiguration.personEducation !== 'none') {

        const limit = determineLimit(linkedinScrapeConfiguration.personEducationLimit, 1000)
        const earliestStartyear = determineLimit(linkedinScrapeConfiguration.personEducationStartyear, 1899)
        let educationString = ""
        for (let i = 0; i < profile.education.length; i++) {
            if (i >= limit) break;
            // TODO check if education is later than earliestStartyear
            if (linkedinScrapeConfiguration.personeducation === "property") {
                educationString += `${education.name} - ${education.subject} (${education.period}), `
                continue
            }
            const education = profile.education[i];
            let schoolNode = findNodeByProperties(cy, { 'label': education.name, 'type': 'education' });
            let newschool = false
            if (!schoolNode)
                if (linkedinScrapeConfiguration.personEducation === 'add' || linkedinScrapeConfiguration.personEducation === 'update') {
                    schoolNode = createNode(cy, education.name);
                    schoolNode.data('type', 'education');
                    schoolNode.data('shape', 'diamond');
                    newNodes = newNodes.union(schoolNode);
                    newschool = true
                } else {
                    continue
                }
            if (newschool || linkedinScrapeConfiguration.personEducation === 'update') {
                schoolNode.data('linkedInUrl', education.url);
                schoolNode.data('image', education.image);
                schoolNode.data('url', education.url);
            }
            const edge = createEdgeWithLabel(cy, personNode, schoolNode, `${education.subject}`, true);
            edge.data('type', 'educatedAt');
            edge.data('subject', education.subject);
            edge.data('period', education.period);

            const parts = education.period.split('-')
            const startDate = new Date(`${parts[0]} 1`);
            edge.data('startDate', startDate);
            if (parts[1] === "Present") {
                edge.data('endDate', new Date());
                edge.data('present', true);
            } else {
                const endDate = new Date(`${parts[1]} 1`);
                edge.data('endDate', endDate);
            }
        }
        if (linkedinScrapeConfiguration.personEducation === "property") {
            person.education = educationString.slice(0, -2); // remove the last ", " that added when constructing the string
        }
    }
    return newNodes
}

function processCompany(cy, profile, newNodes, linkedinScrapeConfiguration) {
    let companyNode = findNodeByProperties(cy, { 'label': profile.name, 'type': profile.type });
    let newcompany = false
    if (!companyNode)
        if (linkedinScrapeConfiguration.company === 'update' || linkedinScrapeConfiguration.company === 'add') {
            companyNode = createNode(cy, profile.name);
            companyNode.data('type', profile.type);
            companyNode.data('subtype', `linkedIn${profile.type}`);
            companyNode.data('shape', 'square');
            newNodes = newNodes.union(companyNode);
            newcompany = true
        } else { return newNodes }
    if (newcompany || linkedinScrapeConfiguration.company === 'update') {
        companyNode.data('url', profile.linkedInUrl);
        if (profile.image) companyNode.data('image', profile.image);
        if (profile.about) companyNode.data('about', profile.about);
        if (profile.tagline) companyNode.data('tagline', profile.tagline);
        if (profile.location) companyNode.data('location', profile.location);
        if (profile.industry) companyNode.data('industry', profile.industry);
        if (profile.numberOfEmployees) companyNode.data('numberOfEmployees', profile.numberOfEmployees);
        if (profile.foundedYear) companyNode.data('foundedYear', profile.foundedYear);
        if (profile.websiteUrl) companyNode.data('websiteUrl', profile.websiteUrl);
        if (profile.specialties) companyNode.data('specialties', profile.specialties);
        if (profile.description) companyNode.data('description', profile.description);
    }
    return newNodes
}