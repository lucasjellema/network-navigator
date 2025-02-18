import { getSelectedNodes, getSavedGraphs, getGraphById, generateGUID, saveCurrentGraph, loadGraph, getCurrentGraph, saveGraph, createNode } from './utils.js';
import { setTitle } from './ui.js';


let graphContextMenu, addNodeButton, addEdgeButton, selectAllNodesButton, editModeButton, createGraphButton, viewGraphsButton, exportGraphButton, exportOnlyVisibleGraphButton, importGraphButton, importRemoteGraphButton, importMergeGraphButton

document.addEventListener('networkNavigatorContentLoaded', function () {

 graphContextMenu = document.getElementById('graph-context-menu');
 addNodeButton = document.getElementById('add-node');
 selectAllNodesButton = document.getElementById('select-all-nodes');
 editModeButton = document.getElementById('edit-mode-toggle');
 createGraphButton = document.getElementById('create-new-graph');
 viewGraphsButton = document.getElementById('view-saved-graphs');
 exportGraphButton = document.getElementById('export-graph');
 exportOnlyVisibleGraphButton = document.getElementById('export-visible-graph');
 importGraphButton = document.getElementById('import-graph');
 importRemoteGraphButton = document.getElementById('import-remote-graph');
 importMergeGraphButton = document.getElementById('import-merge-graph');

 graphContextMenu.addEventListener('contextmenu', (event) => { // do not show a context menu on the context menu
    event.preventDefault();
});
})


let clickedPosition
let editMode = false



export const addGraphContextMenu = (cy) => {
    initialiseViewGraphsButton(cy);
    initialiseCreateGraphsButton(cy);
    initialiseAddNodeButton(cy);
    initialiseSelectAllNodesButton(cy);
    initialiseEditModeButton(cy);
    initialiseExportGraphButton(cy);
    initialiseExportVisibleGraphButton(cy);
    initialiseImportGraphButton(cy);
    initialiseImportRemoteGraphButton(cy);
    initialiseImportMergeGraphButton(cy);
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
        exportGraphToJsonFile(cy, false); // onlySelected = false
        hideGraphContextMenu(); // Hide the context menu
    });
}

const initialiseExportVisibleGraphButton = (cy) => {
    exportOnlyVisibleGraphButton.addEventListener('click', () => {
        exportGraphToJsonFile(cy, true); // onlyVisible = false
        hideGraphContextMenu(); // Hide the context menu
    });
}


