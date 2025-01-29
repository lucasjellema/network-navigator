import { addNodeContextMenu, hideNodeContextMenu } from "./node-context-menu.js";
import { addGraphContextMenu, hideGraphContextMenu, hideGraphListModal } from "./graph-context-menu.js";
import { setTitle } from './ui.js';

import { saveCurrentGraph, getCurrentGraph, loadGraph } from "./utils.js";
import { addEdgeContextMenu, hideEdgeContextMenu } from "./edge-context-menu.js";
import { hideElementEditModal } from "./modal-element-editor.js";
import { initializeFilter } from "./filter.js";

let cy
document.addEventListener("DOMContentLoaded", () => {
    cy = initializeCytoscape();
    initializeFilter(cy);

    // Save graph button
    document.getElementById('save-graph').addEventListener('click', () => {
        saveCurrentGraph(cy);
    });
})

export const initializeCytoscape = () => {
    let changed = false

    // Initialize Cytoscape
    const cy = cytoscape({
        container: document.getElementById('cy'), // Replace with your container element
        elements: [],
        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(label)',
                    'width': 40,
                    'height': 40,
                    'background-color': function( ele ){  const img = ele.data('image');
                        return img? 'transparent' : '#0074D9';
                       },

                    'text-valign': 'bottom',
                    'color': 'gold',

                    'background-image': function( ele ){  const img = ele.data('image')
                         return img || 'https://m.media-amazon.com/images/M/MV5BY2JiNjU3NWYtMTRlYS00NzY3LWE2NDQtZGFkNWE2MDU4OTExXkEyXkFqcGc@._V1_QL75_UX280_CR0,0,280,414_.jpg';  // some dummy image that is never actually shown
                        },
                    'background-fit': 'cover',        // Fit the image to the node size
//                    'background-opacity': 1,          // Ensure the image is fully visible
                    'background-image-opacity':  function( ele ){  const img = ele.data('image'); return img ? 1 : 0},          // Ensure the image is visible if it exists
                }
            },
            {
                selector: "edge",
                style: {
                    width: 2,
                    "line-color": "#0074D9",
                    "target-arrow-color": "#0074D9",
                    "target-arrow-shape": "triangle",
                    "curve-style": "bezier",
                    label: 'data(label)', // Use the 'label' data attribute for the edge
                    'font-size': '10px',
                    'color': '#555',
                    'text-rotation': 'autorotate', // Align the label with the edge
                    'text-margin-y': -10, // Adjust the label's vertical position relative to the edge
                },
            }, {
                selector: 'node:selected',
                style: {
                    'background-color': '#FFA167', // Change background color
                    'border-width': 4,            // Thicker border
                    'border-color': '#FF851B'     // Highlight border color
                }
            },
            {
                selector: '.highlighted',
                style: {
                    'background-color': '#FF4136',
                    'line-color': '#FF4136',
                    'target-arrow-color': '#FF4136',
                    'transition-property': 'background-color, line-color, target-arrow-color',
                    'transition-duration': '0.5s'
                }
            }
        ],
        layout: {
            name: 'grid',
            rows: 2
        },
        boxSelectionEnabled: true, // Enable box selection
        autounselectify: false
    });

    document.dispatchEvent(new CustomEvent("cyInitialized", { detail: cy })); // inform any consumers that cy is available

    const existingGraph = getCurrentGraph();
    loadGraph(cy, existingGraph);

    // Event listener for box selection
    cy.on('select', 'node', () => {
        const selectedNodes = cy.$(':selected'); // Get all selected nodes
        const labels = selectedNodes.map(node => node.data('label')); // Extract the labels
        console.log('Selected Node Labels:', labels); // Log the labels
    });

    cy.on('dblclick', 'node', (event) => {
        const node = event.target;
        const url = node.data("url");
        if (url) {
            window.open(url, "_blank");
        }
    });

    cy.on('tapdragover', 'node', (event) => {
        event.originalEvent.preventDefault(); // Prevent default browser context menu

        const node = event.target;
        const label = node.data('label');
        const additionalInfo = "more information: " + node.data('additionalInfo');
        const tooltip = document.getElementById('node-tooltip');

        // Set tooltip content
        tooltip.innerHTML = `
         <strong>${label}</strong><br>
         ${additionalInfo}
       `;
        const clickPosition = event.renderedPosition;

        // Position the tooltip near the mouse pointer
        tooltip.style.left = `${clickPosition.x + 10}px`;
        tooltip.style.top = `${clickPosition.y + 10}px`;
        tooltip.style.display = "block";

    });

    const hideTooltip = () => {
        const tooltip = document.getElementById('node-tooltip');
        tooltip.style.display = "none";
    };
    cy.on('tapdragout', 'node', () => {
        hideTooltip();
    });

    addNodeContextMenu(cy);
    addEdgeContextMenu(cy);
    addGraphContextMenu(cy);

    cy.on('add remove data position', () => {
        changed = true
    });
    // create peiodic timeout to save the graph if there are changes
    setInterval(() => {
        if (changed) {
            changed = false
            saveCurrentGraph(cy);
        }
    }, 5000); // check every 5 seconds for a change



    // if tap on cy then close node context menu
    cy.on('tap', () => {
        hideNodeContextMenu();
        hideEdgeContextMenu();
        hideGraphContextMenu();
        hideGraphListModal();
        hideElementEditModal();

    });
    return cy
}

