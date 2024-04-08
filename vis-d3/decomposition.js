import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Main components
let tree_data = null;

const svg = d3.select('#tree');
const g = svg.append('g');

// Handle zoom
let zoom = d3.zoom().on('zoom', function(e) {
    $('#buttons').hide();
    g.attr('transform', e.transform);
});
svg.call(zoom);


// load
$(document).ready(function() {
    // Make dummy tree
    let data = new Task('Load a task', 'Load an existing task');
    data.add_subtask('Click on "Load" button', 'Click on the "Load" button using the bar on top');
    data.add_subtask('Select a file', 'Select a file to be loaded');
    data.add_subtask('Load the file', 'Load a file by clicking on "OK"');

    init_tree(data);
})

function load_tree() {
    Task.load(init_tree)
}

function save_tree(filename) {
    tree_data.save(filename);
}

function init_tree(data) {
    tree_data = data;
    update();
}

function update() {
    const svg_width = $('#tree').innerWidth();
    const svg_height = $('#tree').innerHeight();

    const margin = {
        left: 50,
        right: 200,
        top: 50,
        bottom: 200
    };

    const width = svg_width - margin.left - margin.right;
    const height = svg_height - margin.top - margin.bottom;

    const treeLayout = d3.tree(null).nodeSize([200, 200]);
    const treeData = treeLayout(d3.hierarchy(tree_data, d => d.children));

    // -------------------------------------------------------------------------------------------------------------
    // Nodes
    // -------------------------------------------------------------------------------------------------------------
    let nodes = g.selectAll('.node')
        .data(treeData.descendants())

    // Nodes - Enter
    let nodesG_enter = nodes.enter().append('g')
        .classed('node', true)
        .classed('node-internal', !isLeaf)
        .classed('node-leaf', d => isLeaf)
        .classed('unexplored', isUnexplored)
        .classed('explored', isExplored)
        .classed('solved', isSolved)
        .attr('transform', d => `translate(${d.x + width/2 + margin.left}, ${d.y + margin.top})`)
        .on('click', onNodeClick);
    nodesG_enter.append('circle')
        .attr('r', 10);
    nodesG_enter.append('text')
        .attr('dx', 18)
        .attr('dy', '.31em')
        .text(d => d.data.name);

    // Nodes - Update
    let nodesG_update = nodes
        .classed('node-internal', !isLeaf)
        .classed('node-leaf', d => isLeaf)
        .classed('unexplored', isUnexplored)
        .classed('explored', isExplored)
        .classed('solved', isSolved)
        .attr('transform', d => `translate(${d.x + width/2 + margin.left}, ${d.y + margin.top})`)
        .on('click', onNodeClick);
    nodesG_update.select('text')
        .text(d => d.data.name);

    // Nodes - Exit
    nodes.exit().remove('g');

    // -------------------------------------------------------------------------------------------------------------
    // Links
    // -------------------------------------------------------------------------------------------------------------
    let links = g.selectAll('.link')
        .data(treeData.links());

    // Links - Enter
    let links_enter = links.enter().append('path')
        .classed('link', true)
        .classed('link-internal', d => !isLeaf(d.target))
        .classed('link-leaf', d => isLeaf(d.target))
        .classed('unexplored', d => isUnexplored(d.target))
        .classed('explored', d => isExplored(d.target))
        .classed('solved', d => isSolved(d.target))
        .attr('d', d3.linkVertical()
        .source(d => [
            d.source.x + width/2 + margin.left,
            d.source.y + margin.top + 10.5
        ])
        .target(d => [
            d.target.x + width/2 + margin.left,
            d.target.y + margin.top - 10.5   // 10 = circle radius; .5 = stroke width / 2
        ])
    )

    // Links - Update
    let links_update = links;
    links_update
        .classed('link-internal', d => !isLeaf(d.target))
        .classed('link-leaf', d => isLeaf(d.target))
        .classed('unexplored', d => isUnexplored(d.target))
        .classed('explored', d => isExplored(d.target))
        .classed('solved', d => isSolved(d.target))
        .attr('d', d3.linkVertical()
        .source(d => [
            d.source.x + width/2 + margin.left,
            d.source.y + margin.top + 10.5
        ])
        .target(d => [
            d.target.x + width/2 + margin.left,
            d.target.y + margin.top - 10.5   // 10 = circle radius; .5 = stroke width / 2
        ])
    )

    // Links - Exit
    links.exit().remove('path');

}

