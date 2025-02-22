import { setTitle } from './ui.js';


const STORAGE_KEY = 'network-navigator-graphs';   // LocalStorage key for the graph data
const CURRENT_GRAPH_ID = 'currentGraphId'        // LocalStorage key for the current graph ID
// 
export function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export const getCurrentGraph = () => {
    const currentGraphId = localStorage.getItem(CURRENT_GRAPH_ID);
    return getGraphById(currentGraphId) || null;
}

// Get all saved graphs from local storage
export function getSavedGraphs() {
    const graphs = localStorage.getItem(STORAGE_KEY);
    return graphs ? JSON.parse(graphs) : [];
}

// Save a graph to local storage
export function saveGraph(id, title, description, elements) {
    const graphs = getSavedGraphs();
    const graphIndex = graphs.findIndex((graph) => graph.id === id);

    const newGraph = { id, title, description, elements, timestamp: Date.now() };

    if (graphIndex > -1) {
        graphs[graphIndex] = newGraph; // Update existing graph
    } else {
        graphs.push(newGraph); // Add new graph
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(graphs));
}

// Get a graph by ID
export function getGraphById(id) {
    const graphs = getSavedGraphs();
    return graphs.find((graph) => graph.id === id) || null;
}

export function saveCurrentGraph(cy) {
    const currentGraphId = localStorage.getItem(CURRENT_GRAPH_ID);
    const title = document.getElementById('graph-title').value;
    const description = document.getElementById('graph-description').value;
    const elements = cy.json().elements;
    saveGraph(currentGraphId, title, description, elements);
}

function parseMermaidGraph(mermaidText) {
    const lines = mermaidText.trim().split("\n");
    const graphType = lines.shift().trim(); // e.g., "graph TD"

    const nodes = new Set();
    const edges = [];

    for (const line of lines) {
        // Remove extra spaces and match node connections
        const match = line.trim().match(/^(\w+)\s*(-->|<-->|<--)\s*(\w+)$/);
        if (match) {
            const [, source, link, target] = match;

            // Add nodes
            nodes.add(source);
            nodes.add(target);

            // Add edges (handle bidirectional)
            edges.push({ from: source, to: target });
            if (link.includes("<")) {
                edges.push({ from: target, to: source });
            }
        }
    };

    return {
        nodes: Array.from(nodes),
        edges: edges
    };
}




export function addMermaidContentToCurrentGraph(cy) {
    const content = document.getElementById('mermaid-graph-content').value;
    const graphData = parseMermaidGraph(content);
    const nodeMap = {};
    let newNodes = cy.collection();
    for (const node of graphData.nodes) {
        let sourceNode = findNodeByProperties(cy, { 'label': node });
        if (!sourceNode) {
            sourceNode = createNode(cy, node);
            newNodes = newNodes.union(sourceNode);
        }
        nodeMap[node] = sourceNode
    }
    for (const edge of graphData.edges) {
        const { from, to, label } = edge;
        const sourceNode = nodeMap[from];
        const targetNode = nodeMap[to];
        if (sourceNode && targetNode) {
            console.log('Creating edge between', sourceNode.data('label'), 'and', targetNode.data('label'));
            const edge = createEdgeWithLabel(cy, sourceNode, targetNode, '>', true);
        }
    }
    newNodes.layout({
        name: 'random',
        animate: true,
        animateFilter: function (node, i) {
            return true;
        },
        animationDuration: 1000,
        animationEasing: undefined,
        fit: true,
    })
        .run();
}

export const getSelectedNodes = (cy) => {
    const selectedElements = cy.$(':selected');
    const selectedNodes = selectedElements.filter('node');

    // console.log('Selected Nodes:', selectedNodes.map((node) => node.id()));
    return selectedNodes;
}


