import { createEdge, createNode, findNodeByProperty } from './utils.js';

export const processImdbProfile = (cy, message) => {
    const contentDiv = document.getElementById('content');
    contentDiv.textContent = `
          Profile Type: ${JSON.stringify(message.profile.type)} \n
          Profile: ${JSON.stringify(message.profile)}
          IMDB URL: ${message.imdbUrl}
        `;

    let newNodes = cy.collection();
    const profile = message.profile;
    if (profile.type === 'name') {
        let nameNode = findNodeByProperty(cy, 'label', profile.name);
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
            profile.portfolio.forEach(activity => {
                let titleNode = findNodeByProperty(cy, 'label', activity.title);
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
         
                const edge = createEdge(cy, nameNode, titleNode);
                edge.data('label', activity.perspective);
                edge.data('type', activity.perspective);
                edge.data('character', activity.character[0]);
                
            });
        }
    }

    if (profile.type === 'title') {
        let titleNode = findNodeByProperty(cy, 'label', profile.name);
        if (!titleNode) {
            titleNode = createNode(cy, profile.name);
            titleNode.data('url', message.imdbUrl);
            titleNode.data('type', profile.type);
            
            titleNode.data('subtype', `imdb${profile.subtype}`);
            titleNode.data('shape', 'square');
            newNodes = newNodes.union(titleNode);
        }
        titleNode.data('rating', profile.rating.split('/')[0]);
        if (profile.image) titleNode.data('image', profile.image);
        if (profile.plot) titleNode.data('plot', profile.plot);
        if (profile.period) titleNode.data('period', profile.period);
        if (profile.chips) titleNode.data('tags', profile.chips);
        if (profile.Director) titleNode.data('director', profile.Director.reduce((acc, director) => acc + ', ' + director.name + ', ', ''));
        if (profile.Writers) titleNode.data('writers', profile.Writers.reduce((acc, writer) => acc + ', ' + writer.name + ', ', ''));
        if (profile.Creators) titleNode.data('creators', profile.Creators.reduce((acc, creator) => acc + ', ' + creator.name + ', ', ''));
        if (profile.cast) {
            profile.cast.forEach(actor => {
                let actorNode = findNodeByProperty(cy, 'label', actor.name);
                if (!actorNode) {
                    actorNode = createNode(cy, actor.name);
                    actorNode.data('url', actor.actorUrl);
                    actorNode.data('type', 'person');
                    actorNode.data('subtype', `actor`);
                    actorNode.data('shape', 'star');
                    newNodes = newNodes.union(actorNode);
                }
                if (actor.image) actorNode.data('image', actor.image);
                const edge = createEdge(cy, actorNode, titleNode);
                edge.data('label', 'acted in');
                edge.data('type', 'actedIn');
                edge.data('role', actor.characterName);
                edge.data('details', actor.details);
            });
        }

        // personNode.data('about', profile.about);
        // if (profile.location) personNode.data('location', profile.location);

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
