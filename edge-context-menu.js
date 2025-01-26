import { getSelectedNodes, createEdge } from './utils.js';
import { editEdge } from './modal-element-editor.js';

const edgeContextMenu = document.getElementById('edge-context-menu');
edgeContextMenu.addEventListener('contextmenu', (event) => { // do not show a context menu on the context menu
    event.preventDefault();
});

export const addEdgeContextMenu = (cy) => {

    cy.on('cxttap', 'edge', (event) => {
        event.originalEvent.preventDefault(); // Prevent default browser context menu
        const selectedEdge = event.target; // Get the clicked node
        // remove child elements of edgeContextMenu
        edgeContextMenu.innerHTML = '';
        // Get the rendered position of the click
        const clickPosition = event.renderedPosition;
        edgeContextMenu.style.left = `${clickPosition.x + 10}px`;
        edgeContextMenu.style.top = `${clickPosition.y + 10}px`;

        edgeContextMenu.style.display = 'block';

        const deleteEdgeButton = document.createElement('button');
        deleteEdgeButton.textContent = 'Delete Edge ';
        deleteEdgeButton.addEventListener('click', () => {
            deleteEdge(selectedEdge);
            hideEdgeContextMenu();

        });
        edgeContextMenu.appendChild(deleteEdgeButton);

        const editEdgeButton = document.createElement('button');
        editEdgeButton.textContent = 'Edit Edge ' + selectedEdge.data('label');
        editEdgeButton.addEventListener('click', () => {
            editEdge(selectedEdge);
            hideEdgeContextMenu();

        });
        edgeContextMenu.appendChild(editEdgeButton);

    })
}

export const hideEdgeContextMenu = () => {
    edgeContextMenu.style.display = 'none';
}

const deleteEdge = (selectedEdge) => {
    selectedEdge.remove();
    hideEdgeContextMenu();
}