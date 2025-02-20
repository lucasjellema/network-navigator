let layoutButton, applyLayoutButton, layoutPanel, closePanelButton, layoutValueInput, onlyVisibleCheckBox, onlySelectedCheckBox

document.addEventListener("networkNavigatorContentLoaded", () => {
    console.log("networkNavigatorContentLoaded")
})

export const initializeLayout = (cy) => {
    console.log("initializeLayout")
    layoutButton = document.getElementById('layoutButton');
    applyLayoutButton = document.getElementById('applyLayout');
    layoutPanel = document.getElementById('layoutPanel');
    closePanelButton = document.getElementById('closeLayoutPanelButton');
    layoutValueInput = document.getElementById('layoutValue'); // .value.toLowerCase();
    onlyVisibleCheckBox = document.getElementById('onlyVisible'); //.checked
    onlySelectedCheckBox = document.getElementById('onlySelected'); //.checked



    layoutButton.addEventListener('click', () => {
        layoutPanel.style.display = 'block';
    });

    applyLayoutButton.addEventListener('click', () => {
        applyLayout(cy);
    })

    closePanelButton.addEventListener('click', () => {
        closeLayoutPanel();
    });


}


const closeLayoutPanel = () => {
    layoutPanel.style.display = 'none';
}


const applyLayout = (cy) => {
    const layoutValue = layoutValueInput.value.trim();
    const onlySelected = onlySelectedCheckBox.checked;
    if (layoutValue) {

        const newLayout = {
            name: layoutValue
        };
        if (layoutValue === 'concentric') {
            newLayout.concentric = function (node) {
                const weight = node.data('type') === 'company' ? 100 : (node.data('type') == 'person' ? 20 : 1);
                console.log(node.data('label'), weight);
                return weight;  // Nodes with higher weight go closer to center
            }
            newLayout.minNodeSpacing = 100;
        };
        if (layoutValue === 'grid') {
            newLayout.rows = 3
            newLayout.sort = (a, b) => {
                // Define custom sorting based on node type
                const order = { 'company': 1, 'person': 2, 'education': 3 };
                return order[a.data('type')] - order[b.data('type')];
            }
        }

        if (layoutValue === 'euler') {
            newLayout.mass = 2
            newLayout.springLength = 80

        }
        const theElements = cy.collection();
        // add currently selected elements
        if (onlySelected) {
            theElements.merge(cy.$(':selected'));
            const layout = theElements.layout(newLayout);
            layout.run();
        }
        //https://js.cytoscape.org/#layouts

        else {
            const layout = cy.layout(newLayout);
            layout.run();

        }
    }
}