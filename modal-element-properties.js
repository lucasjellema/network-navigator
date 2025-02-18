let modal, propertyList, closeButton, modalTitle
document.addEventListener('networkNavigatorContentLoaded', function () {
    modal = document.getElementById('propertiesPanel');
    propertyList = document.getElementById('propertyList');
    closeButton = document.getElementById('close');
    modalTitle = document.getElementById('propertiesPanelTitle');
    closeButton.addEventListener('click', () => {
        // Simply hide the modal without making changes
        hideElementPropertiesModal();
    });
})

let nodeToShow = null;
let edgeToShow = null;

export const showNodeDetails = (cy, node) => {
    nodeToShow = node;
    modalTitle.textContent = node.data('label');
    showModal(cy, node);
}

export const showEdgeDetails = (cy, edge) => {
    edgeToShow = edge;
    modalTitle.textContent = 'Details for ' + edge.data('label') + ' ' + edge.target().data('label');
    showModal(cy, edge);
}

const showModal = (cy, element) => {
    propertyList.innerHTML = ''; // Clear the property list
    // Populate the modal with the element's current properties
    const data = element.data();

    for (const key in data) {
        // skip property id 
        if (key === 'id' || key === 'label' || key === 'type' || key === 'subtype' || key === 'shape') continue;
        // for edges, skip properties source and target
        if (edgeToShow && (key === 'source' || key === 'target')) continue;

        let value = data[key];
        // if property is timeOfCreation, show it in a human legible time date format, and make it non editable

        if (key === 'timeOfCreation') {
            const date = new Date(data[key]);
            value = date.toLocaleString();
        }
        const div = document.createElement('div');
        if (key.toLocaleLowerCase().endsWith('url')) {
            const linkOpener = document.createElement('span');
            linkOpener.textContent = `Open ${key} in new Tab`;
            linkOpener.addEventListener('click', () => {
                window.open(value, '_blank');
            });
            div.appendChild(linkOpener);


        }
        // if key ends with image than show image
        else if (key.toLocaleLowerCase().endsWith('image')) {
            const image = document.createElement('img');
            if (value.startsWith('url("')) {
                //remove first 5 and last 2 characters                
                const v = value.substring(5, value.length - 2);
                image.src = v;
            }
            else
                image.src = value;

            image.width = 100;
            image.height = 100;
            div.appendChild(image);
        }
        else {
            div.innerHTML = `<label>${key}: ${value}</label>`;
        }
        propertyList.appendChild(div);
    }

    // Show the modal
    modal.style.display = 'block';
};

// Function to hide the modal
export const hideElementPropertiesModal = () => {
    nodeToShow = null;
    edgeToShow = null;
    modal.style.display = 'none';
};

const getTopValuesForProperty = (cy, propertyKey) => {
    const values = {};

    // Count occurrences of each value
    cy.nodes().forEach(node => {
        const value = node.data(propertyKey);
        if (value !== undefined) {
            values[value] = (values[value] || 0) + 1;
        }
    });

    // Sort values by frequency and return the top 3
    return Object.entries(values)
        .sort((a, b) => b[1] - a[1]) // Sort by count (descending)
        .slice(0, 9) // Get top results
        .map(entry => entry[0]); // Extract values
};
