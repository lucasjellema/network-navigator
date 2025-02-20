import { createEdge, createNode, findNodeByProperty, findNodeByProperties, createEdgeWithLabel } from './utils.js';

export const processWikipediaProfile = (cy, message) => {
    const profile = message.profile;
    const contentDiv = document.getElementById('content');
    contentDiv.textContent = `
          Profile: ${JSON.stringify(message.profile)}
          Wikipedia URL: ${profile.pageUrl}
        `;

    let newNodes = cy.collection();
    if (profile.type === 'technology') {
        processTechnology(cy, profile, newNodes);
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
function processTechnology(cy, profile, newNodes) {
    let title = profile.pageTitle.replace('- Wikipedia', '').trim();
    let techNode = findNodeByProperties(cy, { 'label': title, 'type': 'technology' });
    if (!techNode) {
        techNode = createNode(cy, title);
        techNode.data('url', profile.pageUrl);
        techNode.data('type', 'technology');
        techNode.data('subtype', profile['Type']);
        techNode.data('shape', 'square');
        newNodes = newNodes.union(techNode);
    }
    if (profile.image) techNode.data('image', profile.image);
    if (profile['Website']) techNode.data('websiteUrl', profile['Website']);
    // License, Stable Release, Repository
    if (profile['License']) techNode.data('license', profile['License']);
    if (profile['Stable release']) techNode.data('stableRelease', profile['Stable release']);
    if (profile['Repository']) techNode.data('repositoryUrl', profile['Repository']);
    // headline

    if (profile.headline) techNode.data('headline', profile.headline);
    // Initial release

    if (profile['Initial release']) techNode.data('initialRelease', profile['Initial release']);
    // Developer(s)

    if (profile['Developer(s)']) techNode.data('developer', profile['Developer(s)']);
    // Written in

    if (profile['Written in']) techNode.data('writtenIn', profile['Written in']);
    // if (profile.similarBooks) {
    //     let i = 0;
    //     for (const similarBook of profile.similarBooks) {
    //         if (i++ > 4) break;
    //         // TODO break after a user defined number
    //         let similarBookNode = findNodeByProperties(cy, {'label': similarBook.title, 'type': 'book'}); 
    //         if (!similarBookNode) {
    //             similarBookNode = createNode(cy, similarBook.title);
    //             similarBookNode.data('url', similarBook.pageUrl);
    //             similarBookNode.data('type', 'book');
    //             similarBookNode.data('subtype', `goodreads-book`);
    //             similarBookNode.data('shape', 'square');
    //             newNodes = newNodes.union(similarBookNode);
    //         }
    //         if (similarBook.image) similarBookNode.data('image', similarBook.image);
    //         if (similarBook.rating) similarBookNode.data('rating', similarBook.rating);
    //         const similarBookEdge = createEdge(cy, bookNode, similarBookNode);
    //         similarBookEdge.data('label', 'similar to');

    //         let authorOfSimilarBookNode = findNodeByProperties(cy, {'label': similarBook.author, 'type': 'person'});// findNodeByProperty(cy, 'label', similarBook.author);
    //         if (!authorOfSimilarBookNode) {
    //             authorOfSimilarBookNode = createNode(cy, similarBook.author);
    //             authorOfSimilarBookNode.data('type', 'person');
    //             authorOfSimilarBookNode.data('subtype', `goodreads-author`);
    //             authorOfSimilarBookNode.data('shape', 'triangle');
    //             newNodes = newNodes.union(authorOfSimilarBookNode);
    //         }
    //         const similarWrittenByEdge  = createEdgeWithLabel  (cy,  authorOfSimilarBookNode, similarBookNode, 'author of', true)

    //         similarWrittenByEdge.data('type', 'author');

    //     }
    // }

    // let authorNode = findNodeByProperties(cy, {'label': profile.author, 'type': 'person'}); //findNodeByProperty(cy, 'label', profile.author);
    // if (!authorNode) {
    //     authorNode = createNode(cy, profile.author);
    //     authorNode.data('type', 'person');
    //     authorNode.data('subtype', `goodreads-author`);
    //     authorNode.data('shape', 'triangle');
    //     newNodes = newNodes.union(authorNode);
    // }
    // authorNode.data('url', profile.authorUrl);
    // authorNode.data('image', profile.authorImage);
    // const edge = createEdgeWithLabel  (cy, authorNode, bookNode, 'author of', true)

    // edge.data('type', 'author');
}

function processAuthor(cy, profile, newNodes) {
    let authorNode = findNodeByProperties(cy, { 'label': profile.name, 'type': 'person' });
    if (!authorNode) {
        authorNode = createNode(cy, profile.name);
        authorNode.data('url', profile.pageUrl);
        authorNode.data('type', profile.subtype);
        authorNode.data('subtype', `goodreads-author`);
        authorNode.data('shape', 'triangle');
        newNodes = newNodes.union(authorNode);
    }
    if (profile.image) authorNode.data('image', profile.image);
    if (profile.description) authorNode.data('biography', profile.description);
    if (profile.birthplace) authorNode.data('birthplace', profile.birthplace);
    if (profile.birthdate) authorNode.data('birthdate', profile.birthdate);
    if (profile.died) authorNode.data('died', profile.died);
    if (profile.genres) authorNode.data('genres', profile.genres);

    if (profile.books)
        for (const book of profile.books) {
            let bookNode = findNodeByProperties(cy, { 'label': book.title, 'type': 'book' });
            if (!bookNode) {
                bookNode = createNode(cy, book.title);
                bookNode.data('url', book.goodreadsUrl);
                bookNode.data('image', book.image);
                bookNode.data('rating', book.avgRating);
                bookNode.data('type', 'book');
                bookNode.data('subtype', `goodreads-book`);
                bookNode.data('shape', 'square');
                newNodes = newNodes.union(bookNode);
            }
            const edge = createEdgeWithLabel(cy, authorNode, bookNode, 'author of', true)
            edge.data('type', 'author');
        }
}