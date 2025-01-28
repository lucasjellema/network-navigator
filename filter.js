const filterButton = document.getElementById('filterButton');
const applyFilterButton = document.getElementById('applyFilter');
const resetFilterButton = document.getElementById('resetFilter');
const filterPanel = document.getElementById('filterPanel');
const closePanelButton = document.getElementById('closePanelButton'); 
const filterValueInput = document.getElementById('filterValue'); // .value.toLowerCase();
const includeConnectedCheckBox = document.getElementById('includeConnected'); //.checked
const includeSelectedCheckBox = document.getElementById('includeSelected'); //.checked


export const initializeFilter = (cy) => {
    filterButton.addEventListener('click', () => {
        filterPanel.style.display = 'block';
    });    

    applyFilterButton.addEventListener('click', () => {
        applyFilter(cy);
    })

    resetFilterButton.addEventListener('click', () => {
        resetFilter(cy);
    })
    closePanelButton.addEventListener('click', () => {
        closeFilterPanel();
    });    
} 


const closeFilterPanel= () =>  {
    filterPanel.style.display = 'none';
  }

  const resetFilter = (cy) =>  {
    cy.elements().show()
    filterValueInput.value = '';
    includeConnectedCheckBox.checked = false;
  }

  const applyFilter = (cy) =>  {
    const filterValue = filterValueInput.value.trim();
    const includeConnected = includeConnectedCheckBox.checked;
    if (filterValue) {
        // Reset all elements to hidden first
        cy.elements().hide();
        // add currently selected elements
        if (includeSelectedCheckBox.checked) {
            const selectedElements = cy.$(':selected');
            selectedElements.show();
        }
        // https://js.cytoscape.org/#collection/traversing 
        // Select nodes with the matching prefix
        const matchedNodes = cy.nodes().filter((node) =>
            node.data('label').startsWith(filterValue)
        );

        // Show matched nodes
        matchedNodes.show();

        if (includeConnected) {
            // Show nodes referenced from the matched nodes (through the edges connected to the matched nodes)
            matchedNodes.connectedEdges().targets().show();
        }
        // Show edges connected to the matched nodes
        matchedNodes.connectedEdges().show();

    }}