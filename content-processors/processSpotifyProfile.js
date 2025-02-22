import { createEdge, createNode, findNodeByProperty, findNodeByProperties, createEdgeWithLabel } from '../utils.js';

export const processSpotifyProfile = (cy, message) => {
    const profile = message.profile;
    const contentDiv = document.getElementById('content');
    contentDiv.textContent = `
          Profile: ${JSON.stringify(message.profile)}
          Spotify URL: ${profile.pageUrl}
        `;

    let newNodes = cy.collection();

    if (profile.subtype === 'artist') newNodes = processArtist(cy, profile, newNodes);
    else if (profile.subtype === 'album') newNodes = processAlbum(cy, profile, newNodes);
    else
        newNodes = processSong(cy, profile, newNodes);


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
function processSong(cy, profile, newNodes) {
    let title = profile.songTitle
    let songNode = findNodeByProperties(cy, { 'label': title, 'type': 'song' });
    if (!songNode) {
        songNode = createNode(cy, title);
        songNode.data('url', profile.pageUrl);
        songNode.data('type', 'song');
        songNode.data('subtype', 'song');
        songNode.data('shape', 'octagon');
        newNodes = newNodes.union(songNode);
    }
    if (profile.image) songNode.data('image', profile.image);
    // year, duration, performedBy
    if (profile.album) songNode.data('album', profile.album);
    if (profile.albumUrl) songNode.data('albumUrl', profile.albumUrl);
    if (profile.year) songNode.data('year', profile.year);
    if (profile.duration) songNode.data('duration', profile.duration);
    if (profile.performedBy) songNode.data('performedBy', profile.performedBy.map((artist) => artist).join(', '));
    if (profile.producedBy && profile.producedBy.length > 0) songNode.data('producedBy', profile.producedBy.map((artist) => artist).join(', '));
    if (profile.writtenBy) songNode.data('writtenBy', profile.writtenBy.map((artist) => artist).join(', '));

    let artistNode = findNodeByProperties(cy, { 'label': profile.artist, 'type': 'person' });
    if (!artistNode) {
        artistNode = createNode(cy, profile.artist);
        artistNode.data('url', profile.artistUrl);
        artistNode.data('type', 'person');
        artistNode.data('subtype', 'artist');
        newNodes = newNodes.union(artistNode);
    }
    if (profile.artistImage) artistNode.data('image', profile.artistImage);

    const artistEdge = createEdgeWithLabel(cy, songNode, artistNode, 'by', true);
    artistEdge.data('type', 'performer');

    let albumNode = findNodeByProperties(cy, { 'label': profile.album, 'type': 'album' });
    if (!albumNode) {
        albumNode = createNode(cy, profile.album);
        albumNode.data('url', profile.albumUrl);
        albumNode.data('type', 'album');
        albumNode.data('subtype', 'album');
        albumNode.data('shape', 'square');
        newNodes = newNodes.union(albumNode);
    }
    const albumEdge = createEdgeWithLabel(cy, songNode, albumNode, 'on', true);
    albumEdge.data('type', 'released on');
    // TODO writtenBy, producedBy, performedBy

    // TODO recommended
    if (profile.recommended) {
        for (const song of profile.recommended) {
            let recommendedSongNode = findNodeByProperties(cy, { 'label': song.songTitle, 'type': 'song' });
            if (!recommendedSongNode) {
                recommendedSongNode = createNode(cy, song.songTitle);
                recommendedSongNode.data('url', song.songUrl);
                recommendedSongNode.data('type', 'song');
                recommendedSongNode.data('subtype', 'song');
                recommendedSongNode.data('shape', 'octagon');
                newNodes = newNodes.union(recommendedSongNode);
            }
            if (song.image) recommendedSongNode.data('image', song.image);
            recommendedSongNode.data('artist', song.artist);
            recommendedSongNode.data('artistUrl', song.artistUrl);
            // TODO add artist of recommended song

            createEdgeWithLabel(cy, songNode, recommendedSongNode, 'recommended', true);
        }
    }
    return newNodes
}


function processArtist(cy, profile, newNodes) {

    let artistNode = findNodeByProperties(cy, { 'label': profile.artist, 'type': 'person' });
    if (!artistNode) {
        artistNode = createNode(cy, profile.artist);
        artistNode.data('url', profile.pageUrl);
        artistNode.data('type', 'person');
        artistNode.data('subtype', 'artist');
        newNodes = newNodes.union(artistNode);
    }
    if (profile.image) artistNode.data('image', profile.image);
    if (profile.description) artistNode.data('description', profile.description);

    if (profile.discography) {
        for (const disc of profile.discography) {
            let albumNode = findNodeByProperties(cy, { 'label': disc.name, 'type': 'album' });
            if (!albumNode) {
                albumNode = createNode(cy, disc.name);
                albumNode.data('url', disc.url);
                albumNode.data('type', 'album');
                albumNode.data('subtype', 'album');
                albumNode.data('shape', 'hexagon');
                newNodes = newNodes.union(albumNode);
            }
            if (disc.image) albumNode.data('image', disc.image);
            if (disc.releaseDate) albumNode.data('year', disc.releaseDate);
            const albumEdge = createEdgeWithLabel(cy, artistNode, albumNode, 'created', true);
            albumEdge.data('type', 'created');
        }
    }
    if (profile.fansAlsoLike) {
        for (const otherArtist of profile.fansAlsoLike) {
            let otherArtistNode = findNodeByProperties(cy, { 'label': otherArtist.name, 'type': 'person' });
            if (!otherArtistNode) {
                otherArtistNode = createNode(cy, otherArtist.name);
                otherArtistNode.data('url', otherArtist.url);
                otherArtistNode.data('type', 'person'); // person
                otherArtistNode.data('subtype', 'artist');  // artist
                newNodes = newNodes.union(otherArtistNode);
            }
            if (otherArtist.image) otherArtistNode.data('image', otherArtist.image);
            const otherArtistEdge = createEdgeWithLabel(cy, artistNode, otherArtistNode, 'also liked', true);
            otherArtistEdge.data('type', 'also liked');
        }
    }
    // TODO writtenBy, producedBy, performedBy
    return newNodes;
}


function processAlbum(cy, profile, newNodes) {

    let albumNode = findNodeByProperties(cy, { 'label': profile.name, 'type': 'album' });
    if (!albumNode) {
        albumNode = createNode(cy, profile.name);
        albumNode.data('url', profile.pageUrl);
        albumNode.data('type', 'album');
        albumNode.data('shape', 'square');
        newNodes = newNodes.union(albumNode);
    }
    if (profile.image) albumNode.data('image', profile.image);
    // also process properties duration, numberOfTracks, releaseYear
    if (profile.duration) albumNode.data('duration', profile.duration);
    if (profile.numberOfTracks) albumNode.data('numberOfTracks', profile.numberOfTracks);
    if (profile.releaseYear) albumNode.data('year', profile.releaseYear);

    let artistNode = findNodeByProperties(cy, { 'label': profile.artistName, 'type': 'person' });
    if (!artistNode) {
        artistNode = createNode(cy, profile.artistName);
        artistNode.data('url', profile.artistUrl);
        artistNode.data('type', 'person');
        artistNode.data('subtype', 'artist');
        newNodes = newNodes.union(artistNode);
    }
    if (profile.artistImage) artistNode.data('image', profile.artistImage);

    const albumEdge = createEdgeWithLabel(cy, artistNode, albumNode, 'created', true);
    albumEdge.data('type', 'created');
// TODO create individual song nodes, if so desired

    return newNodes;
}