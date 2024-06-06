import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Main components
let tree_data = null;
let user_id = null;

const svg = d3.select('#tree');
const g = svg.append('g');

// Handle zoom
let zoom = d3.zoom().on('zoom', function(e) {
    $('#task-data').hide();
    g.attr('transform', e.transform);
});
svg.call(zoom);

function login() {
    if (user_id)
        return;

    let uid = prompt('Insert user id:');
    $.ajax({
        type: 'POST',
        url: 'http://localhost:5000/login',
        data: {
            'user_id': JSON.stringify(uid),
        },
        success: function(d) {
            let data = d;
            
            if (data.status && data.status == 'invalid_request') {
                throw Error(data.message);
            }
            
            if (data.user) {
                user_id = uid;

                $('#user-id').text(user_id).removeClass('btn-outline-primary').addClass('btn-outline-secondary');
                return;        
            }

            alert(`User "${uid}" does not exist. Try again.`);
        },
        error: console.error
    });
}

function make_tree(name, description) {
    if (!check_user_id())
        return;    

    return {
        'tree': new Task(name, description),
        'creation_ts': new Date(),
        'user_id': user_id
    };
}

function check_user_id(cb) {
    if (!user_id) {
        alert('You need to login first!');
        return false;
    }

    return true;
}


// load
$(document).ready(function() {
    // Make dummy tree
    user_id = 'example_tree';   // quick fix for showing a tree withouth a user
    let data = make_tree('Load a task', 'Load an existing task');
    let tree = data.tree

    let sub1 = tree.add_subtask('Click on "Load" button', 'Click on the "Load" button using the bar on top');
    sub1.add_subtask('Locate the top bar', 'Locate the top bar where the "Load" button is located');
    sub1.add_subtask('Click on the button', 'Click on the "Load" button by selecting it with the cursor');
    
    let sub2 = tree.add_subtask('Select a file', 'Select a file to be loaded');
    let sub3 = tree.add_subtask('Load the file', 'Load a file by clicking on "OK"');

    init(data);
    show_children(tree);
    show_children(sub1);
    user_id = null;

})

function new_tree() {
    let name = $('#new-task-name').val();
    let description = $('#new-task-description').val();

    let data = make_tree(name, description);

    init(data);
    $('#new-tree-modal').modal('hide');
}

function load_tree() {
    let input = $('<input type="file" accept=".json,text/plain" />');
    input.unbind().bind('change', function(e) {
        let reader = new FileReader();
        reader.addEventListener('load', function(e) {
            let json = JSON.parse(e.target.result);
            
            let data = {
                'tree': Task.load_tree(json.tree),
                'creation_ts': json.creation_ts
            };

            init(data);
        });
        reader.readAsText(e.target.files[0]);
    });
    input.click();
}