export const createEdgeWithLabel = (cy, sourceNode, targetNode, label, doNotCreateWhenEdgeExists) => {
    let edge = firstEdgeWithLabel(cy, sourceNode.id(), targetNode.id(), label)
    if (edge && doNotCreateWhenEdgeExists) return edge

    const newEdgeId = generateGUID();
    cy.add({
        data: {
            id: newEdgeId,
            source: sourceNode.id(),
            target: targetNode.id(),
            label: label,
            timeOfCreation: Date.now(),
        },
    });
    const newEdge = cy.getElementById(newEdgeId)
    return newEdge
}

export const createEdge = (cy, sourceNode, targetNode) => {
    return createEdgeWithLabel(cy, sourceNode, targetNode, `Edge: ${sourceNode.data('label')} →  ${targetNode.data('label')}`)
}

export const edgeWithLabelExists = (sourceId, targetId, label) => {
    return cy.$(`edge[source = "${sourceId}"][target = "${targetId}"][label = "${label}"]`).length > 0
    // ||            cy.$(`edge[source = "${targetId}"][target = "${sourceId}"][label = "${label}"]`).length > 0; // For undirected graphs
}

export const firstEdgeWithLabel = (cy, sourceId, targetId, label) => {
    const edges = cy.$(`edge[source = "${sourceId}"][target = "${targetId}"][label = "${label}"]`)
    return edges.length > 0 ? edges[0] : null
    // ||            cy.$(`edge[source = "${targetId}"][target = "${sourceId}"][label = "${label}"]`).length > 0; // For undirected graphs
}


export const createNode = (cy, label,) => {
    const newNodeId = generateGUID();
    const node =
    {
        group: 'nodes',
        data: {
            id: newNodeId, label: label, timeOfCreation: Date.now(),
        }
    }
    cy.add(node);
    const newNode = cy.getElementById(newNodeId)
    return newNode
}

export const loadGraph = (cy, graph) => {
    if (!graph) return;
    localStorage.setItem('currentGraphId', graph.id);
    cy.elements().remove();
    cy.add(graph.elements); // Load graph elements
    // Reapply the layout to organize the graph
    //    cy.layout({ name: 'grid' }).run();

    document.getElementById("graph-title").value = graph.title;
    document.getElementById("graph-description").value = graph.description;
    setTitle(graph.title);
}

export const findNodeByProperty = (cy, property, value) => {
    const currentNodes = cy.nodes().filter((node) => node.data(property) === value);
    return currentNodes[0] || null;
};

export const findNodeByProperties = (cy, properties) => {
    const currentNodes = cy.nodes().filter((node) => {
        // iterate over all properties and test for each if the value in node.data is equal to the value in properties
        for (const [key, value] of Object.entries(properties)) {
            if (node.data(key) !== value) return false;
        }
        return true;
    })
    return currentNodes[0] || null;
};


export function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

export const getJSONFile = (url) => {
    return new Promise((resolve, reject) => {
        fetch(url, { method: 'GET' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                resolve(response.json())
            })
            .catch(err =>
                resolve(1)
            );
    })
}

export const exportGraphToMermaid = (cy, onlyVisible) => {
    let mermaid = "graph TD\n";

    // Get all nodes
    cy.nodes().forEach(node => {
        if (node.visible() || !onlyVisible) {
            const label = node.data('label').replace(/\s+/g, '-');
            mermaid += `  ${label}\n`;
        }
    });

    // Get all edges
    cy.edges().forEach(edge => {
        if (edge.visible() || !onlyVisible) {
            const sourceLabel = edge.source().data('label').replace(/\s+/g, '-');
            const targetLabel = edge.target().data('label').replace(/\s+/g, '-');
            const source = edge.source().id();
            const target = edge.target().id();
            const bidirectional = cy.edges(`[source="${target}"][target="${source}"]`).length > 0;
            if (bidirectional) {
                if (source < target) {
                    mermaid += `  ${sourceLabel} <--> ${targetLabel}\n`;
                }
            } else {
                mermaid += `  ${sourceLabel} --> ${targetLabel}\n`;
            }
        }
    });

    return mermaid;
}
