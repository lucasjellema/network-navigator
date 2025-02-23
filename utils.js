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

export const deleteGraph = (id) => {
    const graphs = getSavedGraphs();
    const updatedGraphs = graphs.filter((graph) => graph.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGraphs));
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


export const importFile = async (cy, treeNode) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = () => {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const jsonData = JSON.parse(reader.result);
                    // check if this file is project or graph file
                    console.log(jsonData)
                    // if jsonData has property elements then it is a graph file
                    const isGraph = (jsonData.elements || jsonData.type == "network-navigator.graph")
                    const isProject = (jsonData.children || jsonData.type == "project" || jsonData.type == "root")

                    if (isGraph) {
                        processImportedGraphData(jsonData, cy, treeNode);
                    }
                    // TODO if project nodes are of type Graph they refer to a graph that itself may not exist in the receiving environment - the graph needs to be imported separately
                    if (isProject) {
                        processImportedProjectData(jsonData, treeNode);
                    }

                } catch (error) {
                    console.error('Invalid JSON file:', error);
                    alert('Failed to import file. Please make sure the file is a valid JSON.');
                }
            };
            reader.readAsText(file);
        }

    };
    input.click();
}

function processImportedProjectData(jsonData, treeNode) {
    const projectData = jsonData;
    if (!treeNode.children) treeNode.children = [];
    //TODO reassign new id values
    // check if file contains a root project that itself has multiple projects
    if (projectData.type === 'root') {
        projectData.children.forEach(importedChild => {
            if (importedChild.type === 'project') {
                importedChild.id = `proj-${generateGUID()}`; // Unique ID
                treeNode.children.push(importedChild);
            }
        });
    } else {
        treeNode.children.push(projectData);
    }
    document.dispatchEvent(new CustomEvent('treeRefresh', { detail: treeNode }));
}

export async function importFileFromRemoteURL(cy, treeNode, remoteURL) {
    let remoteFileURL = remoteURL || prompt("Enter URL for remote Web Memo Project:");
    try {
        const jsonData = await getJSONFile(remoteFileURL);
        const isGraph = (jsonData.elements || jsonData.type == "network-navigator.graph")
        const isProject = (jsonData.children || jsonData.type == "project" || jsonData.type == "root")

        if (isGraph) {
            processImportedGraphData(jsonData, cy, treeNode);
        }
        // TODO if project nodes are of type Graph they refer to a graph that itself may not exist in the receiving environment - the graph needs to be imported separately
        if (isProject) {
            processImportedProjectData(jsonData, treeNode);
        }

    } catch (error) {
        console.error('Invalid JSON file:', error);
        alert(`Failed to import graph ${remoteGraphURL}. Please make sure the file is a valid JSON.`);
    }
}

function processImportedGraphData(graphData, cy, treeNode) {
    const newId = generateGUID(); // TODO only assign new id if the current id already occurs ?!
    saveGraph(newId, graphData.title, graphData.description, graphData.elements);
    console.log('Graph successfully imported:', graphData);
    loadGraph(cy, getGraphById(newId));
    // create tree node for new graph under treeNode
    const graphTreeNode = { id: newId, name: graphData.title, type: "graph", show: true };
    if (!treeNode.children) treeNode.children = [];
    treeNode.children.push(graphTreeNode);

    // TODO dispatch event to refresh tree
    document.dispatchEvent(new CustomEvent('treeRefresh', { detail: treeNode }));
}

/**
 * Exports the current graph to a JSON file for download
 * @param {Core} cy - The cytoscape instance
 * @param {boolean} onlyVisible - If true, only export the visible elements
 */
export function exportGraphToJsonFile(cy, onlyVisible) {
    let graphJson = getCurrentGraph(cy);

    if (onlyVisible) graphJson.elements = cy.elements(':visible').map(ele => ele.json());
    graphJson.type = "network-navigator.graph"
    graphJson.version = "1.0.0"
    graphJson.dateOfExport = Date.now()

    //
    // Convert JSON to a downloadable file
    const blob = new Blob([JSON.stringify(graphJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link to download the file
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graph.json'; // File name for the download
    a.click();

    // Revoke the object URL to free up memory
    URL.revokeObjectURL(url);
}

export const exportProjectToJsonFile = (node) => {
    // TODO also export Graph inside project JSON file ??
    const json = JSON.stringify(node, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    if (node.type === "project") {
        a.download = `network-navigator-project-${node.name}-${dateStr}.json`;
    } else if (node.type === "root") {
        a.download = `network-navigator-all-projects-${dateStr}.json`;
    }
    a.click();
    URL.revokeObjectURL(url);
}

const NETWORK_NAVIGATOR_PROJECTS_STORAGE_KEY = 'network-navigator-projects';   // LocalStorage key for the network-navigator projects data

// Get all saved projects from local storage
export function getSavedProjects() {
    const projects = localStorage.getItem(NETWORK_NAVIGATOR_PROJECTS_STORAGE_KEY);
    return projects && "undefined" !== projects ? JSON.parse(projects) : [];
}

// Save projects to  local storage
export function saveProjects(data) {
    localStorage.setItem(NETWORK_NAVIGATOR_PROJECTS_STORAGE_KEY, JSON.stringify(data));
}
