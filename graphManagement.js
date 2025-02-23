import { getSavedGraphs, getGraphById, loadGraph, generateGUID, saveCurrentGraph, deleteGraph, importFile,importFileFromRemoteURL, exportGraphToJsonFile, saveProjects, getSavedProjects } from './utils.js';
import { setTitle } from './ui.js';


let graphManagementButton, contextMenu, graphManagementPanel
let changed = false;

setInterval(() => {
    if (changed) {
        changed = false
        saveProjects(data);
    }
}, 5000); // check every 5 seconds for a change


document.addEventListener("networkNavigatorContentLoaded", () => {
    graphManagementButton = document.getElementById('graphManagementButton');
    graphManagementPanel = document.getElementById('graphManagementPanel');
    contextMenu = document.getElementById("tree-context-menu");
    graphManagementButton.addEventListener('click', () => {
        graphManagementPanel.style.display = 'block';
        createTree(graphManagementPanel, data);
    });

    document.addEventListener("click", (event) => {
        hideContextMenu()
        // if event is not on  the tree panel itself
        if (!graphManagementPanel.contains(event.target) && !contextMenu.contains(event.target) && !graphManagementButton.contains(event.target)) hideTreePanel()
    });
    //  initializeGraphManagement();

})


document.addEventListener("treeRefresh", () => {
    refreshTree();
    changed = true
})


let data = [
    {
        id: "0",
        name: "Network Navigator Projects and Graphs",
        type: "root",
        children: [],

    }
];

let cy

export const initializeGraphManagement = (cytoscape) => {
    cy = cytoscape
    const projects = getSavedProjects()
    if (projects?.length > 0) {
        data = projects
    }
    expandedNodes.add(0);


    const savedGraphs = getSavedGraphs();
    // any graph that is not already in one of the projects
    const allGraphsInProjects = data.flatMap(project => project.children.filter(child => child.type === "graph").map(child => child.id));

    for (const graph of savedGraphs) {
        if (allGraphsInProjects.includes(graph.id)) continue;
        const graphTreeNode = { id: graph.id, name: graph.title, type: "graph", show: true };
        data[0].children.push(graphTreeNode);
    }
return data
}


let selectedNodeElement = null; // Store selected node element
let selectedNodeId = null; // Variable to store selected node ID
let selectedNode
let expandedNodes = new Set(); // Store expanded node IDs

export function createTree(parent, nodes) {
    // only attempt the following when nodes are iterable
    // test nodes 
    if (!Array.isArray(nodes)) return

    for (const node of nodes) {
        try {
            const isRoot = (node.type == "root")
            if (node.show == false) continue;
            let div = document.createElement("div");
            div.className = isRoot ? "tree-root" : "tree-node";
            div.draggable = !isRoot; // Enable drag & drop

            let toggle = document.createElement("span");
            toggle.className = "toggle";
            const hasChildren = node.children && node.children.length > 0; // Check if the node has any children
            toggle.textContent = hasChildren ? (isRoot || expandedNodes.has(node.id) ? "▼ " : "▶ ") : "• ";

            div.appendChild(toggle);
            let treeNode = document.createElement("span");
            let iconSource = typeImageMap[node.type]
            if (iconSource) {
                let icon = document.createElement("img");
                icon.src = `images/${iconSource}`;
                icon.classList.add("node-icon");
                icon.alt = node.scope || node.type
                treeNode.appendChild(icon);
            }
            let name = document.createElement("span");
            name.textContent = node.name;
            name.classList.add("node-label");
            name.dataset.id = node.id; // Store node ID in a data attribute
            if (//node is selected
                node.id == selectedNodeId
            ) {
                // Highlight the clicked node
                name.classList.add("selected");
            }

            treeNode.appendChild(name);
            div.appendChild(treeNode)
            parent.appendChild(div);

            // Add selection event
            treeNode.addEventListener("click", () => {
                // Deselect previously selected node
                document.querySelectorAll(".selected").forEach(el => el.classList.remove("selected"));

                // Highlight the clicked node
                name.classList.add("selected");

                // Store selected node ID
                selectedNodeId = node.id;
                selectedNode = node
                selectedNodeElement = div;
                // if (!isRoot) showPropertyPanel(node, data.harvestedTags);
            });

            treeNode.addEventListener("dblclick", () => {
                // open graph 
                if (node.type == "graph") {
                    hideTreePanel();

                    const selectedGraph = getGraphById(node.id);
                    if (selectedGraph) {
                        loadGraph(cy, selectedGraph);
                    }
                }

            });

            treeNode.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                showContextMenu(e.pageX, e.pageY, node);
            });

            // Drag & Drop events
            if (!isRoot) {
                div.addEventListener("dragstart", (e) => {
                    e.dataTransfer.setData("nodeId", node.id);
                    console.log(`drag ${node.id}`)
                    e.stopPropagation();
                });

                div.addEventListener("dragover", (e) => {
                    e.preventDefault();
                });

                div.addEventListener("drop", (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // do not also try to handle drop for ancestor elements
                    let draggedNodeId = e.dataTransfer.getData("nodeId");

                    if (draggedNodeId !== node.id) {
                        moveNode(draggedNodeId, node.id);
                    }
                });
            }
            let childContainer = document.createElement("div");
            childContainer.style.display = isRoot || expandedNodes.has(node.id) ? "block" : "none";
            div.appendChild(childContainer);

            if (node.children) {
                toggle.addEventListener("click", () => {
                    const isExpanded = expandedNodes.has(node.id);
                    if (isExpanded) {
                        expandedNodes.delete(node.id);
                        childContainer.style.display = "none";
                        toggle.textContent = "▶ ";
                    } else {
                        expandedNodes.add(node.id);
                        childContainer.style.display = "block";
                        toggle.textContent = "▼ ";
                    }
                });
                createTree(childContainer, node.children);
            }
        } catch (error) {
            console.error(`Error creating tree: ${error}`);
        }
    };
}


