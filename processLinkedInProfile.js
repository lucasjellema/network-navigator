import { createEdge, createNode, findNodeByProperty } from './utils.js';

export const processLinkedInProfile = (cy, message) => {
    const contentDiv = document.getElementById('content');
    contentDiv.textContent = `
          Profile Type: ${JSON.stringify(message.profile.type)} \n
          Profile: ${JSON.stringify(message.profile)}
          LinkedIn URL: ${message.linkedInUrl}
        `;

    const profile = message.profile;
    if (profile.type === 'person') {
        let personNode = findNodeByProperty(cy, 'label', profile.name);
        if (!personNode) {
            personNode = createNode(cy, profile.name);
            personNode.data('url', message.linkedInUrl);
            personNode.data('type', profile.type);
            personNode.data('subtype', `linkedIn${profile.type}`);
        }
        if (profile.currentRole) personNode.data('currentRole', profile.currentRole);
        if (profile.image) personNode.data('image', profile.image);
        personNode.data('about', profile.about);
        if (profile.location) personNode.data('location', profile.location);

        if (profile.currentCompany) {
            personNode.data('currentCompany', profile.currentCompany);
            let companyNode = findNodeByProperty(cy, 'label', profile.currentCompany);
            if (!companyNode) {
                companyNode = createNode(cy, profile.currentCompany);
                companyNode.data('image', profile.currentCompanyLogo);
                //companyNode.data('url', profile.companyUrl);
                companyNode.data('type', 'company');
                companyNode.data('shape', 'square');
            }
            const edge = createEdge(cy, personNode, companyNode);
            edge.data('label', 'works at');
            edge.data('type', 'workAt');
            edge.data('role', profile.currentRole);
        }
        if (profile.latestEducation) {
            let educationNode = findNodeByProperty(cy, 'label', profile.latestEducation);
            if (!educationNode) {
                educationNode = createNode(cy, profile.latestEducation);
                educationNode.data('image', profile.latestEducationLogo);
                educationNode.data('type', 'education');
                educationNode.data('shape', 'diamond');
            }
            const edge = createEdge(cy, personNode, educationNode);
            edge.data('label', 'educated at');
            edge.data('type', 'educatedAt');
        }

        // handle experience
        if (profile.experience) {
            // loop over elements in array experience
            for (let i = 0; i < profile.experience.length; i++) {
                const experience = profile.experience[i];
                let companyNode = findNodeByProperty(cy, 'label', experience.company);

                if (!companyNode) {
                    companyNode = createNode(cy, experience.company);
                    companyNode.data('image', experience.companyImageUrl);
                    companyNode.data('url', experience.companyUrl);
                    companyNode.data('type', 'company');
                    companyNode.data('shape', 'square');
                }
                companyNode.data('linkedInUrl', experience.companyUrl);
                const edge = createEdge(cy, personNode, companyNode);
                edge.data('label', 'works at');
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
}
