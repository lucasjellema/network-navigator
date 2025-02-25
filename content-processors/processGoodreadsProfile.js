import { createEdge, createNode, findNodeByProperty, findNodeByProperties, createEdgeWithLabel } from '../utils.js';

export const processGoodreadsProfile = (cy, message, goodreadsScrapeConfiguration) => {
    const profile = message.profile;
    const contentDiv = document.getElementById('content');
    contentDiv.textContent = `
          Profile: ${JSON.stringify(message.profile)}
          Goodreads URL: ${profile.pageUrl}
          Scrapeconfiguration: ${JSON.stringify(goodreadsScrapeConfiguration)}
        `;

    let newNodes = cy.collection();
    if (profile.subtype === 'book') {
        newNodes = processBook(cy, profile, newNodes, goodreadsScrapeConfiguration);
    }
    if (profile.subtype === 'person') {
        newNodes = processAuthor(cy, profile, newNodes, goodreadsScrapeConfiguration);
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
function processBook(cy, profile, newNodes, goodreadsScrapeConfiguration) {
    let bookNode = findNodeByProperties(cy, { 'label': profile.title, 'type': 'book' });
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
    // GENRES - add, edge  tags, property
    if (profile.genres) {
        if (goodreadsScrapeConfiguration.genres === "tags") {
            bookNode.genres = profile.genres
        }
        if (goodreadsScrapeConfiguration.genres === "property") {
            bookNode.genres = profile.genres.map((genre) => genre).join(', ')
        }
        if (goodreadsScrapeConfiguration.genres === "edge" || goodreadsScrapeConfiguration.genres === "add") {
            // for each genre, find node
            for (const genre of profile.genres) {
                let genreNode = findNodeByProperties(cy, { 'label': genre, 'type': 'genre' });

                // if node found, then create edge 

                if (!genreNode && goodreadsScrapeConfiguration.genres === "add") {
                    genreNode = createNode(cy, genre);
                    genreNode.data('type', 'genre');
                    genreNode.data('shape', 'round-rectangle');
                    newNodes = newNodes.union(genreNode);
                    
                }
                const bookGenreEdge = createEdgeWithLabel(cy, bookNode, genreNode, 'is', true);
            }
        }
    }

    if (profile.setting) {
        if (goodreadsScrapeConfiguration.setting === "tags") {
            bookNode.setting = profile.setting
        }
        if (goodreadsScrapeConfiguration.setting === "property") {
            bookNode.setting = profile.setting.map((setting) => setting).join(', ')
        }
        if (goodreadsScrapeConfiguration.setting === "edge" || goodreadsScrapeConfiguration.setting === "add") {
            // for each setting, find node
            for (const setting of profile.setting.split(',')) {
                let settingNode = findNodeByProperties(cy, { 'label': setting, 'type': 'setting' });

                // if node found, then create edge 

                if (!settingNode && goodreadsScrapeConfiguration.setting === "add") {
                    settingNode = createNode(cy, setting);
                    settingNode.data('type', 'setting');
                    settingNode.data('shape', 'round-rectangle');
                    newNodes = newNodes.union(settingNode);
                    
                }
                const bookSettingEdge = createEdgeWithLabel(cy, bookNode, settingNode, 'is', true);
            }
        }
    }
    if (profile.characters) {
        if (goodreadsScrapeConfiguration.characters === "tags") {
            bookNode.characters = profile.characters
        }
        if (goodreadsScrapeConfiguration.characters === "property") {
            bookNode.characters = profile.characters.map((character) => character).join(', ')
        }
        if (goodreadsScrapeConfiguration.characters === "edge" || goodreadsScrapeConfiguration.characters === "add") {
            // for each character, find node
            for (const character of profile.characters.split(',')) {
                let characterNode = findNodeByProperties(cy, { 'label': character, 'type': 'character' });
    
                // if node found, then create edge 
    
                if (!characterNode && goodreadsScrapeConfiguration.characters === "add") {
                    characterNode = createNode(cy, character);
                    characterNode.data('type', 'character');
                    characterNode.data('shape', 'round-rectangle');
                    newNodes = newNodes.union(characterNode);
                    
                }
                const bookcharacterEdge = createEdgeWithLabel(cy, bookNode, characterNode, 'is', true);
            }
        }
    }

    if (profile.similarBooks) {
        let i = 0;
        const upperLimit = goodreadsScrapeConfiguration.similarLimit ?? 4
        for (const similarBook of profile.similarBooks) {
            if (i++ > upperLimit) break;
            // TODO break after a user defined number
            let similarBookNode = findNodeByProperties(cy, { 'label': similarBook.title, 'type': 'book' });
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
            const similarBookEdge = createEdgeWithLabel(cy, bookNode, similarBookNode, 'similar to', true);

            let authorOfSimilarBookNode = findNodeByProperties(cy, { 'label': similarBook.author, 'type': 'person' });// findNodeByProperty(cy, 'label', similarBook.author);
            if (!authorOfSimilarBookNode) {
                authorOfSimilarBookNode = createNode(cy, similarBook.author);
                authorOfSimilarBookNode.data('type', 'person');
                authorOfSimilarBookNode.data('subtype', `goodreads-author`);
                authorOfSimilarBookNode.data('shape', 'triangle');
                newNodes = newNodes.union(authorOfSimilarBookNode);
            }
            const similarWrittenByEdge = createEdgeWithLabel(cy, authorOfSimilarBookNode, similarBookNode, 'author of', true)

            similarWrittenByEdge.data('type', 'author');

        }
    }

    let authorNode = findNodeByProperties(cy, { 'label': profile.author, 'type': 'person' }); //findNodeByProperty(cy, 'label', profile.author);
    if (!authorNode) {
        authorNode = createNode(cy, profile.author);
        authorNode.data('type', 'person');
        authorNode.data('subtype', `goodreads-author`);
        authorNode.data('shape', 'triangle');
        newNodes = newNodes.union(authorNode);
    }
    authorNode.data('url', profile.authorUrl);
    authorNode.data('image', profile.authorImage);
    const edge = createEdgeWithLabel(cy, authorNode, bookNode, 'author of', true)

    edge.data('type', 'author');
    return newNodes
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
    return newNodes
}