// Show the context menu
function showContextMenu(x, y, node) {
    const contextMenu = document.getElementById("tree-context-menu");
    contextMenu.style.top = `${y}px`;
    contextMenu.style.left = `${x}px`;
    contextMenu.style.display = "block";

    const deleteNodeOption = document.getElementById("tree-delete-node")
    // Set actions
    if (node?.type != "root") {
        deleteNodeOption.style.display = "block";
        deleteNodeOption.onclick = () => deleteNode(node);
    } else {
        deleteNodeOption.style.display = "none";
    }
    const mergeProjectsOption = document.getElementById("tree-merge");
    if (node?.type === "project" && selectedNode?.type === "project" && selectedNode?.id !== node?.id) {
        mergeProjectsOption.style.display = "block";
        mergeProjectsOption.textContent = `Merge Project ${selectedNode?.name} into Project ${node?.name}`;
        mergeProjectsOption.onclick = () => mergeProjects(selectedNode, node);
    } else {
        mergeProjectsOption.style.display = "none";
    }

    const createChildOption = document.getElementById("tree-create-child");
    if (node?.type === "project" || node?.type === "root") {
        createChildOption.style.display = "block";
        createChildOption.onclick = () => createChildProject(node);
    } else {
        createChildOption.style.display = "none";
    }

    const createGraphOption = document.getElementById("tree-create-graph");
    if (node?.type !== "XXX") { // for now let's always allow creating a graph
        createGraphOption.style.display = "block";
        createGraphOption.onclick = () => createGraph(node);
    } else {
        createGraphOption.style.display = "none";
    }

    const exportProjectOption = document.getElementById("tree-export-project");
    if (node?.type === "project" || node?.type === "root") {
        exportProjectOption.style.display = "block";
        exportProjectOption.textContent = `Export Project ${node?.type === "root" ? "All Projects" : node?.name}`
        exportProjectOption.onclick = () => exportGraphToJsonFile(node, false);
    } else {
        exportProjectOption.style.display = "none";
    }
    const exportGraphOption = document.getElementById("tree-export-graph");
    if (node?.type === "graph") {
        exportGraphOption.style.display = "block";
        exportGraphOption.textContent = `Export Graph ${node?.name}`
        exportGraphOption.onclick = () => exportGraphToJsonFile(cy);
    } else {
        exportGraphOption.style.display = "none";
    }

    const importProjectOption = document.getElementById("tree-import-project-file")
    if (node?.type === "root" || node?.type === "project") {
        importProjectOption.style.display = "block";
        importProjectOption.onclick = async () => {
            await importFile(cy, node);    
            expandedNodes.add(node.id);           
        }
    } else {
        importProjectOption.style.display = "none";
    }

    const importRemoteProjectOption = document.getElementById("tree-import-project-url")
    if (node?.type === "root" || node?.type === "project") {
        importRemoteProjectOption.style.display = "block";
        importRemoteProjectOption.onclick = async () => importFileFromRemoteURL(cy, node);
    } else {
        importRemoteProjectOption.style.display = "none";
    }
}



