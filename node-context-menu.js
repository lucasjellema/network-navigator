import { getSelectedNodes, createEdge, generateGUID } from './utils.js';
import { editNode } from './modal-element-editor.js';
import { showNodeDetails     }   from './modal-element-properties.js';

let editMode = false

document.addEventListener("editModeToggled", (event) => {
    editMode = event.detail.editMode;
    console.log("Edit mode toggled", editMode);
});

let nodeContextMenu
document.addEventListener('networkNavigatorContentLoaded', function () {
     nodeContextMenu = document.getElementById('node-context-menu');

    nodeContextMenu.addEventListener('contextmenu', (event) => { // do not show a context menu on the context menu
        event.preventDefault();
    });
    })

export const addNodeContextMenu = (cy) => {

    cy.on('cxttap', 'node', (event) => {
        event.originalEvent.preventDefault(); // Prevent default browser context menu
        const selectedNode = event.target; // Get the clicked node
        // remove child elements of nodeContextMenu
        nodeContextMenu.innerHTML = '';
        // Get the rendered position of the click
        const clickPosition = event.renderedPosition;
        nodeContextMenu.style.left = `${clickPosition.x + 10}px`;
        nodeContextMenu.style.top = `${clickPosition.y + 10}px`;
        nodeContextMenu.style.display = 'block';

        const detailsNodeButton = document.createElement('button');
        detailsNodeButton.textContent = 'Show Details for ' + selectedNode.data('label');
        detailsNodeButton.addEventListener('click', () => {
            showNodeDetails(cy,selectedNode);
            hideNodeContextMenu();

        });
        nodeContextMenu.appendChild(detailsNodeButton);

        if (editMode) {


            const deleteNodeButton = document.createElement('button');
            deleteNodeButton.textContent = 'Delete Node ' + selectedNode.data('label');
            deleteNodeButton.addEventListener('click', () => {
                deleteNode(selectedNode);
                hideNodeContextMenu();

            });
            nodeContextMenu.appendChild(deleteNodeButton);

            const editNodeButton = document.createElement('button');
            editNodeButton.textContent = 'Edit Node ' + selectedNode.data('label');
            editNodeButton.addEventListener('click', () => {
                editNode(cy, selectedNode);
                hideNodeContextMenu();

            });
            nodeContextMenu.appendChild(editNodeButton);

            if (selectedNode.data('parent')) {
                const orphanNodeButton = document.createElement('button');
                orphanNodeButton.textContent = 'Remove Node from Parent ';
                orphanNodeButton.addEventListener('click', () => {
                    orphanNode(cy, selectedNode);
                    hideNodeContextMenu();

                });
                nodeContextMenu.appendChild(orphanNodeButton);
            }

            // if selectedNode then add an option to the nodeContextMenu to merge that node to the one for which the context menu was opened
            const selectedNodes = getSelectedNodes(cy);

            if (selectedNodes.length > 0) {
                if (selectedNodes[0].id() !== selectedNode.id()) {
                    // merge nodes
                    const mergeNodeButton = document.createElement('button');
                    mergeNodeButton.textContent = 'Merge - absorb ' + selectedNodes[0].data('label');
                    mergeNodeButton.addEventListener('click', () => {
                        mergeNodes(cy, selectedNode, selectedNodes[0]);
                        hideNodeContextMenu();

                    });
                    nodeContextMenu.appendChild(mergeNodeButton);

                    // make node into child of selected node
                    const makeNodeChildButton = document.createElement('button');
                    makeNodeChildButton.textContent = 'Make Node child of ' + selectedNodes[0].data('label');
                    makeNodeChildButton.addEventListener('click', () => {
                        makeNodeChild(cy, selectedNode, selectedNodes[0]);
                        hideNodeContextMenu();
                    });
                    nodeContextMenu.appendChild(makeNodeChildButton);

                    const deleteSelectedNodesButton = document.createElement('button');
                    deleteSelectedNodesButton.textContent = `Delete All ${selectedNodes.length} Selected Nodes `;
                    deleteSelectedNodesButton.addEventListener('click', () => {
                        deleteAllSelectedNodes(cy);
                        hideNodeContextMenu();
        
                    });
                    nodeContextMenu.appendChild(deleteSelectedNodesButton);

                }
                // create edge from selectedNode to selectedNodes[0]
                const createEdgeButton = document.createElement('button');
                createEdgeButton.textContent = 'Create Edge to ' + selectedNodes[0].data('label');
                createEdgeButton.addEventListener('click', () => {
                    createEdge(cy, selectedNode, selectedNodes[0]);
                    hideNodeContextMenu();
                });
                nodeContextMenu.appendChild(createEdgeButton);
                // create edge from selectedNodes[0] to selectedNode
                const createEdgeButton2 = document.createElement('button');
                createEdgeButton2.textContent = 'Create Edge from ' + selectedNodes[0].data('label');
                createEdgeButton2.addEventListener('click', () => {
                    createEdge(cy, selectedNodes[0], selectedNode);
                    hideNodeContextMenu();

                });
                nodeContextMenu.appendChild(createEdgeButton2);

            }
        }
        const selectedNodes = getSelectedNodes(cy);
        if (selectedNodes.length > 0) {
            // show path from selectedNodes[0] to selectedNode (of it exists)
            const showPathButton = document.createElement('button');
            showPathButton.textContent = 'Show Path from ' + selectedNodes[0].data('label');
            showPathButton.addEventListener('click', () => {
                showPathFrom(cy, selectedNodes[0], selectedNode);
                hideNodeContextMenu();

            });
            nodeContextMenu.appendChild(showPathButton);
        }
    });
}

