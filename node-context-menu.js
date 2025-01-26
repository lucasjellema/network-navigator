import { getSelectedNodes, createEdge } from './utils.js';
const nodeContextMenu = document.getElementById('node-context-menu');
nodeContextMenu.addEventListener('contextmenu', (event) => { // do not show a context menu on the context menu
    event.preventDefault();
});

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

        const deleteNodeButton = document.createElement('button');
        deleteNodeButton.textContent = 'Delete Node ' + selectedNode.data('label');
        deleteNodeButton.addEventListener('click', () => {
            deleteNode(selectedNode);
            hideNodeContextMenu();

        });
        nodeContextMenu.appendChild(deleteNodeButton);

        // if selectedNode then add an option to the nodeContextMenu to merge that node to the one for which the context menu was opened
        const selectedNodes = getSelectedNodes(cy);

        if (selectedNodes.length > 0) {
            if (selectedNodes[0].id() === selectedNode.id()) {
                // merge nodes
                const mergeNodeButton = document.createElement('button');
                mergeNodeButton.textContent = 'Merge with ' + selectedNodes[0].data('label');
                mergeNodeButton.addEventListener('click', () => {
                    mergeNodes(selectedNode, selectedNodes[0]);
                    hideNodeContextMenu();

                });
                nodeContextMenu.appendChild(mergeNodeButton);
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
    });
}

export const hideNodeContextMenu = () => {
    nodeContextMenu.style.display = 'none';
}

const deleteNode = (selectedNode)=> {
    selectedNode.remove();
    hideNodeContextMenu();
}