function createChildProject(node) {
    const newProjectName = prompt("Enter new project name:");
    if (!newProjectName) return;

    const newProject = {
        id: `proj-${Date.now()}`, // Unique ID
        name: newProjectName,
        type: "project",
        notes: "",
        children: []
    };
    if (!node.children) node.children = [];
    node.children.push(newProject)
    changed = true
    expandedNodes.add(node.id);
    refreshTree();
}


const createGraph = (node) => {
    const newGraphName = prompt("Enter name for new graph:");
    if (!newGraphName) return;
    console.log('creating new graph');
    const newId = generateGUID();
    localStorage.setItem('currentGraphId', newId); // Track the new graph ID
    console.log("new id and remove");
    cy.elements().remove(); // Clear the existing graph
    document.getElementById('graph-title').value = newGraphName
    document.getElementById('graph-description').value = '';
    console.log("save new graph");
    setTitle(newGraphName);
    saveCurrentGraph(cy);

    const graphTreeNode = { id: newId, name: newGraphName, type: "graph", show: true };

    if (!node.children) node.children = [];
    node.children.push(graphTreeNode)
    changed = true
    expandedNodes.add(node.id);
    refreshTree();
}


// Delete node function
function deleteNode(node) {
    // find the graph id for this node and all recursive children
    const graphIds = [];
    function findGraphIds(node) {
        if (node.type === "graph") {
            graphIds.push(node.id);
        }
        if (node.children) {
            node.children.forEach(child => findGraphIds(child));
        }
    }
    findGraphIds(node);
    console.log('graph ids to be deleted', graphIds);
    for (const graphId of graphIds) {
        deleteGraph(graphId);
    }

    // Recursive function to delete a node and its descendants by ID
    function recursiveDelete(arr, nodeId) {
        return arr.filter(item => {
            // Keep the item if it's null or its ID doesn't match
            if (!item) return true;
            if (item.id === nodeId) return false;
            // Recursively delete from children if any exist
            if (item.children) item.children = recursiveDelete(item.children, nodeId);
            return true; // Keep the item if it doesn't match the ID
        });
    }
    // Replace current data with filtered data, removing the specified node
    data.splice(0, data.length, ...recursiveDelete(data, node.id));
    changed = true
    refreshTree();
}


// Find a node by ID in a tree structure
function findNodeById(nodes, id) {
    for (let node of nodes) {
        if (node && node.id === id) return node;
        if (node && node.children) {
            let found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
}

// Remove a node from its parent
function removeNodeById(nodes, id) {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i]?.id === id) {
            nodes.splice(i, 1);
            return true;
        }
        if (nodes[i]?.children) {
            let removed = removeNodeById(nodes[i]?.children, id);
            if (removed) return true;
        }
    }
    return false;
}


function moveNode(draggedId, targetId) {
    let draggedNode = findNodeById(data, draggedId);
    let targetNode = findNodeById(data, targetId);

    if (!draggedNode || !targetNode) {
        alert("Invalid move");
        return;
    }

    // Remove dragged node from its old parent
    removeNodeById(data, draggedId);

    // Add it to the new parent
    if (!targetNode.children) targetNode.children = [];
    targetNode.children.push(draggedNode);
    changed = true
    refreshTree()
}




const hideContextMenu = () => {
    const contextMenu = document.getElementById("tree-context-menu");
    contextMenu.style.display = "none";
}

function refreshTree() {
    hideContextMenu();
    const graphManagementPanel = document.getElementById('graphManagementPanel');
    graphManagementPanel.innerHTML = "";
    createTree(graphManagementPanel, data);
}

function hideTreePanel() {
    const graphManagementPanel = document.getElementById('graphManagementPanel');
    graphManagementPanel.style.display = 'none';
    graphManagementPanel.innerHTML = "";
}



const typeImageMap = {
    "project": "folder.png",
    "graph": "graph.png",
    "object": "object.png",
    "page": "page.png",
    "link": "link.png",
    "image": "image.png",
    "location": "location.png",
    "github": "github.png",
    "podcast": "podcast.png",
    "technology": "technology.png",
    "book": "book.png",
    "person": "person.png",
    "note": "note.png",
    "music": "music.png",
    "tv": "tv.png",
    "news": "news.png",
    "movie": "movie.png",
    "company": "company.png",
}