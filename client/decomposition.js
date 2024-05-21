import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Main components
let tree_data = null;

const svg = d3.select('#tree');
const g = svg.append('g');

// Handle zoom
let zoom = d3.zoom().on('zoom', function(e) {
    $('#task-data').hide();
    g.attr('transform', e.transform);
});
svg.call(zoom);


// load
$(document).ready(function() {
    // Make dummy tree
    let data = new Task('Load a task', 'Load an existing task');

    let sub1 = data.add_subtask('Click on "Load" button', 'Click on the "Load" button using the bar on top');
    sub1.add_subtask('Locate the top bar', 'Locate the top bar where the "Load" button is located');
    sub1.add_subtask('Click on the button', 'Click on the "Load" button by selecting it with the cursor');
    
    let sub2 = data.add_subtask('Select a file', 'Select a file to be loaded');
    let sub3 = data.add_subtask('Load the file', 'Load a file by clicking on "OK"');

    init(data);
    show_children(data);
    show_children(sub1);
})

function new_tree() {
    let name = $('#new-task-name').val();
    let description = $('#new-task-description').val();

    let data = new Task(name, description);

    init(data);
    $('#new-tree-modal').modal('hide');
}

function load_tree() {
    let input = $('<input type="file" accept=".json,text/plain" />');
    input.unbind().bind('change', function(e) {
        let reader = new FileReader();
        reader.addEventListener('load', function(e) {
            let json = JSON.parse(e.target.result);
            
            let tree = json.tree;
            let task = Task.load_tree(tree);

            init(task);
        });
        reader.readAsText(e.target.files[0]);
    });
    input.click();
}

function save_tree(filename) {
    var a = document.createElement("a");

    let data = {
        'tree': tree_data,
    }

    var file = new Blob([JSON.stringify(data)], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
}

function init(data) {
    tree_data = data;
    update();

    // Useful for debugging, should be eventually removed
    window.data = tree_data;
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
        .classed('node-internal', d => !d.data.is_leaf())
        .classed('node-leaf', d => d.data.is_leaf())
        .classed('unexplored', d => d.data.is_unexplored())
        .classed('explored', d => d.data.is_explored())
        .classed('solved', d => d.data.is_solved())
        .classed('running', d => d.data.running)
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
        .classed('node-internal', d => !d.data.is_leaf())
        .classed('node-leaf', d => d.data.is_leaf())
        .classed('unexplored', d => d.data.is_unexplored())
        .classed('explored', d => d.data.is_explored())
        .classed('solved', d => d.data.is_solved())
        .classed('running', d => d.data.running)
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
        .classed('link-internal', d => !d.target.data.is_leaf())
        .classed('link-leaf', d => d.target.data.is_leaf())
        .classed('unexplored', d => d.target.data.is_unexplored())
        .classed('explored', d => d.target.data.is_explored())
        .classed('solved', d => d.target.data.is_solved())
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
        .classed('link-internal', d => !d.target.data.is_leaf())
        .classed('link-leaf', d => d.target.data.is_leaf())
        .classed('unexplored', d => d.target.data.is_unexplored())
        .classed('explored', d => d.target.data.is_explored())
        .classed('solved', d => d.target.data.is_solved())
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

function onNodeClick(event, item) {
    // Prevent any action if API is generating output
    if ($('.running').length > 0) {
        return;
    }

    // Set name
    let name = $('#task-name');
    name.text(item.data.name);
    name.unbind().on('input', function() {
        item.data.name = name.text();
        update();   // Reflect name changes in UI
    });

    // Set description
    let description = $('#task-description');
    description.text(item.data.description);
    description.unbind().on('input', () => item.data.description = description.text());
    
    // Set implementation, if available
    let impl = $('#task-implementation');
    if (item.data.implementation) {
        impl.show();
        let impl_text = $('#task-implementation-text');
        impl_text.text(item.data.implementation);
        impl_text.attr('class', `language-python`);

        // highligth element (since the same html elem will be used, we need to unset data-highlighted)
        impl_text.removeAttr('data-highlighted');
        hljs.highlightElement(impl_text[0]);
    } else {
        impl.hide()
    }

    // Show appropriate buttons for current task
    show_buttons(item);

    // Make the modal visible
    show_task_data_modal();
}

/**
 * Show the appropriate buttons for the given task
 * @param {*} item 
 */
function show_buttons(item) {
    // Show/hide decomposition: only available on decomposed tasks
    let button_show_decomposition = $('#show-decomposition');
    button_show_decomposition.text(item.data.is_leaf() ? 'Show decomposition' : 'Hide decomposition');
    if (item.data.has_children()) {
        button_show_decomposition.show().unbind().on('click', () => item.data.is_leaf() ? show_children(item.data) : hide_children(item.data));
    } else {
        button_show_decomposition.hide();
    }

    // Decompose: only available for unsolved tasks with no children
    let button_decompose = $('#decompose');
    if (!item.data.is_solved() && !item.data.has_children()) {
        button_decompose.show().unbind().on('click', () => generate_decomposition(item));
    } else {
        button_decompose.hide();
    }

    // Add subtask: only available on unsolved tasks
    let button_add_subtask = $('#add-subtask');
    if (!item.data.is_solved()) {
        button_add_subtask.show().unbind().on('click', () => add_subtask(item));
    } else {
        button_add_subtask.hide();
    }

    // Implement: only available on unsolved tasks with no children, or tasks with all children already implemented
    let button_implement = $('#implement');
    if (item.data.is_solved() && item.data.can_be_implemented()) {
        button_implement.show().unbind().on('click', () => implement_task(item));
    } else {
        button_implement.hide();
    }

    // Solve/unsolve: available on all tasks, depending on whether they've been solved
    let button_solve = $('#solve');
    let button_unsolve = $('#unsolve');
    if (item.data.is_solved()) {
        button_solve.hide();
        button_unsolve.show().unbind().on('click', () => unsolve(item));
    } else {
        button_solve.show().unbind().on('click', () => solve(item));
        button_unsolve.hide();
    }

    // Delete: not available on root or solved nodes
    let button_delete = $('#delete');
    if (item.depth == 0 || item.data.is_solved()) {
        button_delete.hide();
    } else {
        button_delete.show().unbind().on('click', () => delete_subtask(item));
    }
}

function generate_decomposition(item) {
    hide_buttons();

    let task = item.data;

    task.generate_decomposition(function(data) {
        task.running = false;
        show_children(task);
    });

    item.data.running = true;
    update();
}


function implement_task(item) {
    hide_buttons();
    
    item.data.generate_implementation(function() {
        item.data.running = false;

        update();
    });

    item.data.running = true;
    update();
}

function show_task_data_modal() {
    $('#task-data').modal('show');
}

function hide_buttons() {
    $('#task-data').modal('hide');
}

function show_children(task) {
    hide_buttons();

    task.show_children();
    update();
}

function hide_children(task) {
    hide_buttons();

    task.hide_children();
    update();
}

function add_subtask(item) {
    hide_buttons();

    let task = item.data;

    let subtask_name = prompt('subtask name');
    let subtask_description = prompt('subtask description');

    task.add_subtask(subtask_name, subtask_description);
    show_children(item.data);
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


window.update = update;
window.new_tree = new_tree;
window.load_tree = load_tree;
window.save_tree = save_tree;