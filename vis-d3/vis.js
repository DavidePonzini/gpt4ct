import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";


let current_node = movies;


function show_children(node) {
    node.children = node.subtasks;
}

function hide_children(node) {
    node.children = [];
}

window.show_children = show_children;
window.hide_children = hide_children;

$(document).ready(function() {
    init_tree(movies);
})

function init_tree(data) {
    const svg = d3.select('#tree');
    svg.append('g');

    update(data);
}

function update(data) {
    const g = d3.select('#tree > g');


    const width = $('#tree').width();
    const heigth = $('#tree').height();

    let treeLayout = d3.tree();
    let treeData = treeLayout(d3.hierarchy(data, d => d.children));

    // Nodes
    let nodes = g.selectAll('.node')
        .data(treeData.descendants())

    let nodesG = nodes.enter().append('g')
        .attr('class', d => d.children ? 'node node-internal' : 'node node-leaf')
        .attr('transform', d => `translate(${d.y * width + 30}, ${d.x * heigth})`);
    nodesG.append('circle')
        .attr('r', 10);
    nodesG.append('text')
        .text(d => d.name);

}

window.update = update;


let zoom = d3.zoom()
    .on('zoom', function(e) {
        // console.log(e.transform)
        d3.select('#tree > g')
            .attr('transform', e.transform);
    });

d3.select('svg')
    .call(zoom);