// Node has neither been explored (decomposed) or marked as solved
function isUnexplored(node) {
    return !node.data.subtasks.length && !node.data.solved;
}

// Node has been explored (decomposed) but not marked as solved
function isExplored(node) {
    return node.data.subtasks.length && !node.data.solved;
}

// Node has been marked as solved
function isSolved(node) {
    return node.data.solved;
}

// Node has no visible children
function isLeaf(node) {
    return !node.children;
}

function onNodeClick(event, item) {
    $('#task-name').text(item.data.name);
    $('#task-description').text(item.data.description);
    
    let impl = $('#task-implementation');
    if (item.data.implementation) {
        impl.show();
        let impl_text = $('#task-implementation-text');
        impl_text.text(item.data.implementation);
        impl_text.attr('class', `language-python`);

        // highligth element (since the same html elem will be used, we need to unset data-highlighted)
        impl_text.removeAttr('data-highlighted');
        hljs.highlightElement(impl_text[0]);
    } else
        impl.hide()
        // text('Not yet implemented');


    let button_decompose = $('#decompose');
    let button_addsubtask = $('#add-subtask');
    let button_solve = $('#solve');
    let button_unsolve = $('#unsolve');
    let button_edit = $('#edit');
    let button_delete = $('#delete');
    let button_debug = $('#debug');

    // show/hide decomposition only available on decomposed tasks
    button_decompose.text(isLeaf(item) ? 'Show decomposition' : 'Hide decomposition');
    if (isExplored(item) || isSolved(item)) {
        button_decompose.show().unbind().on('click', () => isLeaf(item) ? show_children(item) : hide_children(item));
    } else {
        button_decompose.hide();
    }

    // add_subtask, edit, solve only available on unsolved tasks
    // unsolve only available for solved tasks
    if (isSolved(item)) {
        button_addsubtask.hide();
        button_edit.hide();
        button_solve.hide();

        button_unsolve.show().unbind().on('click', () => unsolve(item));
    } else {
        button_unsolve.hide();

        button_addsubtask.show().unbind().on('click', () => add_subtask(item));
        button_edit.show().unbind().on('click', () => edit_task(item));
        button_solve.show().unbind().on('click', () => solve(item));
    }

    // delete not available on root
    if (item.depth == 0) {
        button_delete.hide();
    } else {
        button_delete.show().unbind().on('click', () => delete_subtask(item));
    }

    // always avaiable
    button_debug.show().unbind().on('click', () => debug_node(item));


    show_buttons();
    // $('#buttons')
    //     .css('left', event.x - 300)
    //     .css('top', event.y + 20)
    //     .show();
}

function show_buttons() {
    $('#buttons').modal('show');
}

function hide_buttons() {
    $('#buttons').modal('hide');
}

function show_children(item) {
    hide_buttons();

    item.data.children = item.data.subtasks;
    update();
}

function hide_children(item) {
    hide_buttons();

    item.data.children = undefined;
    update();
}

function add_subtask(item) {
    hide_buttons();

    let task = item.data;

    let subtask_name = prompt('subtask name');
    let subtask_description = prompt('subtask description');

    task.add_subtask(subtask_name, subtask_description);
    show_children(item);
}

function delete_subtask(item) {
    hide_buttons();

    let parent = item.data.parent;
    if (parent)
        parent.remove_subtask(item.data.name);
    
    update();
}

function solve(item) {
    hide_buttons();

    item.data.solve();

    update();
}

function unsolve(item) {
    hide_buttons();

    item.data.unsolve();

    update();
}

function edit_task(item) {
    hide_buttons();

    let new_name = prompt('new name');
    item.data.name = new_name;

    update();
}

function debug_node(item) {
    hide_buttons();
    
    console.log(item);
}


window.update = update;
window.load_tree = load_tree;
window.save_tree = save_tree;
