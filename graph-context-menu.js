import { getSelectedNodes, getSavedGraphs, getGraphById, generateGUID, saveCurrentGraph, loadGraph, getCurrentGraph, saveGraph, createNode } from './utils.js';
import { setTitle } from './ui.js';
const graphContextMenu = document.getElementById('graph-context-menu');
const addNodeButton = document.getElementById('add-node');
const createGraphButton = document.getElementById('create-new-graph');
const viewGraphsButton = document.getElementById('view-saved-graphs');
const exportGraphButton = document.getElementById('export-graph');
const importGraphButton = document.getElementById('import-graph');

let clickedPosition

graphContextMenu.addEventListener('contextmenu', (event) => { // do not show a context menu on the context menu
    event.preventDefault();
});

export const addGraphContextMenu = (cy) => {
    initialiseViewGraphsButton(cy);
    initialiseCreateGraphsButton(cy);
    initialiseAddNodeButton(cy);
    initialiseExportGraphButton(cy);
    initialiseImportGraphButton(cy);
    cy.on('cxttap', (event) => {
        if (event.target === cy) {
            const pos = event.renderedPosition;
            graphContextMenu.style.left = `${pos.x}px`;
            graphContextMenu.style.top = `${pos.y}px`;
            graphContextMenu.style.display = 'block';
            // Save clicked position for adding the node
            clickedPosition = event.position;
        }
    });
}

const initialiseExportGraphButton = (cy) => {
    exportGraphButton.addEventListener('click', () => {
        const graphJson = getCurrentGraph(cy);
        // Convert JSON to a downloadable file
        const blob = new Blob([JSON.stringify(graphJson, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Create a temporary link to download the file
        const a = document.createElement('a');
        a.href = url;
        a.download = 'graph.json'; // File name for the download
        a.click();

        // Revoke the object URL to free up memory
        URL.revokeObjectURL(url);
        hideGraphContextMenu(); // Hide the context menu
    });
}

const initialiseImportGraphButton = (cy) => {
    importGraphButton.addEventListener('change', (event) => {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const graphData = JSON.parse(e.target.result);
                    saveGraph(graphData.id, graphData.title, graphData.description, graphData.elements);
                    console.log('Graph successfully imported:', graphData);
                    loadGraph(cy, getGraphById(graphData.id));

                } catch (error) {
                    console.error('Invalid JSON file:', error);
                    alert('Failed to import graph. Please make sure the file is a valid JSON.');
                }
            };
            // Read the file as text
            reader.readAsText(file);
        }
        hideGraphContextMenu(); // Hide the context menu
    });
}

const initialiseAddNodeButton = (cy) => {
    addNodeButton.addEventListener('click', () => {
        const newNode = createNode(cy, 'New Node');
        newNode.position({ x: clickedPosition.x, y: clickedPosition.y });
        hideGraphContextMenu(); // Hide the context menu
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