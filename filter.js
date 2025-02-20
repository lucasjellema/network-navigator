
let filterButton, applyFilterButton, resetFilterButton, filterPanel, closePanelButton, filterValueInput, includeConnectedCheckBox, includeSelectedCheckBox, includeVisibleCheckBox, includePathCheckBox

document.addEventListener("networkNavigatorContentLoaded", () => {
 filterButton = document.getElementById('filterButton');
 applyFilterButton = document.getElementById('applyFilter');
 resetFilterButton = document.getElementById('resetFilter');
 filterPanel = document.getElementById('filterPanel');
 closePanelButton = document.getElementById('closePanelButton');
 filterValueInput = document.getElementById('filterValue'); // .value.toLowerCase();
 includeConnectedCheckBox = document.getElementById('includeConnected'); //.checked
 includeSelectedCheckBox = document.getElementById('includeSelected'); //.checked
 includeVisibleCheckBox = document.getElementById('includeVisible');
 includePathCheckBox = document.getElementById('includePath');
})
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


const closeFilterPanel = () => {
    filterPanel.style.display = 'none';
}

const resetFilter = (cy) => {
    cy.elements().show()
    filterValueInput.value = '';
    includeConnectedCheckBox.checked = false;
    includeVisibleCheckBox.checked = false;
    includeSelectedCheckBox.checked = false;
    includePathCheckBox.checked = false;

}

const applyFilter = (cy) => {
    const filterValue = filterValueInput.value.trim();
    const includeConnected = includeConnectedCheckBox.checked;
    const includeVisible = includeVisibleCheckBox.checked;
    const includeSelected = includeSelectedCheckBox.checked;
    const includePath = includePathCheckBox.checked;
    executeFilter(filterValue, cy, includeVisible, includeSelected, includePath, includeConnected);
}

export const executeFilter = (filterValue, cy, includeVisible, includeSelected, includePath, includeConnected) => {
    if (filterValue) {
        const theElements = cy.collection();
        if (includeVisible) {
            const visibleNodes = cy.nodes(':visible');
            theElements.merge(cy.nodes(visibleNodes));
        }

        cy.elements().hide();

        // add currently selected elements
        if (includeSelected) {
            theElements.merge(cy.$(':selected'));
        }

        if (includePath) {
            theElements.merge(cy.scratch('shortestPath'));
        }

        // https://js.cytoscape.org/#collection/traversing 
        // Select nodes with the matching prefix
        const lowerCaseFilterValue = filterValue?.toLowerCase();
        const matchedNodes = cy.nodes().filter((node) => node.data('label')?.toLowerCase().includes(lowerCaseFilterValue)
        );
        theElements.merge(matchedNodes);
        // Show matched nodes
        theElements.show();

        if (includeConnected) {
            // Show nodes referenced from the matched nodes (through the edges connected to the matched nodes)
            theElements.connectedEdges().targets().show();
            // Show nodes referencing (to) the matched nodes (through the edges connected to the matched nodes)
            theElements.connectedEdges().sources().show();
        }
        // Show edges connected to the matched nodes
        theElements.connectedEdges().show();

        // bring selected nodes in center of viewbox
        cy.center(theElements);


    }
}
