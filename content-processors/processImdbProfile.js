import { createEdge, createNode, findNodeByProperty, findNodeByProperties, createEdgeWithLabel } from '../utils.js';
import { determineLimit } from './content-processor-utils.js';

export const processImdbProfile = (cy, message, imdbScrapeConfiguration) => {
    const contentDiv = document.getElementById('content');
    contentDiv.textContent = `
          Profile Type: ${JSON.stringify(message.profile.type)} \n
          Profile: ${JSON.stringify(message.profile)}
          IMDB URL: ${message.imdbUrl}
        `;

    let newNodes = cy.collection();
    const profile = message.profile;
    if (profile.type === 'name') {
        newNodes = processPerson(cy, profile, message, newNodes, imdbScrapeConfiguration);
    }

    if (profile.type === 'title') {
        newNodes = processTitle(cy, profile, message, newNodes, imdbScrapeConfiguration);
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
function processTitle(cy, profile, message, newNodes, imdbScrapeConfiguration) {
    let titleNode = findNodeByProperties(cy, { 'label': profile.name, 'type': profile.type });
    let newTitle = false
    if (!titleNode) {
        //        if (imdbScrapeConfiguration.title === 'update' || linkedinScrapeConfiguration.person === 'add') {
        titleNode = createNode(cy, profile.name);
        titleNode.data('url', message.imdbUrl);
        titleNode.data('type', profile.type);

        titleNode.data('subtype', `imdb${profile.subtype}`);
        titleNode.data('shape', 'square');
        newNodes = newNodes.union(titleNode);
    }
    if (profile.rating) titleNode.data('rating', profile.rating.split('/')[0]);
    if (profile.image) titleNode.data('image', profile.image);
    if (profile.plot) titleNode.data('plot', profile.plot);
    if (profile.period) titleNode.data('period', profile.period);
    if (profile.chips) titleNode.data('tags', profile.chips); // TODO could be nodes in their own right?
    if (profile.Director) {
        let directorsString = ""
        for (const [index, director] of profile.Director.entries()) {
            directorsString = directorsString + director.title + ', '
            let directorNode = findNodeByProperties(cy, { 'label': director.name, 'type': 'person' });
            if (!directorNode) {
                directorNode = createNode(cy, director.name);
                directorNode.data('url', director.url);
                directorNode.data('type', 'person');
                newNodes = newNodes.union(directorNode);
            }
            const edge = createEdgeWithLabel(cy, titleNode, directorNode, 'directed by', true);
            edge.data('type', 'director');
            edge.data('seq', index);
        };
        titleNode.data('directors', directorsString.slice(0, -2));
    }
    if (profile.Writers) {
        let writersString = ""
        for (const [index, writer] of profile.Writers.entries()) {
            writersString = writersString + writer.title + ', '
            let writerNode = findNodeByProperties(cy, { 'label': writer.name, 'type': 'person' });
            if (!writerNode) {
                writerNode = createNode(cy, writer.name);
                writerNode.data('url', writer.url);
                writerNode.data('type', 'person');
                newNodes = newNodes.union(writerNode);
            }
            const edge = createEdgeWithLabel(cy, titleNode, writerNode, 'written by', true);
            edge.data('type', 'writer');
            edge.data('seq', index);
        };
        titleNode.data('writers', writersString.slice(0, -2));
    }
    if (profile.Creators) {
        let creatorsString = ""
        for (const [index, creator] of profile.Creators.entries()) {
            creatorsString = creatorsString + creator.title + ', '
            let creatorNode = findNodeByProperties(cy, { 'label': creator.name, 'type': 'person' });
            if (!creatorNode) {
                creatorNode = createNode(cy, creator.name);
                creatorNode.data('url', creator.url);
                creatorNode.data('type', 'person');
                creatorNode.data('shape', 'star');
                newNodes = newNodes.union(creatorNode);
            }
            const edge = createEdgeWithLabel(cy, titleNode, creatorNode, 'created by', true);
            edge.data('type', 'creator');
            edge.data('seq', index);
        };
        titleNode.data('creators', creatorsString.slice(0, -2));
    }
    if (profile.Stars) {
        let starsString=""
        for (const [index, star] of profile.Stars.entries()) {
            starsString = starsString + star.title +  ', '
            let starNode = findNodeByProperties(cy, { 'label': star.name, 'type': 'person' });
            if (!starNode) {
                starNode = createNode(cy, star.name);
                starNode.data('url', star.url);
                starNode.data('type', 'person');
                newNodes = newNodes.union(starNode);                
            }
            const edge = createEdgeWithLabel(cy, titleNode, starNode, 'acted in', true);
            edge.data('type', 'star');
            edge.data('seq', index);
        };
        titleNode.data('stars', starsString.slice(0, -2));
        
    }
    if (profile.moreLikeThis) {
        titleNode.data('moreLikeThis', profile.moreLikeThis.reduce((acc, otherTitle) => acc + ', ' + otherTitle.title, ''));

        let moreLikeThisString = ""
        for (const [index, otherTitle] of profile.moreLikeThis.entries()) {
            moreLikeThisString = moreLikeThisString + otherTitle.title + ', '
            let otherTitleNode = findNodeByProperties(cy, { 'label': otherTitle.title, 'type': 'title' });
            if (!otherTitleNode) {
                otherTitleNode = createNode(cy, otherTitle.title);
                otherTitleNode.data('url', otherTitle.titleUrl);
                otherTitleNode.data('type', 'title');
                otherTitleNode.data('shape', 'square');
                newNodes = newNodes.union(otherTitleNode);
            }
            if (otherTitle.image) otherTitleNode.data('image', otherTitle.image);
            if (otherTitle.rating) otherTitleNode.data('rating', otherTitle.rating);
            const edge = createEdgeWithLabel(cy, titleNode, otherTitleNode, 'like', true);
            edge.data('type', 'moreLikeThis');
            edge.data('seq', index);
        };
        titleNode.data('moreLikeThis', moreLikeThisString.slice(0, -2));

    }
    if (profile.cast) {
        let castString = ""
        for (const [index, actor] of profile.cast.entries()) {
            castString = castString + actor.name + ' (' + actor.characterName + '), '
            let actorNode = findNodeByProperties(cy, { 'label': actor.name, 'type': 'person' });
            if (!actorNode) {
                actorNode = createNode(cy, actor.name);
                actorNode.data('url', actor.actorUrl);
                actorNode.data('type', 'person');
                actorNode.data('subtype', `actor`);
                actorNode.data('shape', 'star');
                newNodes = newNodes.union(actorNode);
            }
            if (actor.image) actorNode.data('image', actor.image);
            const edge = createEdgeWithLabel(cy, actorNode, titleNode, 'acted in', true);
            edge.data('type', 'actedIn');
            edge.data('role', actor.characterName);
            edge.data('details', actor.details);
            edge.data('seq', index);
        };
        titleNode.data('cast', castString.slice(0, -2));
    }
    return newNodes;
}

const processPerson = (cy, profile, message, newNodes, imdbScrapeConfiguration) => {
    let nameNode = findNodeByProperties(cy, { 'label': profile.name, 'type': 'person' });
    if (!nameNode) {
        nameNode = createNode(cy, profile.name);
        nameNode.data('url', message.imdbUrl);
        nameNode.data('type', profile.type);
        nameNode.data('subtype', `imdb${profile.subtype}`);
        nameNode.data('shape', 'star');
        newNodes = newNodes.union(nameNode);
    }
    if (profile.image) nameNode.data('image', profile.image);
    if (profile.bio) nameNode.data('bio', profile.bio);
    if (profile.birthDate) nameNode.data('birthDate', profile.birthDate);
    if (profile.deathDate) nameNode.data('deathDate', profile.deathDate);

    if (profile.portfolio) {
        for (const [index, activity] of profile.portfolio.entries()) {
            let titleNode = findNodeByProperties(cy, { 'label': activity.title, 'type': 'title' }); //findNodeByProperty(cy, 'label', activity.title);
            if (!titleNode) {
                titleNode = createNode(cy, activity.title);
                titleNode.data('url', activity.url);
                titleNode.data('type', 'title');
                titleNode.data('subtype', `actor`);
                titleNode.data('shape', 'square');
                newNodes = newNodes.union(titleNode);
            }
            if (activity.image) titleNode.data('image', activity.image);
            if (activity.details) titleNode.data('year', activity.details[0]);

            const edge = createEdgeWithLabel(cy, nameNode, titleNode, activity.perspective, true);
            //  createEdge(cy, nameNode, titleNode);
            // edge.data('label', activity.perspective);
            edge.data('type', activity.perspective);
            edge.data('character', activity.character[0]);

        };
    }
    if (profile.knownFor) {
        for (const [index, activity] of profile.knownFor.entries()) {
            let titleNode = findNodeByProperties(cy, { 'label': activity.title, 'type': 'title' }); //findNodeByProperty(cy, 'label', activity.title);
            if (!titleNode) {
                titleNode = createNode(cy, activity.title);
                titleNode.data('url', activity.movieUrl);
                titleNode.data('type', 'title');
                titleNode.data('subtype', activity.type);
                titleNode.data('shape', 'square');
                newNodes = newNodes.union(titleNode);
            }
            if (activity.image) titleNode.data('image', activity.image);
            if (activity.period) titleNode.data('year', activity.period);
            if (activity.rating) titleNode.data('rating', activity.rating);
            if (activity.description) titleNode.data('description', activity.description);

            const edge = createEdgeWithLabel(cy, nameNode, titleNode, activity.character, true);
            edge.data('type', activity.character);
            edge.data('character', activity.character);

        };
    }

    return newNodes;
}

