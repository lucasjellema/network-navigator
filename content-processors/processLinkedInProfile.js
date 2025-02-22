import { createEdge, createNode, findNodeByProperty, findNodeByProperties, createEdgeWithLabel } from '../utils.js';

export const processLinkedInProfile = (cy, message) => {
    const contentDiv = document.getElementById('content');
    contentDiv.textContent = `
          Profile Type: ${JSON.stringify(message.profile.type)} \n
          Profile: ${JSON.stringify(message.profile)}
          LinkedIn URL: ${message.linkedInUrl}
        `;

    const profile = message.profile;
    let newNodes = cy.collection();
    if (profile.type === 'person') {
        let personNode = findNodeByProperties(cy, { 'label': profile.name, 'type': profile.type });
        if (!personNode) {
            personNode = createNode(cy, profile.name);
            personNode.data('url', message.linkedInUrl);
            personNode.data('type', profile.type);
            personNode.data('subtype', `linkedIn${profile.type}`);
            newNodes = newNodes.union(personNode);
        }
        if (profile.currentRole) personNode.data('currentRole', profile.currentRole);
        if (profile.image) personNode.data('image', profile.image);
        personNode.data('about', profile.about);
        if (profile.location) personNode.data('location', profile.location);

        if (profile.currentCompany) {
            personNode.data('currentCompany', profile.currentCompany);
            let companyNode = findNodeByProperties(cy, { 'label': profile.currentCompany, 'type': 'company' });
            if (!companyNode) {
                companyNode = createNode(cy, profile.currentCompany);
                companyNode.data('image', profile.currentCompanyLogo);
                //companyNode.data('url', profile.companyUrl);
                companyNode.data('type', 'company');
                companyNode.data('shape', 'square');
                newNodes = newNodes.union(companyNode);

            }
            const edge = createEdgeWithLabel(cy, personNode, companyNode, 'works at', true);
            edge.data('type', 'workAt');
            edge.data('role', profile.currentRole);
        }
        if (profile.latestEducation) {
            let educationNode = findNodeByProperties(cy, { 'label': profile.latestEducation, 'type': 'education' });
            if (!educationNode) {
                educationNode = createNode(cy, profile.latestEducation);
                educationNode.data('image', profile.latestEducationLogo);
                educationNode.data('type', 'education');
                educationNode.data('shape', 'diamond');
                newNodes = newNodes.union(educationNode);

            }
            const edge = createEdgeWithLabel(cy, personNode, educationNode, 'educated at', true);
            edge.data('type', 'educatedAt');
        }

        // handle experience
        if (profile.experience) {
            // loop over elements in array experience
            for (let i = 0; i < profile.experience.length; i++) {
                const experience = profile.experience[i];
                let companyNode = findNodeByProperties(cy, { 'label': experience.company, 'type': 'company' });

                if (!companyNode) {
                    companyNode = createNode(cy, experience.company);
                    companyNode.data('image', experience.companyImageUrl);
                    companyNode.data('url', experience.companyUrl);
                    companyNode.data('type', 'company');
                    companyNode.data('shape', 'square');
                    newNodes = newNodes.union(companyNode);

                }
                companyNode.data('linkedInUrl', experience.companyUrl);
                const edge = createEdgeWithLabel(cy, personNode, companyNode, 'works at', true);
                //                edge.data('label', 'works at');
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
        }


    }
    if (profile.type === 'company') {
        let companyNode = findNodeByProperties(cy, { 'label': profile.name, 'type': profile.type });
        if (!companyNode) {
            companyNode = createNode(cy, profile.name);
            companyNode.data('type', profile.type);
            companyNode.data('subtype', `linkedIn${profile.type}`);
            companyNode.data('shape', 'square');
            newNodes = newNodes.union(companyNode);

        }
        companyNode.data('url', message.linkedInUrl);
        if (profile.image) companyNode.data('image', profile.image);
        if (profile.about) companyNode.data('about', profile.about);
        if (profile.tagline) companyNode.data('tagline', profile.tagline);
        if (profile.location) companyNode.data('location', profile.location);
        if (profile.industry) companyNode.data('industry', profile.industry);
        if (profile.numberOfEmployees) companyNode.data('numberOfEmployees', profile.numberOfEmployees);
        // foundedYear, websiteUrl, specialties
        if (profile.foundedYear) companyNode.data('foundedYear', profile.foundedYear);
        if (profile.websiteUrl) companyNode.data('websiteUrl', profile.websiteUrl);
        if (profile.specialties) companyNode.data('specialties', profile.specialties);
        if (profile.description) companyNode.data('description', profile.description);
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
