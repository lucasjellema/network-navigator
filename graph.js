import { addNodeContextMenu, hideNodeContextMenu } from "./node-context-menu.js";
import { addGraphContextMenu, hideGraphContextMenu, hideGraphListModal } from "./graph-context-menu.js";
import { setTitle } from './ui.js';

import { saveCurrentGraph, getCurrentGraph, loadGraph, getQueryParam, addMermaidContentToCurrentGraph , importFileFromRemoteURL} from "./utils.js";
import { addEdgeContextMenu, hideEdgeContextMenu } from "./edge-context-menu.js";
import { hideElementEditModal } from "./modal-element-editor.js";
import { hideElementPropertiesModal } from "./modal-element-properties.js"
import { initializeFilter } from "./filter.js";
import { initializeLayout } from "./layout.js";
import { initializeGraphManagement } from "./graphManagement.js";

let cy
document.addEventListener("networkNavigatorContentLoaded", async () => {
    cy = initializeCytoscape();
    initializeFilter(cy);
    initializeLayout(cy);
    const treeRootNode = initializeGraphManagement(cy);

    // Save graph button
    document.getElementById('save-graph').addEventListener('click', () => {
        saveCurrentGraph(cy);
    });
    document.getElementById('save-mermaid-graph-content').addEventListener('click', () => {
        addMermaidContentToCurrentGraph(cy);
    });

    const remoteURL = getQueryParam("remoteURL");
    if (remoteURL) {
        console.log("load graph from ", remoteURL)
        const _ = await importFileFromRemoteURL(cy, treeRootNode ,remoteURL); // TODO set tree node to root of tree??
    }
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
                    'background-color': function (ele) {
                        const img = ele.data('image');
                        return img ? 'transparent' : '#0074D9';
                    },

                    'text-valign': 'bottom',
                    'color': 'gold',

                    'shape': (ele) => {
                        const shape = ele.data('shape')
                        return shape || 'ellipse';
                    },
                    'background-image': (ele) => {
                        const img = ele.data('image')
                        return img || 'https://m.media-amazon.com/images/M/MV5BY2JiNjU3NWYtMTRlYS00NzY3LWE2NDQtZGFkNWE2MDU4OTExXkEyXkFqcGc@._V1_QL75_UX280_CR0,0,280,414_.jpg';  // some dummy image that is never actually shown
                    },
                    'background-fit': 'cover',        // Fit the image to the node size
                    //                    'background-opacity': 1,          // Ensure the image is fully visible
                    'background-image-opacity': function (ele) { const img = ele.data('image'); return img ? 1 : 0 },          // Ensure the image is visible if it exists
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
                    'selectable': 'true' // Enable selection
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
                selector: 'edge:selected',
                style: {
                    'line-color': 'red', // Change color when selected
                    'width': 5
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
            }, {

                selector: '.pulse', // Dragged node effect
                style: {
                    'background-color': 'lightblue',
                    'border-width': 4,
                    'border-color': 'blue'
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
        let additionalInfo
        if (node.data('type') === 'person') { additionalInfo = node.data('currentRole'); }
        if (node.data('type') === 'ociResource') { additionalInfo = node.data('subtype'); }
        showTooltip(label, additionalInfo, event);
    });

    cy.on('tapdragover', 'edge', (event) => {
        event.originalEvent.preventDefault(); // Prevent default browser context menu
        const edge = event.target;
        let label = edge.data('label');
        let additionalInfo;
        if (edge.data('type') === 'workAt') {
            label += ' ' + edge.target().data('label');
            additionalInfo = " as " + edge.data('role');
        }
        if (edge.data('type') === 'educatedAt') {
            label += ' ' + edge.target().data('label');
        }
        showTooltip(label, additionalInfo, event);
    });


    const hideTooltip = () => {
        const tooltip = document.getElementById('node-tooltip');
        tooltip.style.display = "none";
    };

    cy.on('tapdragout', 'node', () => {
        hideTooltip();
    });
    cy.on('tapdragout', 'edge', () => {
        hideTooltip();
    });


    let hoverTimer = null; // Timer for hover detection
    let targetNode = null; // Node being hovered over
    let initialPosition = {}; // Store the original position of the dragged node
    let draggedNode
    // Store initial position when dragging starts
    cy.on('dragstart', 'node', function (event) {
        draggedNode = event.target;
        edgeCreated = false;
        initialPosition[draggedNode.id()] = { ...draggedNode.position() }; // Store original position
    });
    let edgeCreated
    cy.on('drag', 'node', function (event) {
        let draggedNode = event.target;
        let draggedPosition = draggedNode.position();
        if (!initialPosition[draggedNode.id()]) initialPosition[draggedNode.id()] = { ...draggedNode.position() }; // Store original position

        // Check for overlapping nodes
        cy.nodes().not(draggedNode).forEach(otherNode => {
            let otherPosition = otherNode.position();
            let distance = Math.sqrt(
                Math.pow(draggedPosition.x - otherPosition.x, 2) +
                Math.pow(draggedPosition.y - otherPosition.y, 2)
            );

            if (distance < 30) { // Adjust hover threshold
                if (targetNode !== otherNode) {
                    targetNode = otherNode;

                    // Start timer if not already running
                    if (!hoverTimer) {
                        hoverTimer = setTimeout(() => {
                            // Create edge
                            cy.add({
                                group: 'edges',
                                data: { source: draggedNode.id(), target: targetNode.id(), label: '>', timeOfCreation: Date.now() },
                            });
                            console.log(`Edge created between ${draggedNode.id()} and ${targetNode.id()}`);
                            edgeCreated = true

                            draggedNode.addClass('pulse');
                            setTimeout(() => {
                                draggedNode.removeClass('pulse');
                            }, 500); // Remove pulse effect after 500ms

                            hoverTimer = null;
                        }, 700);
                    }
                }
            } else if (targetNode === otherNode) {
                clearTimeout(hoverTimer);
                hoverTimer = null;
                targetNode = null;
            }
        });
    });

    // Cancel the timer if dragging stops before connecting
    cy.on('dragfree', 'node', function (event) {
        let draggedNode = event.target;
        clearTimeout(hoverTimer);
        // Bounce back to original position
        if (edgeCreated) {
            let startPos = initialPosition[draggedNode.id()];
            if (startPos) {
                draggedNode.animate({
                    position: startPos,
                    duration: 300, // Smooth animation
                    easing: 'ease-out'
                });
            }
            edgeCreated = false
        }
        initialPosition[draggedNode.id()] = null;
        hoverTimer = null;
        targetNode = null;


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
    }, 5000); // check every 5 seconds for a change and if there is one, save th graph (to local storage)

    // if tap on cy then close node context menu
    cy.on('tap', () => {
        hideNodeContextMenu();
        hideEdgeContextMenu();
        hideGraphContextMenu();
        hideGraphListModal();
        hideElementEditModal();
        hideElementPropertiesModal();


    });
    return cy
}

function showTooltip(label, additionalInfo, event) {
    const tooltip = document.getElementById('node-tooltip');

    let innerHTML = `<strong>${label}</strong>`;
    if (additionalInfo) {
        innerHTML += '<br>' + additionalInfo;
    }
    // Set tooltip content
    tooltip.innerHTML = innerHTML;
    const clickPosition = event.renderedPosition;
    // Position the tooltip near the mouse pointer
    tooltip.style.left = `${clickPosition.x + 10}px`;
    tooltip.style.top = `${clickPosition.y + 10}px`;
    tooltip.style.display = "block";
}

