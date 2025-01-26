const modal = document.getElementById('editModal');
const propertyList = document.getElementById('propertyList');
const newPropertyKey = document.getElementById('newPropertyKey');
const newPropertyValue = document.getElementById('newPropertyValue');
const saveButton = document.getElementById('saveChanges');
const cancelButton = document.getElementById('cancelChanges');


let nodeToEdit = null; 

export const editNode = (node) => {
    console.log("edit" + node.data('label'));
    showModal(node);
    nodeToEdit = node;
}


const showModal = (node) => {
    
    propertyList.innerHTML = ''; // Clear the property list

    // Populate the modal with the node's current properties
    const data = node.data();
    for (const key in data) {
      const div = document.createElement('div');
      div.innerHTML = `
        <label>${key}: </label>
        <input type="text" value="${data[key]}" data-key="${key}" />
      `;
      propertyList.appendChild(div);
    }

    // Show the modal
    modal.style.display = 'block';
  };

  // Function to hide the modal
  const hideModal = () => {
    modal.style.display = 'none';
  };

  // Event listener for save button
  saveButton.addEventListener('click', () => {
    if (!nodeToEdit) return;

    // Update the existing properties
    const inputs = propertyList.querySelectorAll('input');
    inputs.forEach(input => {
      const key = input.getAttribute('data-key');
      const value = input.value;
      nodeToEdit.data(key, value); // Update the node's data
    });

    // Add new property if specified
    const key = newPropertyKey.value.trim();
    const value = newPropertyValue.value.trim();
    if (key ) {
        nodeToEdit.data(key, value);
    }

    // Clear inputs and hide modal
    newPropertyKey.value = '';
    newPropertyValue.value = '';
    hideModal();
  });

  // Event listener for cancel button
  cancelButton.addEventListener('click', () => {
     // Clear inputs and hide modal
     newPropertyKey.value = '';
     newPropertyValue.value = '';
    // Simply hide the modal without making changes
    hideModal();
  });