export const hideNodeContextMenu = () => {
    nodeContextMenu.style.display = 'none';
}

const deleteNode = (selectedNode) => {
    selectedNode.remove();
    hideNodeContextMenu();
}

const deleteAllSelectedNodes = (cy) => {
    const selectedNodes = getSelectedNodes(cy);
    selectedNodes.forEach((node) => {
        node.remove();
    });
    hideNodeContextMenu();
}

const mergeNodes = (cy, node1, node2) => {

    // Combine properties (customize as needed)

    const newNodeId = generateGUID();

    // merge properties from node1 and node2 - but do not include id and label


    const mergedProperties = {
        ...node1.data(),
        ...node2.data(),
        id: newNodeId,
        label: node1.data('label'),
    };

    // Add a new merged node at the midpoint between the two nodes
    const newPosition = {
        x: (node1.position('x') + node2.position('x')) / 2,
        y: (node1.position('y') + node2.position('y')) / 2,
    };

    const mergedNode = cy.add({
        group: 'nodes',
        data: mergedProperties,
        position: newPosition,
    });


    // Redirect edges
    cy.edges().forEach((edge) => {
        if (edge.source().id() === node1.id() || edge.source().id() === node2.id()) {
            edge.move({ source: mergedNode.id() });
        }
        if (edge.target().id() === node1.id() || edge.target().id() === node2.id()) {
            edge.move({ target: mergedNode.id() });
        }
    });

    // Remove the old nodes
    node1.remove();
    node2.remove();

    // Optional: Apply a visual effect to highlight the new node
    // mergedNode.flashAnimation();
}

const showPathFrom = (cy, startNode, destinationNode) => {
    cy.elements().removeClass('highlighted');
    const dijkstra = cy.elements().dijkstra({
        root: startNode,
        weight: edge => edge.data('weight') || 1,  // Default weight is 1 if not provided
        directed: false // walk edges only from source to target or in both directions
    });

    // Get the shortest path to the target node
    const path = dijkstra.pathTo(destinationNode);

    if (path.length > 0) {
        console.log('Shortest path found:', path.map(ele => ele.id()));
        path.addClass('highlighted'); // Highlight the path
        cy.scratch('shortestPath', path);
    } else {
        console.log('No path exists between the selected nodes.');
        alert('No path exists between the selected nodes.');
    }
};

const makeNodeChild = (cy, selectedNode, parentNode) => {
    selectedNode.move({ parent: parentNode.id() });
};

const orphanNode = (cy, selectedNode) => {
    selectedNode.move({ parent: null });
}
