# Chrome Extension - Network Navigator

This Chrome Extension adds a menu item to the context menu in case the menu is opened in the context of a link (an <a> element). When the item is activated, the properties of the link (text, url, title, ..) are captured from the DOM in the current document and communucated to the Side Panel. The Side Panel contains a graph data collection consisting of nodes (for pages) and edges (for links from a page to another page); this collection is visualized using the CytoscapeJS library.

The following mechanisms are at play:
* define permissions for contextMenus, sidePanel, activeTab and scripting in manifest.json
* define the context menu item in `background.js`
  * define the action to take when the item is cLicked: send message (to content.js), ask for link details, send response as message (to side_panel.js); the asynchronous single message-response is used with the active tab (where content.js listens for the message)
* in `content.js`: when a message of type *linkInfoRequest* is received, locate an `a` element in the DOM that has the same url as was passed from the link for which the context menu was clicked (or for which the link is within the local page itself and the combination of page source and local path is equal to the url from the context menu event); get the relevant details from that `a` element. NoteL: multiple elements can have that same `href` (url); the first one encountered in the DOM will be used. When the `<a>` is found and its properties are captured, a response message is sent (to `background.js`)
* the message is received in `background.js`. From it, a new message of type *linkInfo* is created and sent (to `side_panel.js`)
* in `side_panel.js` - the message is received and its contents is rendered in the `DIV` element (a little clunky but effective); the graphdata collection is extended and the Cytoscape instance is updated


## Network Graph

The Network Graph is visualized using Cytoscape JS - a JavaScript Library. 

The graph is stored in the browser local storage (after each change) and is reloaded when the extension is opened afresh. The graph data is used across instances of the browser on the same machine.

Nodes can be added from the context menu on the graph pane.
Edges can be added (in edit mode) by clicking on two different nodes
Edges can be removed (from the context menu on the edge)
(to be added) Nodes can be removed (from the context menu on the node)

Nodes can be filtered by label prefix. Nodes whose label fit with the filter are shown as well as edges between these nodes. Depending on the checkbox, all nodes referenced from these nodes are shown as well including the edged between all nodes. 

When a link is selected in the current web page and the option Add Link to Network Navigator is selected in the browser context menu, a node is added in the graph for both the current page and the referenced page with an edge between the two.

Todo:
* + download / upload graph data to/from JSON file
* filter nodes/edges on type / label / date
* + show image/icon in a node 
* + do not show tooltip when context menu is open
* + edit node properties
* + edit edge properties 
* + merge nodes (and have all edges connect to merge result)
* merge graphs
* + select multiple nodes - bulk delete
* delete graph
* + use combobox for editing node properties with (most frequently occuring) existing values
* load graph from URL (OCI, GitHub, ...)
* + show node details (not for editing)
* + show edge details
* * hide all nodes not in path

* LinkedIn addin - publishes
  * + name
  * + image (url)
  * + about/description
  * + company (role, from, until)
  * + location (country, area)
  * + university
  * education (history)
  * contacts - referenced people 

* Wikipedia addin for people (for example https://en.wikipedia.org/wiki/Steve_Jobs) - publishes
  * name
  * image (url)
  * about/description
  * company (role, from, until)
  * location of birth (country, area)
  * location of death (country, area)
  * university
  * contacts - referenced people 
  * birth date, death date
* 
* Wikipedia addin for technology (for example https://en.wikipedia.org/wiki/Adobe_InDesign) - publishes
  * name
  * logo
  * initial release year
  * type/tags
  * license
  * website
  * company/developers
  * related technology 
  * latest release (year, label)

* IMDB addin 
  * movies, series, character/role (cast, stars), actor, creator, director, 
    * + title
    * + release year
    * + storyline
    * + genres
    * + rating
    * + image
    * + url (on imdb)
  * role/character
    * + name
  * actor
    * + name
    * + image
    * + bio
    * + <other roles>
    * + url (on imdb)
    * + birthdate
    * birthplace
    * <social media>


## Useful information

### Node Shapes
nodes can have different shapes

in the style used for creating nodes:
```
style: [
          {
            selector: 'node',
            style: {
              'background-color': '#0074D9',
              label: 'data(label)',
              'text-valign': 'center',
              'text-halign': 'center',
              'color': '#fff',
              shape: 'data(shape)', // Shape comes from node data
            },
          },
```
the shape property can be set using a property in the object the node is based on. 
Each node’s shape is defined by its data.shape property.
The style shape: 'data(shape)' dynamically assigns shapes based on node data.
Values are:

ellipse (default)
triangle
rectangle
round-rectangle
bottom-round-rectangle
cut-rectangle
barrel
diamond
pentagon
hexagon
concave-hexagon
heptagon
octagon
star
tag
vee

If you need more control or custom shapes not provided by Cytoscape, you can create them using custom SVG or HTML elements with extensions like cytoscape-node-html-label.


### images in nodes 
Cytoscape.js supports displaying images inside nodes. You can use the background-image style property to set an image for a node. This is particularly useful for customizing nodes with logos, icons, or any other graphical representation.

```
elements: [
          { data: { id: 'node1', label: 'Node 1', image: 'https://via.placeholder.com/100' }, position: { x: 100, y: 100 } },
          { data: { id: 'node2', label: 'Node 2', image: 'https://via.placeholder.com/100/ff0000' }, position: { x: 200, y: 200 } },
          { data: { id: 'node3', label: 'Node 3', image: 'https://via.placeholder.com/100/00ff00' }, position: { x: 300, y: 100 } },
          { data: { source: 'node1', target: 'node2' } },
          { data: { source: 'node2', target: 'node3' } },
        ],
        style: [
          {
            selector: 'node',
            style: {
              'background-image': 'data(image)', // Use image from node data
              'background-fit': 'cover',        // Fit the image to the node size
              'background-opacity': 1,          // Ensure the image is fully visible
              'border-color': '#0074D9',
              'border-width': 2,
              'border-opacity': 1,
              label: 'data(label)',
              'text-valign': 'bottom',          // Place the text below the node
              'text-halign': 'center',
              'color': '#333',
              'font-size': 12,
              'background-color': '#eee',       // Background color for nodes without images
              width: 80,                        // Node width
              height: 80,                       // Node height
            },
          },
          {...
```          
Setting the Image:

The background-image style property is set to data(image), which dynamically assigns images based on the image attribute of the node's data.
Styling:

background-fit: 'cover': Ensures the image covers the entire node area.
background-opacity: 1: Makes the background image fully visible.
Width and height of the node (width and height) define the size of the image.
Fallback for Nodes Without Images:

A background-color is specified to handle nodes that do not have an image.

Circular or Square Nodes: Adjust the shape property (e.g., ellipse or rectangle) for circular or square nodes.

Multiple Images: Use background-image-crossfade and background-image-opacity to overlay multiple images.

Image Positioning: Customize the positioning with:

javascript
Copy
Edit
'background-position-x': '50%',
'background-position-y': '50%',
'background-clip': 'none',


## Add Euler Layout

* npm install cytoscape-euler
* move cytoscape-euler.js from node-modules to root of extension
* remove node-modules directory
* import cytoscape-euler.js in side_panel.html 