import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Main components
let data = movies;

const svg = d3.select('#tree');
const g = svg.append('g');

// Handle zoom
let zoom = d3.zoom().on('zoom', function(e) {
    $('#buttons').hide();
    g.attr('transform', e.transform);
});
svg.call(zoom);


$(document).ready(function() {
    init_tree(movies);
})

function init_tree() {
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
    const treeData = treeLayout(d3.hierarchy(data, d => d.children));

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
        .attr('transform', d => `translate(${d.y + margin.left}, ${d.x + height/2 + margin.top})`)
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
        .attr('transform', d => `translate(${d.y + margin.left}, ${d.x + height/2 + margin.top})`)
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
            d.source.y + margin.left + 10.5,
            d.source.x + height/2 + margin.top
        ])
        .target(d => [
            d.target.y + margin.left - 10.5,
            d.target.x + height/2 + margin.top   // 10 = circle radius; .5 = stroke width / 2
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
        .attr('d', d3.linkHorizontal()
        .source(d => [
            d.source.y + margin.left + 10.5,
            d.source.x + height/2 + margin.top
        ])
        .target(d => [
            d.target.y + margin.left - 10.5,
            d.target.x + height/2 + margin.top   // 10 = circle radius; .5 = stroke width / 2
        ])
    )

    // Links - Exit
    links.exit().remove('path');

}

// Node has neither been explored (decomposed) or marked as solved
function isUnexplored(node) {
    return !node.data.subtasks && !node.data.solved;
}

// Node has been explored (decomposed) but not marked as solved
function isExplored(node) {
    return node.data.subtasks && !node.data.solved;
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
        impl.text(item.data.implementation);
        impl.attr('class', `language-python`);

        // highligth element (since the same html elem will be used, we need to unset data-highlighted)
        impl.removeAttr('data-highlighted');
        hljs.highlightElement(impl[0]);
    } else
        impl.text('Not yet implemented');
    
    $('#buttons')
        .css('left', event.x - 300)
        .css('top', event.y + 20)
        .show();

    $('#decompose').unbind().on('click', () => decompose(item));
    $('#solve').unbind().on('click', () => solve(item));
    $('#debug').unbind().on('click', () => debug_node(item));
}

function decompose(item) {
    $('#buttons').hide();

    if(isLeaf(item))
        item.data.children = item.data.subtasks;
    else
        item.data.children = undefined;

    update();
}

function solve(item) {
    $('#buttons').hide();

    item.data.solved = !item.data.solved;

    update();
}

function debug_node(item) {
    $('#buttons').hide();
    
    console.log(item);
}


window.update = update;
