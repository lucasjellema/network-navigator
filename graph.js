import { addNodeContextMenu, hideNodeContextMenu } from "./node-context-menu.js";
import { addGraphContextMenu, hideGraphContextMenu, hideGraphListModal } from "./graph-context-menu.js";
import { setTitle } from './ui.js';

import { saveCurrentGraph, getCurrentGraph, loadGraph } from "./utils.js";
import { addEdgeContextMenu, hideEdgeContextMenu } from "./edge-context-menu.js";
import {hideElementEditModal} from "./modal-element-editor.js";

let cy
document.addEventListener("DOMContentLoaded", () => {
    cy = initializeCytoscape();

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
                    'background-color': '#0074D9',
                    'text-valign': 'bottom',
                    'color': 'gold'
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
                    'background-color': '#FF4136', // Change background color
                    'border-width': 4,            // Thicker border
                    'border-color': '#FF851B'     // Highlight border color
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
    const existingGraph = getCurrentGraph();
    loadGraph(cy, existingGraph);

    // Event listener for box selection
    cy.on('select', 'node', () => {
        const selectedNodes = cy.$(':selected'); // Get all selected nodes
        const labels = selectedNodes.map(node => node.data('label')); // Extract the labels
        console.log('Selected Node Labels:', labels); // Log the labels
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

