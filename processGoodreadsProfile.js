import { createEdge, createNode, findNodeByProperty, createEdgeWithLabel } from './utils.js';

export const processGoodreadsProfile = (cy, message) => {
    const profile = message.profile;
    const contentDiv = document.getElementById('content');
    contentDiv.textContent = `
          Profile Type: ${JSON.stringify(message.profile.type)} \n
          Profile: ${JSON.stringify(message.profile)}
          Goodreads URL: ${profile.pageUrl}
        `;

    let newNodes = cy.collection();
    if (profile.subtype === 'book') {
        processBook(cy, profile, newNodes);
    }            
    if (profile.subtype === 'person') {
        processAuthor(cy, profile, newNodes);
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
function processBook(cy, profile, newNodes) {
    let bookNode = findNodeByProperty(cy, 'label', profile.title);
    if (!bookNode) {
        bookNode = createNode(cy, profile.title);
        bookNode.data('url', profile.pageUrl);
        bookNode.data('type', profile.subtype);
        bookNode.data('subtype', `goodreads${profile.subtype}`);
        bookNode.data('shape', 'square');
        newNodes = newNodes.union(bookNode);
    }
    if (profile.image) bookNode.data('image', profile.image);
    if (profile.isbn) bookNode.data('isbn', profile.isbn);
    if (profile.language) bookNode.data('language', profile.language);
    if (profile.truncatedContent) bookNode.data('synopsis', profile.truncatedContent);
    if (profile.publicationInfo) bookNode.data('publicationInfo', profile.publicationInfo);
    if (profile.rating) bookNode.data('rating', profile.rating);

    if (profile.similarBooks) {
        let i = 0;
        for (const similarBook of profile.similarBooks) {
            if (i++ > 4) break;
            // TODO break after a user defined number
            let similarBookNode = findNodeByProperty(cy, 'label', similarBook.title);
            if (!similarBookNode) {
                similarBookNode = createNode(cy, similarBook.title);
                similarBookNode.data('url', similarBook.pageUrl);
                similarBookNode.data('type', 'book');
                similarBookNode.data('subtype', `goodreads-book`);
                similarBookNode.data('shape', 'square');
                newNodes = newNodes.union(similarBookNode);
            }
            if (similarBook.image) similarBookNode.data('image', similarBook.image);
            if (similarBook.rating) similarBookNode.data('rating', similarBook.rating);
            const similarBookEdge = createEdge(cy, bookNode, similarBookNode);
            similarBookEdge.data('label', 'similar to');

            let authorOfSimilarBookNode = findNodeByProperty(cy, 'label', similarBook.author);
            if (!authorOfSimilarBookNode) {
                authorOfSimilarBookNode = createNode(cy, similarBook.author);
                authorOfSimilarBookNode.data('type', 'person');
                authorOfSimilarBookNode.data('subtype', `goodreads-author`);
                authorOfSimilarBookNode.data('shape', 'triangle');
                newNodes = newNodes.union(authorOfSimilarBookNode);
            }
            const similarWrittenByEdge  = createEdgeWithLabel  (cy,  authorOfSimilarBookNode, similarBookNode, 'author of', true)
            edge.data('type', 'author');    
            similarWrittenByEdge.data('type', 'author');

        }
    }

    let authorNode = findNodeByProperty(cy, 'label', profile.author);
    if (!authorNode) {
        authorNode = createNode(cy, profile.author);
        authorNode.data('type', 'person');
        authorNode.data('subtype', `goodreads-author`);
        authorNode.data('shape', 'triangle');
        newNodes = newNodes.union(authorNode);
    }
    authorNode.data('url', profile.authorUrl);
    authorNode.data('image', profile.authorImage);
    const edge = createEdgeWithLabel  (cy, authorNode, bookNode, 'author of', true)

    edge.data('type', 'author');
}

function processAuthor(cy, profile, newNodes) {
    let authorNode = findNodeByProperty(cy, 'label', profile.name);
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
        let bookNode = findNodeByProperty(cy, 'label', book.title);
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
        const edge = createEdgeWithLabel  (cy, authorNode, bookNode, 'author of', true)
        edge.data('type', 'author');
    }
}