const initialiseEditModeButton = (cy) => {
    editModeButton.addEventListener('click', () => {
        editMode = !editMode;
        document.dispatchEvent(new CustomEvent("editModeToggled", { detail: { editMode: editMode } })); // inform any consumers that editMode is toggled
        updateGraphContextMenuForEditMode(cy, editMode);
        editModeButton.innerHTML = editMode ? 'Exit Edit Mode' : 'Enter Edit Mode';
        hideGraphContextMenu(); // Hide the context menu
    });
}
const updateGraphContextMenuForEditMode = (cy, editMode) => {
    if (editMode) {
        addNodeButton.style.display = 'none';
        createGraphButton.style.display = 'none';
    } else {
        addNodeButton.style.display = 'block';
        createGraphButton.style.display = 'block';
    }
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


const getJSONFile = (url) => {
    return new Promise((resolve, reject) => {
        fetch(url, { method: 'GET' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                resolve(response.json())
            })
            .catch(err =>
                resolve(1)
            );
    })
}
const initialiseImportRemoteGraphButton = (cy) => {
    importRemoteGraphButton.addEventListener('click', async (event) => {
        const remoteGraphURL = prompt("Enter URL for remote graph:");

        if (remoteGraphURL) {
            try {
                const graphData = await getJSONFile(remoteGraphURL)
                // assign new graphData.id ??
                const newId = generateGUID();
                saveGraph(newId, graphData.title, graphData.description, graphData.elements);
                console.log('Graph successfully imported:', graphData);
                loadGraph(cy, getGraphById(graphData.id));
            } catch (error) {
                console.error('Invalid JSON file:', error);
                alert('Failed to import graph. Please make sure the file is a valid JSON.');
            }
        }
        hideGraphContextMenu(); // Hide the context menu
    });
}


const initialiseImportMergeGraphButton = (cy) => {
    importMergeGraphButton.addEventListener('change', (event) => {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const graphData = JSON.parse(e.target.result);
                    const nodeIdMap = {};
                    // iterate over all nodes in the imported graph
                    for (const node of graphData.elements) {
                        // check if the node already exists in the current graph
                        if (node.group === 'nodes') {
                            let existingNode = cy.$id(node.data.id)[0] || null;
                            if (!existingNode) {
                                // find node of same type and with same label
                                const matchingNodes = cy.filter(function (element, i) {
                                    return element.isNode() && leement.data('label') === node.data.label && element.data('type') === node.data.type;
                                })
                                if (matchingNodes.length > 0) {
                                    existingNode = matchingNodes[0];
                                }
                            }
                            if (existingNode) {
                                console.log(`Node ${node.data.id} already exists:`, existingNode.data('id'));
                                // TODO merge node into existing node
                                nodeIdMap[node.data.id] = existingNode.data('id');
                                mergeNodes(node, existingNode);
                            } else {
                                console.log(`Node ${node.data.id} does not exist:`, node.data.id);
                                cy.add(node);
                                nodeIdMap[node.data.id] = node.data.id;
                            }
                        }
                    }
                    console.log(nodeIdMap);
                    console.log('Start on edges');
                    for (const edge of graphData.elements) {

                        if (edge.group === 'edges') {
                            console.log(`Edge ${edge.data.id} is processed:`, edge.data.id);

                            const sourceId = edge.data.source;
                            const targetId = edge.data.target;
                            edge.data.source = nodeIdMap[sourceId];
                            edge.data.target = nodeIdMap[targetId];
                            let existingEdge = cy.$id(edge.data.id)[0] || null;
                            if (!existingEdge) {
                                // find edge of same type and with same label
                                const matchingEdges = cy.filter(function (element, i) {
                                    return element.isEdge() && element.data('label') === edge.data.label && element.data('type') === edge.data.type
                                        && element.data('source') === edge.data.source && element.data('target') === edge.data.target;
                                })
                                if (matchingEdges.length > 0) {
                                    existingEdge = matchingEdges[0];
                                }
                            }


                            if (!existingEdge) {

                                // TODO find existing edge by source and target and type & label / key? (and merge into it)
                                console.log(`Edge ${edge.data.id} does not exist:`, edge.data.id);
                                cy.add(edge);

                            } else {
                                console.log(`Edge ${edge.data.id} already exists:`, existingEdge.data('id'));
                                mergeNodes(edge, existingEdge);
                            }
                        }
                    }

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

const mergeNodes = (sourceNode, targetNode) => {
    // iterate over all properties in sourceNode
    for (const [key, value] of Object.entries(sourceNode.data)) {
        if (key === 'id' || key === 'type') continue;
        targetNode.data(key, sourceNode.data[key]);
        console.log('Merged property', key, value);
    }
}



const mergeEdges = (sourceEdge, targetEdge) => {
    // iterate over all properties in sourceEdge
    for (const [key, value] of Object.entries(sourceEdge.data)) {
        if (key === 'id' || key === 'type' || key === 'source' || key === 'target') continue;
        targetEdge.data(key, sourceEdge.data[key]);
        console.log('Merged property', key, value);
    }
}

const initialiseAddNodeButton = (cy) => {
    addNodeButton.addEventListener('click', () => {
        const newNode = createNode(cy, 'New Node');
        newNode.position({ x: clickedPosition.x, y: clickedPosition.y });
        hideGraphContextMenu(); // Hide the context menu
    });
}
const initialiseSelectAllNodesButton = (cy) => {
    selectAllNodesButton.addEventListener('click', () => {
        cy.nodes(':visible').select();
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

function exportGraphToJsonFile(cy, onlyVisible) {
    let graphJson = getCurrentGraph(cy);

    if (onlyVisible) graphJson.elements = cy.elements(':visible').map(ele => ele.json());


    //
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
}
