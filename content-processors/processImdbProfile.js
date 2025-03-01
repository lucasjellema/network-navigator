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
    if (profile.chips) {
        let chipsString = ""
        for (const [index, chip] of profile.chips.entries()) {
            chipsString = chipsString + chip + ', '
            if (imdbScrapeConfiguration.chips === 'property' || imdbScrapeConfiguration.chips === 'tags') continue
            let chipNode = findNodeByProperties(cy, { 'label': chip, 'type': 'chip' });
            if (!chipNode) {
                if (imdbScrapeConfiguration.chips === 'add' || imdbScrapeConfiguration.chips === 'update') {

                    chipNode = createNode(cy, chip);
                    chipNode.data('type', 'chip');
                    newNodes = newNodes.union(chipNode);
                }
                else {
                    continue
                }
            }
            const edge = createEdgeWithLabel(cy, titleNode, chipNode, 'type', true);
            edge.data('type', 'chip');
            edge.data('seq', index);
        };

        if (imdbScrapeConfiguration.chips === 'property') titleNode.data('chips', chipsString.slice(0, -2));
        if (imdbScrapeConfiguration.chips === 'tags') titleNode.data('chips', chipsString.split(', '));
    }
    if (profile.Director) {
        let directorsString = ""
        for (const [index, director] of profile.Director.entries()) {
            if (index >= imdbScrapeConfiguration.directorsLimit) break
            directorsString = directorsString + director.title + ', '
            let directorNode = findNodeByProperties(cy, { 'label': director.name, 'type': 'person' });
            if (!directorNode) {
                if (imdbScrapeConfiguration.Directors === 'add' || imdbScrapeConfiguration.Directors === 'update') {

                    directorNode = createNode(cy, director.name);
                    directorNode.data('url', director.url);
                    directorNode.data('type', 'person');
                    newNodes = newNodes.union(directorNode);
                }
                else {
                    continue
                }
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
            if (index >= imdbScrapeConfiguration.writersLimit) break
            writersString = writersString + writer.title + ', '
            let writerNode = findNodeByProperties(cy, { 'label': writer.name, 'type': 'person' });
            if (!writerNode) {
                if (imdbScrapeConfiguration.Writers === 'add' || imdbScrapeConfiguration.Writers === 'update') {

                    writerNode = createNode(cy, writer.name);
                    writerNode.data('url', writer.url);
                    writerNode.data('type', 'person');
                    newNodes = newNodes.union(writerNode);
                }
                else {
                    continue
                }
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
            if (index >= imdbScrapeConfiguration.creatorsLimit) break
            creatorsString = creatorsString + creator.title + ', '
            let creatorNode = findNodeByProperties(cy, { 'label': creator.name, 'type': 'person' });
            if (!creatorNode) {
                if (imdbScrapeConfiguration.Creators === 'add' || imdbScrapeConfiguration.Creators === 'update') {
                    creatorNode = createNode(cy, creator.name);
                    creatorNode.data('url', creator.url);
                    creatorNode.data('type', 'person');
                    creatorNode.data('shape', 'star');
                    newNodes = newNodes.union(creatorNode);
                } else {
                    continue
                }
            }
            const edge = createEdgeWithLabel(cy, titleNode, creatorNode, 'created by', true);
            edge.data('type', 'creator');
            edge.data('seq', index);
        };
        titleNode.data('creators', creatorsString.slice(0, -2));
    }
    if (profile.Stars) {
        let starsString = ""
        for (const [index, star] of profile.Stars.entries()) {
            if (index >= imdbScrapeConfiguration.starsLimit) break
            starsString = starsString + star.title + ', '
            let starNode = findNodeByProperties(cy, { 'label': star.name, 'type': 'person' });
            if (!starNode) {
                if (imdbScrapeConfiguration.Stars === 'add' || imdbScrapeConfiguration.Stars === 'update') {

                    starNode = createNode(cy, star.name);
                    starNode.data('url', star.url);
                    starNode.data('type', 'person');
                    newNodes = newNodes.union(starNode);
                }
                else {
                    continue
                }
            }
            const edge = createEdgeWithLabel(cy, titleNode, starNode, 'acted in', true);
            edge.data('type', 'star');
            edge.data('seq', index);
        };
        titleNode.data('stars', starsString.slice(0, -2));

    }
    if (profile.moreLikeThis) {
        //        titleNode.data('moreLikeThis', profile.moreLikeThis.reduce((acc, otherTitle) => acc + ', ' + otherTitle.title, ''));
        let limit = determineLimit(imdbScrapeConfiguration.moreLikeThisLimit, 1000)
        let ratingLimit = determineLimit(imdbScrapeConfiguration.moreLikeThisRatingLimit, 1)
        let moreLikeThisString = ""
        for (const [index, otherTitle] of profile.moreLikeThis.entries()) {
            if (index >= limit) break // TODO do not look at index but at number of titles that were over  rating and year limits
            if (otherTitle.rating < ratingLimit) continue

            moreLikeThisString = moreLikeThisString + otherTitle.title + ', '
            if (imdbScrapeConfiguration.moreLikeThis === 'property' || imdbScrapeConfiguration.moreLikeThis === 'tags') continue
            let newOtherNode = false
            let otherTitleNode = findNodeByProperties(cy, { 'label': otherTitle.title, 'type': 'title' });


            if (!otherTitleNode) {
                if (imdbScrapeConfiguration.moreLikeThis === 'add' || imdbScrapeConfiguration.moreLikeThis === 'update') {
                    otherTitleNode = createNode(cy, otherTitle.title);
                    otherTitleNode.data('url', otherTitle.titleUrl);
                    otherTitleNode.data('type', 'title');
                    otherTitleNode.data('shape', 'square');
                    newNodes = newNodes.union(otherTitleNode);
                    newOtherNode = true
                }
                else continue
            }
            if (newOtherNode || imdbScrapeConfiguration.moreLikeThis === 'update') {
                if (otherTitle.image) otherTitleNode.data('image', otherTitle.image);
                if (otherTitle.rating) otherTitleNode.data('rating', otherTitle.rating);
            }
            const edge = createEdgeWithLabel(cy, titleNode, otherTitleNode, 'like', true);
            edge.data('type', 'moreLikeThis');
            edge.data('seq', index);
        };
        titleNode.data('moreLikeThis', moreLikeThisString.slice(0, -2));
        if (imdbScrapeConfiguration.moreLikeThis === 'property') {
            titleNode.data('moreLikeThis', moreLikeThisString);
        }
        if (imdbScrapeConfiguration.moreLikeThis === 'tags') {
            titleNode.data('moreLikeThis', moreLikeThisString.split(', '));
        }

    }
    if (profile.cast) {
        let castString = ""
        for (const [index, actor] of profile.cast.entries()) {
            if (index >= imdbScrapeConfiguration.castLimit) break

            castString = castString + actor.name + ' (' + actor.characterName + '), '
            if (imdbScrapeConfiguration.cast === 'property' || imdbScrapeConfiguration.cast === 'tags') continue
            let newActorNode = false
            let actorNode = findNodeByProperties(cy, { 'label': actor.name, 'type': 'person' });
            if (!actorNode) {
                if (imdbScrapeConfiguration.cast === 'add' || imdbScrapeConfiguration.cast === 'update') {

                    actorNode = createNode(cy, actor.name);
                    actorNode.data('url', actor.actorUrl);
                    actorNode.data('type', 'person');
                    actorNode.data('subtype', `actor`);
                    actorNode.data('shape', 'star');
                    newNodes = newNodes.union(actorNode);
                    newActorNode = true
                }
                else continue
            }
            if (newActorNode || imdbScrapeConfiguration.cast === 'update') {
                if (actor.image) actorNode.data('image', actor.image);
            }

            const edge = createEdgeWithLabel(cy, actorNode, titleNode, 'acted in', true);
            edge.data('type', 'actedIn');
            edge.data('role', actor.characterName);
            edge.data('details', actor.details);
            edge.data('seq', index);
        };
        titleNode.data('cast', castString.slice(0, -2));
        if (imdbScrapeConfiguration.cast === 'property') {
            titleNode.data('cast', castString);
        }
        if (imdbScrapeConfiguration.cast === 'tags') {
            titleNode.data('cast', castString.split(', '));
        }

    }
    return newNodes;
}

const processPerson = (cy, profile, message, newNodes, imdbScrapeConfiguration) => {
    let nameNode = findNodeByProperties(cy, { 'label': profile.name, 'type': 'person' });
    let newperson = false
    if (!nameNode) {
        if (imdbScrapeConfiguration.person === 'add' || imdbScrapeConfiguration.person === 'update') {


            nameNode = createNode(cy, profile.name);
            nameNode.data('url', message.imdbUrl);
            nameNode.data('type', profile.type);
            nameNode.data('subtype', `imdb${profile.subtype}`);
            nameNode.data('shape', 'star');
            newNodes = newNodes.union(nameNode);
            newperson = true
        } else {
            return newNodes
        }
    }
    if (newperson || imdbScrapeConfiguration.persons === 'update') {
        if (profile.image) nameNode.data('image', profile.image);
        if (profile.bio) nameNode.data('bio', profile.bio);
        if (profile.birthDate) nameNode.data('birthDate', profile.birthDate);
        if (profile.deathDate) nameNode.data('deathDate', profile.deathDate);
    }
    if (profile.portfolio) {
        let portfolioString = ""
        const limit = determineLimit(imdbScrapeConfiguration.portfolioLimit, 2300);
        const ratingLimit = determineLimit(imdbScrapeConfiguration.portfolioRatingLimit, 1);
        const startyear = determineLimit(imdbScrapeConfiguration.portfolioYearLimit, 1899);
        for (const [index, activity] of profile.portfolio.entries()) {
            if (index >= limit) break
            if (activity.rating < ratingLimit) continue
            if (activity.year < startyear) continue
            portfolioString = portfolioString + activity.title + ' (' + activity.year + '), '
            if (imdbScrapeConfiguration.portfolio === 'property') continue
            let newTitleNode = false
            let titleNode = findNodeByProperties(cy, { 'label': activity.title, 'type': 'title' }); //findNodeByProperty(cy, 'label', activity.title);
            if (!titleNode) {
                if (imdbScrapeConfiguration.portfolio === 'add' || imdbScrapeConfiguration.portfolio === 'update') {
                    titleNode = createNode(cy, activity.title);
                    titleNode.data('url', activity.url);
                    titleNode.data('type', 'title');
                    titleNode.data('subtype', `actor`);
                    titleNode.data('shape', 'square');
                    newNodes = newNodes.union(titleNode);
                    newTitleNode = true
                } else {
                    continue;
                }
            }
            if (newTitleNode || imdbScrapeConfiguration.portfolio === 'update') {
                if (activity.image) titleNode.data('image', activity.image);
                if (activity.rating) titleNode.data('rating', activity.rating);
                if (activity.details) titleNode.data('year', activity.details[0]);
            }
            const edge = createEdgeWithLabel(cy, nameNode, titleNode, activity.perspective, true);
            //  createEdge(cy, nameNode, titleNode);
            // edge.data('label', activity.perspective);
            edge.data('type', activity.perspective);
            edge.data('character', activity.character[0]);

        };
        if (imdbScrapeConfiguration.portfolio === 'property') {
            nameNode.data('portfolio', portfolioString);
        }
    }
    if (profile.knownFor) {
        const limit = determineLimit(imdbScrapeConfiguration.knownForLimit, 2300);
        const ratingLimit = determineLimit(imdbScrapeConfiguration.knownForRatingLimit, 1);
        const startyear = determineLimit(imdbScrapeConfiguration.knownForStartyear, 1899);
        let knownForString = ""
        for (const [index, activity] of profile.knownFor.entries()) {
            if (index >= limit) break
            if (activity.rating < ratingLimit) continue
            if (activity.year < startyear) continue
            knownForString = knownForString + activity.title + ' (' + activity.year + '), '
            if (imdbScrapeConfiguration.knownFor === 'property') continue
            let newTitleNode = false
            let titleNode = findNodeByProperties(cy, { 'label': activity.title, 'type': 'title' }); //findNodeByProperty(cy, 'label', activity.title);
            if (!titleNode) {
                if (imdbScrapeConfiguration.knownFor === 'add' || imdbScrapeConfiguration.knownFor === 'update') {


                    titleNode = createNode(cy, activity.title);
                    titleNode.data('url', activity.movieUrl);
                    titleNode.data('type', 'title');
                    titleNode.data('subtype', activity.type);
                    titleNode.data('shape', 'square');
                    newNodes = newNodes.union(titleNode);
                    newTitleNode = true
                } else {
                    continue;
                }
            }
            if (newTitleNode || imdbScrapeConfiguration.knownFor === 'update') {
                if (activity.image) titleNode.data('image', activity.image);
                if (activity.period) titleNode.data('year', activity.period);
                if (activity.rating) titleNode.data('rating', activity.rating);
                if (activity.description) titleNode.data('description', activity.description);
            }
            const edge = createEdgeWithLabel(cy, nameNode, titleNode, activity.character, true);
            edge.data('type', activity.character);
            edge.data('character', activity.character);

        };
        if (imdbScrapeConfiguration.knownFor === 'property') {
            titleNode.data('knownFor', knownForString.slice(0, -2));
        }
    }

    return newNodes;
}

