import { getSelectedNodes, createEdge , createNode} from './utils.js';
import { editEdge } from './modal-element-editor.js';

const edgeContextMenu = document.getElementById('edge-context-menu');
edgeContextMenu.addEventListener('contextmenu', (event) => { // do not show a context menu on the context menu
    event.preventDefault();
});

let clickedPosition
export const addEdgeContextMenu = (cy) => {

    cy.on('cxttap', 'edge', (event) => {
        event.originalEvent.preventDefault(); // Prevent default browser context menu
        const selectedEdge = event.target; // Get the clicked node
        // remove child elements of edgeContextMenu
        edgeContextMenu.innerHTML = '';
        // Get the rendered position of the click
        clickedPosition = event.renderedPosition;
        edgeContextMenu.style.left = `${clickedPosition.x + 10}px`;
        edgeContextMenu.style.top = `${clickedPosition.y + 10}px`;
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
            editEdge(cy,selectedEdge);
            hideEdgeContextMenu();

        });
        edgeContextMenu.appendChild(editEdgeButton); 
        
        const edgeToNodeButton = document.createElement('button');
        edgeToNodeButton.textContent = 'Turn Edge into Node ' + selectedEdge.data('label');
        edgeToNodeButton.addEventListener('click', () => {
            edgeToNode(cy,selectedEdge);
            hideEdgeContextMenu();

        });
        edgeContextMenu.appendChild(edgeToNodeButton);

    })
}

export const hideEdgeContextMenu = () => {
    edgeContextMenu.style.display = 'none';
}

const deleteEdge = (selectedEdge) => {
    selectedEdge.remove();
    hideEdgeContextMenu();
}

const edgeToNode= (cy,selectedEdge) => {

    const sourceNode = cy.getElementById(selectedEdge.data('source'));
    const targetNode = cy.getElementById(selectedEdge.data('target'));
            const newNode = createNode(cy, selectedEdge.data('label'));
            newNode.position({ x: clickedPosition.x, y: clickedPosition.y });
    
            createEdge(cy, sourceNode, newNode);
            createEdge(cy, newNode, targetNode);
    
            selectedEdge.remove();
    
}