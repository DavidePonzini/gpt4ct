import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Main components
let data = movies;

const svg = d3.select('#tree');
const g = svg.append('g');

let current_node = movies;

// Handle zoom
let zoom = d3.zoom()
    .on('zoom', function(e) {
        g.attr('transform', e.transform);
    });
svg.call(zoom);


function show_children(node) {
    node.children = node.subtasks;
}

function hide_children(node) {
    node.children = undefined;
}


$(document).ready(function() {
    init_tree(movies);
})

function init_tree() {
    update();
}

function update() {
    const svg_width = $('#tree').innerWidth();
    const svg_heigth = $('#tree').innerHeight();

    const margin = {
        left: 200,
        right: 200,
        top: 200,
        bottom: 200
    };

    const level_height = 200;

    const width = svg_width - margin.left - margin.right;
    const heigth = svg_heigth - margin.top - margin.bottom;

    const treeLayout = d3.tree();
    const treeData = treeLayout(d3.hierarchy(data, d => d.children));

    // -------------------------------------------------------------------------------------------------------------
    // Nodes
    // -------------------------------------------------------------------------------------------------------------
    let nodes = g.selectAll('.node')
        .data(treeData.descendants())

    // Nodes - Enter
    let nodesG_enter = nodes.enter().append('g')
        .classed('node', true)
        .classed('node-internal', d => d.children)
        .classed('node-leaf', d => !d.children)
        .classed('node-unexplored', d => !d.subtasks && !d.solved)
        .classed('node-explored', d => d.subtasks && !d.solved)
        .classed('node-solved', d => d.solved)
        .attr('transform', d => `translate(${d.x * width + margin.left}, ${d.y * heigth + margin.top})`)
        .on('click', onNodeClick);
    nodesG_enter.append('circle')
        .attr('r', 10);
    nodesG_enter.append('text')
        .attr('dx', 18)
        .attr('dy', '.31em')
        .text(d => d.data.name);

    // Nodes - Update
    let nodesG_update = nodes
        .classed('node', true)
        .classed('node-internal', d => d.children)
        .classed('node-leaf', d => !d.children)
        .classed('node-unexplored', d => !d.subtasks && !d.solved)
        .classed('node-explored', d => d.subtasks && !d.solved)
        .classed('node-solved', d => d.solved)
        .attr('transform', d => `translate(${d.x * width + margin.left}, ${d.y * heigth + margin.top})`)
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
        .attr('d', d3.linkVertical()
        .source(d => [
            d.source.x * width + margin.left,
            d.source.y * heigth + margin.top + 10.5
        ])
        .target(d => [
            d.target.x * width + margin.left,
            d.target.y * heigth + margin.top - 10.5   // 10 = circle radius; .5 = stroke width / 2
        ])
        )

    // Links - Update
    let links_update = links;
    links_update
        .attr('d', d3.linkVertical()
        .source(d => [
            d.source.x * width + margin.left,
            d.source.y * heigth + margin.top + 10.5
        ])
        .target(d => [
            d.target.x * width + margin.left,
            d.target.y * heigth + margin.top - 10.5   // 10 = circle radius; .5 = stroke width / 2
        ])
    )

    // Links - Exit
    links.exit().remove('path');

}

function onNodeClick(event, item) {
    if(item.data.children)
        hide_children(item.data)
    else
        show_children(item.data)

    update();
}


window.show_children = show_children;
window.hide_children = hide_children;
window.update = update;
