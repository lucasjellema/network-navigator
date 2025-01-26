const modal = document.getElementById('editModal');
const propertyList = document.getElementById('propertyList');
const newPropertyKey = document.getElementById('newPropertyKey');
const newPropertyValue = document.getElementById('newPropertyValue');
const saveButton = document.getElementById('saveChanges');
const cancelButton = document.getElementById('cancelChanges');
const modalTitle = document.getElementById('modalTitle');


let nodeToEdit = null;
let edgeToEdit = null;

export const editNode = (node) => {
    nodeToEdit = node;
    modalTitle.textContent = 'Edit Node Properties ' + node.data('label');
    showModal(node);
}

export const editEdge = (edge) => {
    edgeToEdit = edge;
    modalTitle.textContent = 'Edit Edge Properties';
    showModal(edge);
}

const showModal = (element) => {
    propertyList.innerHTML = ''; // Clear the property list
    // Populate the modal with the element's current properties
    const data = element.data();

    for (const key in data) {
        // skip property id 
        if (key === 'id') continue;
        // for edges, skip properties source and target
        if (edgeToEdit && (key === 'source' || key === 'target')) continue;

        // if property is timeOfCreation, show it in a human legible time date format, and make it non editable
        let editable = true;
        let value = data[key];

        if (key === 'timeOfCreation') {
            const date = new Date(data[key]);
            value = date.toLocaleString();
            editable = false;
        }

        const div = document.createElement('div');
        div.innerHTML = `
        <label>${key}: </label>
        <input type="text" value="${value}" data-key="${key}" ${!editable ? 'disabled' : ''}/>
      `;
        propertyList.appendChild(div);
    }

    // Show the modal
    modal.style.display = 'block';
};

// Function to hide the modal
export const hideElementEditModal = () => {
    newPropertyKey.value = '';
    newPropertyValue.value = '';
    modal.style.display = 'none';
};

// Event listener for save button
saveButton.addEventListener('click', () => {
    if (!nodeToEdit && !edgeToEdit) return;

    // Update the existing properties
    const inputs = propertyList.querySelectorAll('input');
    inputs.forEach(input => {
        const key = input.getAttribute('data-key');
        const value = input.value;
        if (nodeToEdit) nodeToEdit.data(key, value);
        else if (edgeToEdit) edgeToEdit.data(key, value);
    });

    // Add new property if specified
    const key = newPropertyKey.value.trim();
    const value = newPropertyValue.value.trim();
    if (key) {
        if (nodeToEdit) nodeToEdit.data(key, value);
        else if (edgeToEdit) edgeToEdit.data(key, value);
    }
    hideElementEditModal();
});

// Event listener for cancel button
cancelButton.addEventListener('click', () => {

    // Simply hide the modal without making changes
    hideElementEditModal();
});

