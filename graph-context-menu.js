import { getSelectedNodes, getSavedGraphs, getGraphById , generateGUID,saveCurrentGraph, loadGraph} from './utils.js';
import { setTitle } from './ui.js';
const graphContextMenu = document.getElementById('graph-context-menu');
const addNodeButton = document.getElementById('add-node');
const createGraphButton = document.getElementById('create-new-graph');
const viewGraphsButton = document.getElementById('view-saved-graphs');

graphContextMenu.addEventListener('contextmenu', (event) => { // do not show a context menu on the context menu
    event.preventDefault();
});

export const addGraphContextMenu = (cy) => {
    initialiseViewGraphsButton(cy);
    initialiseCreateGraphsButton(cy);
    cy.on('cxttap', (event) => {

        if (event.target === cy) {
            const pos = event.renderedPosition;
            graphContextMenu.style.left = `${pos.x}px`;
            graphContextMenu.style.top = `${pos.y}px`;
            graphContextMenu.style.display = 'block';
            // Save clicked position for adding the node
            let clickedPosition = event.position;
        }

    });
}

const initialiseCreateGraphsButton = (cy) => {
createGraphButton.addEventListener('click', () => {
    createNewGraph(cy);
    hideGraphContextMenu(); // Hide the context menu
});
}

const createNewGraph = (cy) => {
    console.log('creating new graph');
    const newId = generateGUID();
    localStorage.setItem('currentGraphId', newId); // Track the new graph ID
    console.log("new id and remove");
    cy.elements().remove(); // Clear the existing graph
    document.getElementById('graph-title').value = "New Graph";
    document.getElementById('graph-description').value = '';
    console.log("save new graph");
    setTitle('New Graph');
    saveCurrentGraph(cy);
}

export const hideGraphListModal = () => {
    const graphListModal = document.getElementById('graphs-overview');
    graphListModal.style.display = 'none';
}

const initialiseViewGraphsButton = (cy) => {
    viewGraphsButton.addEventListener('click', (event) => {
        hideGraphContextMenu();
        const savedGraphs = getSavedGraphs();
        const graphList = savedGraphs
            .map((graph) => `<div class="graph-item" data-id="${graph.id}">${graph.title} - ${graph.description}</div>`)
            .join('');

        const graphListModal = document.getElementById('graphs-overview');
        graphListModal.innerHTML = `
      <div style="background: white; padding: 20px; border: 1px solid #ccc;">
        <h3>Saved Graphs</h3>
        ${graphList || '<p>No graphs saved.</p>'}
        <button id="close-modal">Close</button>
      </div>
    `;
        graphListModal.style.left = `${event.x + 15}px`;
        graphListModal.style.top = `${event.y + 15}px`;
        graphListModal.style.display = "block";
        // Handle graph selection
        document.querySelectorAll('.graph-item').forEach((item) => {
            item.addEventListener('click', (event) => {
                const graphId = event.target.getAttribute('data-id');
                const selectedGraph = getGraphById(graphId);
                if (selectedGraph) {
                   loadGraph(cy, selectedGraph);
                }
                hideGraphListModal();
            });
        });

        // Close modal
        document.getElementById('close-modal').addEventListener('click', () => {
            hideGraphListModal();
        });


    });
}

export const hideGraphContextMenu = () => {
    graphContextMenu.style.display = 'none';
}