function save_tree() {
    var a = document.createElement("a");
    let filename = `${tree_data.tree.name.replace(/\s/g, '_')}.json`;

    let data = {
        'tree': tree_data.tree,
        'creation_ts': tree_data.creation_ts
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
    const treeData = treeLayout(d3.hierarchy(tree_data.tree, d => d.children));

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
        .classed('implemented', d => d.data.implementation)
        .classed('solved', d => d.data.is_solved())
        .classed('running', d => d.data.running)
        .classed('feedback-required', d => d.data.needs_feedback())
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
        .classed('implemented', d => d.data.implementation)
        .classed('solved', d => d.data.is_solved())
        .classed('running', d => d.data.running)
        .classed('feedback-required', d => d.data.needs_feedback())
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
        .classed('implemented', d => d.target.data.implementation)
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
        .classed('implemented', d => d.target.data.implementation)
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
    if (item.data.implementation && item.data.implementation_language) {
        impl.show();
        let impl_text = $('#task-implementation-text');
        impl_text.text(item.data.implementation.split('\n').slice(1, -1).join('\n'));       // remove first and last line (```python & ```)
        impl_text.attr('class', `language-${item.data.implementation_language}`);

        // highligth element (since the same html elem will be used, we need to unset data-highlighted)
        impl_text.removeAttr('data-highlighted');
        hljs.highlightElement(impl_text[0]);
    } else {
        impl.hide()
    }

    // Hide manual decomposition prompt
    $('#task-decomposition-manual').hide();

    // Show decomposition feedback, if needed
    if (item.data.needs_feedback_decomposition) {
        $('#task-feedback-decomposition').show();
        prepare_feedback_decomposition(item);
    } else {
        $('#task-feedback-decomposition').hide();
    }

    // Show appropriate buttons for current task
    show_buttons(item);

    // Make the modal visible
    show_task_data_modal();
}

function prepare_feedback_decomposition(item) {
    // Reset all select options
    let questions = $('#task-feedback-decomposition select');
    questions.val(0);

    $('#task-feedback-decomposition textarea').val('');
    
    $('#task-feedback-decomposition-submit').on('click', function() {
        let missing_anwer = false;
        
        // Show feedback for missing answers
        for (let question of questions) {
            question = $(question);
            if (question.val() == 0) {
                question.addClass('is-invalid');
                missing_anwer = true;
            } else {
                question.removeClass('is-invalid');
            }
        }

        // if all answers have been provided, record the feedback and don't ask for it again
        if (!missing_anwer) {
            // TODO: send feedback

            item.data.needs_feedback_decomposition = false;
            $('#task-feedback-decomposition').hide();
        }
    });
}

/**
 * Show the appropriate buttons for the given task
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

    // Decompose: only available for unsolved tasks
    let button_decompose_manual = $('#decompose-manual');
    let button_decompose_ai = $('#decompose-ai');
    if (!item.data.is_solved()) {
        button_decompose_manual.show().unbind().on('click', () => manual_decomposition(item));
        button_decompose_ai.show().unbind().on('click', () => generate_decomposition(item));
    } else {
        button_decompose_manual.hide();
        button_decompose_ai.hide();
    }

    // Add subtask: only available on unsolved tasks
    let button_add_subtask = $('#add-subtask');
    if (!item.data.is_solved()) {
        button_add_subtask.show().unbind().on('click', () => add_subtask(item));
    } else {
        button_add_subtask.hide();
    }

    // Implement: only available on unsolved tasks
    let button_implement = $('#implement');
    if (!item.data.is_solved()) {
        button_implement.show();
        $('#implement-py').unbind().on('click', () => implement_task(item, 'python'));
        $('#implement-js').unbind().on('click', () => implement_task(item, 'javascript'));
        $('#implement-delete').unbind().on('click', () => delete_implementation(item));
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

    // Delete decomposition: available on unsolved nodes that have children
    let button_delete = $('#delete-decomposition');
    if (!item.data.is_solved() && item.data.has_children()) {
        button_delete.show().unbind().on('click', () => delete_children(item));
    } else {
        button_delete.hide();
    }
}

function generate_decomposition(item) {
    hide_buttons();

    if (!check_user_id())
        return;    

    let task = item.data;

    task.generate_decomposition(user_id, tree_data.creation_ts, function(data) {
        task.running = false;
        show_children(task);
    }, function(e) {
        console.error(e);
        task.running = false;
        alert('error, see console for info');
        update();
    });

    item.data.running = true;
    update();
}

function manual_decomposition(item) {
    // Clear the list
    $('#task-decomposition-manual-tasks > div').remove();
    
    for (let subtask of item.data.subtasks) {
        manual_decomposition_add_button(subtask.name, subtask.description);
    }

    // Bind functionality to "add subtask" button
    $('#task-decomposition-manual-add-subtask').unbind().on('click', () => manual_decomposition_add_button('', ''));

    $('#task-decomposition-manual-submit').on('click', () => submit_manual_decomposition(item));
    $('#task-decomposition-manual').show();
}

function manual_decomposition_add_button(name, description) {
    let div = $('<div class="list-group-item list-group-item-action list-group-item-light"></div>');
    
    let div_title = $('<div style="display: flex"></div>');
    let label1 = $('<label class="form-label"><b>Name:</b></label>');
    let close = $('<button type="button" class="btn-close" aria-label="Close" style="margin: 0 0 0 auto;"></button>');
    close.on('click', () => div.remove());

    div_title.append(label1).append(close)

    let input1 = $('<input type="text" class="form-control">');
    input1.val(name);

    let label2 = $('<label class="form-label mt-3"><b>Description:</b></label>');
    let input2 = $('<textarea class="form-control" rows="3"></textarea>');
    input2.val(description);

    div.append(div_title).append(input1).append(label2).append(input2);
    
    let button = $('#task-decomposition-manual-add-subtask');
    div.insertBefore(button);
}

function submit_manual_decomposition(item) {
    item.data.clear_subtasks();

    let elems = $('#task-decomposition-manual-tasks > div');
    for (let elem of elems) {
        let name = $(elem).find('input').val();
        let description = $(elem).find('textarea').val();

        item.data.add_subtask(name, description)
    }    

    hide_buttons();
    show_children(item.data);
    update();
}


function delete_implementation(item) {
    item.data.implementation = null;
    item.data.implementation_language = null;

    hide_buttons();
    update();
}


function implement_task(item, language) {
    hide_buttons();
    
    if (!check_user_id())
        return;    

    item.data.generate_implementation(user_id, tree_data.creation_ts, language, function() {
        item.data.running = false;

        update();
    }, function(e) {
        console.error(e);
        item.data.running = false;
        alert('error, see console for info');
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

// function add_subtask(item) {
//     hide_buttons();

//     let task = item.data;

//     let subtask_name = prompt('subtask name');
//     let subtask_description = prompt('subtask description');

//     task.add_subtask(subtask_name, subtask_description);
//     show_children(item.data);
// }

function delete_children(item) {
    hide_buttons();

    item.data.clear_subtasks();
    
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
window.login = login;