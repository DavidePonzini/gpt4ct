import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Main components
let tree_data = null;
let tree_id = null;
let user_id = null;

const svg = d3.select('#tree');
const g = svg.append('g');

const SERVER_ADDR = '15.237.153.101:5000';

let disable_feedback = false;


// --------------------------------------------------------------------------
// Handle zoom
let zoom = d3.zoom().on('zoom', function(e) {
    $('#task-data').modal('hide');
    g.attr('transform', e.transform);
});
svg.call(zoom);


function focus_root() {
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
}

$(document).ready(function() {
    // Make dummy tree
    let tree = new Task('Load an existing task or create a new one', '');

    let sample_load = tree.add_subtask('Load an existing task', '');
    let sample_new = tree.add_subtask('Create a new task');

    sample_load.add_subtask('Click on Task > Load by ID');
    sample_load.add_subtask('Enter the task\'s ID');
    sample_load.add_subtask('Confirm');

    sample_new.add_subtask('Login');
    sample_new.add_subtask('Click on Task > New');
    sample_new.add_subtask('Insert task data');
    sample_new.add_subtask('Confirm');

    init(tree, null);
    show_all_children(tree);
})

function login() {
    if (user_id)
        return;

    let uid = prompt('Insert user id:');
    $.ajax({
        type: 'POST',
        url: `http://${SERVER_ADDR}/login`,
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

                $('#user-id')
                    .text(`User: ${user_id}`)
                    .removeClass('btn-outline-primary')
                    .addClass('btn-outline-secondary')
                    .prop('disabled', true);
                
                    return;
            }

            alert(`User "${uid}" does not exist. Try again.`);
        },
        error: console.error
    });
}


function check_user_id(cb) {
    if (!user_id) {
        alert('You need to login first!');
        return false;
    }

    return true;
}

function new_tree() {
    if (!check_user_id())
        return;

    let name = $('#new-task-name').val();
    let description = $('#new-task-description').val();

    $.ajax({
        type: 'POST',
        url: `http://${SERVER_ADDR}/create-tree`,
        data: {
            'user_id': JSON.stringify(user_id),
            'name': JSON.stringify(name),
            'description': JSON.stringify(description),
        },
        success: function(d) {
            let data = d;
            
            if (data.status && data.status == 'invalid_request') {
                throw Error(data.message);
            }
            
            let tree = Task.load_from_json(data.tree);
            let tree_id = data.tree_id;

            init(tree, tree_id);
        },
        error: console.error
    });

    $('#new-tree-modal').modal('hide');
}

function save_to_server() {
    if (!tree_id) {
        alert('This tree cannot be saved.')
        return
    }

    $.ajax({
        type: 'POST',
        url: `http://${SERVER_ADDR}/save-tree`,
        data: {
            'user_id': JSON.stringify(user_id),
            'tree_id': JSON.stringify(tree_id),
            'tree': JSON.stringify(tree_data),
        },
        success: function(d) {
            set_tree_id(d.tree_id);

            alert('Save successful');
        },
        error: console.error
    });
}

function load_from_server() {

}

function load_from_server_id() {
    let tree_id = +prompt('Insert tree ID:');
    if (isNaN(tree_id)) {
        alert('Invalid ID format, please try again.');
        return;
    }

    $.ajax({
        type: 'POST',
        url: `http://${SERVER_ADDR}/load-tree`,
        data: {
            'tree_id': JSON.stringify(tree_id),
            'tree': JSON.stringify(tree_data),
        },
        success: function(d) {
            if (d.status && d.status == 'error') {
                alert('Invalid tree ID.');
                return;
            } 

            tree_data = Task.load_from_json(d.tree);
            init(tree_data, tree_id);
        },
        error: console.error
    });
}

function init(tree, id) {
    tree_data = tree;
    set_tree_id(id);
    
    update();

    // Useful for debugging, should be eventually removed
    window.data = tree_data;
}

function set_tree_id(id) {
    tree_id = id;

    if (tree_id)
        $('#task-button').text(`Task [${tree_id}]`);
    else
        $('#task-button').text(`Task`);

}

function update() {
    const svg_width = $('#tree').innerWidth();
    // const svg_height = $('#tree').innerHeight();

    const margin = {
        left: 50,
        right: 200,
        top: 50,
        bottom: 200
    };

    const width = svg_width - margin.left - margin.right;
    // const height = svg_height - margin.top - margin.bottom;
    const max_label_length = 150;

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
        .classed('implemented', d => d.data.implementation)
        .classed('solved', d => d.data.is_solved())
        .classed('running', d => d.data.running)
        .classed('feedback-required', d => d.data.needs_feedback() && !disable_feedback)
        .attr('transform', d => `translate(${d.x + width/2 + margin.left}, ${d.y + margin.top})`)
        .on('click', onNodeClick);
    nodesG_enter.append('circle')
        .attr('r', 10);
    nodesG_enter.append('text')
        .attr('dx', 18)
        .attr('dy', '.31em')
        .each(function (d) {
            let name = d.data.name;
            let elem = d3.select(this);
            
            elem.text(name);

            // skip root node, we always have infinite space
            if (d.data.is_root())
                return;

            while (this.getComputedTextLength() > max_label_length) {
                name = name.substr(0, name.length - 1);
                elem.text(name + '...');
            }
        });

    // Nodes - Update
    let nodesG_update = nodes
        .classed('node-internal', d => !d.data.is_leaf())
        .classed('node-leaf', d => d.data.is_leaf())
        .classed('unexplored', d => d.data.is_unexplored())
        .classed('explored', d => d.data.is_explored())
        .classed('implemented', d => d.data.implementation)
        .classed('solved', d => d.data.is_solved())
        .classed('running', d => d.data.running)
        .classed('feedback-required', d => d.data.needs_feedback() && !disable_feedback)
        .attr('transform', d => `translate(${d.x + width/2 + margin.left}, ${d.y + margin.top})`)
        .on('click', onNodeClick);
    nodesG_update.select('text')
        .each(function (d) {
            let name = d.data.name;
            let elem = d3.select(this);
            
            elem.text(name);

            // skip root node, we always have infinite space
            if (d.data.is_root())
                return;

            while (this.getComputedTextLength() > max_label_length) {
                name = name.substr(0, name.length - 1);
                elem.text(name + '...');
            }
        });

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
        .classed('feedback-required', d => d.target.data.needs_feedback() && !disable_feedback)
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
        .classed('feedback-required', d => d.target.data.needs_feedback() && !disable_feedback)
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

    // Update feedback counter
    let feedback_count = $('g.feedback-required').length;
    let feedback_button = $('#feedback-count');
    if (feedback_count > 0  && !disable_feedback) {
        feedback_button.text(`You need to provide feedback for ${feedback_count} task(s)`)
        feedback_button.show();
    } else {
        feedback_button.hide();
    }

}

function onNodeClick(event, item) {
    // Prevent any action if API is generating output
    if ($('.running').length > 0) {
        return;
    }

    // Prevent any action for sample tree
    if (!tree_id) {
        return;
    }

    // Set name
    let name = $('#task-name');
    name.val(item.data.name);
    name.unbind().on('input', function() {
        item.data.name = name.val();
        update();   // Reflect name changes in UI
    });

    // Set description
    let description = $('#task-description');
    description.val(item.data.description);
    description.unbind().on('input', () => item.data.description = description.val());
    
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
    if (item.data.requires_feedback_decomposition && !disable_feedback) {
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
    
    $('#task-feedback-decomposition-submit').prop('disabled', false).unbind().on('click', function() {
        if (!check_user_id())
            return;

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
            let q1 = $('#task-feedback-decomposition-q1').val();
            let q2 = $('#task-feedback-decomposition-q2').val();
            let q3 = $('#task-feedback-decomposition-q3').val();
            let q4 = $('#task-feedback-decomposition-q4').val();
            let comments = $('#task-feedback-decomposition-comments').val();

            $.ajax({
                type: 'POST',
                url: `http://${SERVER_ADDR}/feedback-decomposition`,
                data: {
                    'decomposition_id': JSON.stringify(item.data.decomposition_id),
                    'user_id': JSON.stringify(user_id),
                    'q1': JSON.stringify(q1),
                    'q2': JSON.stringify(q2),
                    'q3': JSON.stringify(q3),
                    'q4': JSON.stringify(q4),
                    'comments': JSON.stringify(comments)
                },
                success: function(d) {
                    item.data.requires_feedback_decomposition = false;
                    $('#task-feedback-decomposition').hide();

                    update();
                },
                error: console.error
            });

            // Request sent - disable submit button
            $('#task-feedback-decomposition-submit').prop("disabled", true);
            
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
    let button_decompose = $('#decompose');
    if (!item.data.is_solved()) {
        button_decompose.show();
        $('#decompose-manual').unbind().on('click', () => manual_decomposition(item));
        $('#decompose-ai').unbind().on('click', () => generate_decomposition(item));

        // Delete decomposition: available on nodes that have children
        let button_delete = $('#delete-decomposition');
        if (item.data.has_children()) {
            button_delete.show().unbind().on('click', () => delete_children(item));
        } else {
            button_delete.hide();
        }
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
}

function generate_decomposition(item) {
    hide_buttons();

    if (!check_user_id())
        return;    

    let task = item.data;

    task.generate_decomposition(tree_id, user_id, function(d) {
        set_tree_id(d.tree_id);
        
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

    $('#task-decomposition-manual-submit').unbind().on('click', () => submit_manual_decomposition(item));
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

    item.data.generate_implementation(tree_id, user_id, language, function(d) {
        item.data.running = false;

        set_tree_id(d.tree_id);

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

function delete_children(item) {
    hide_buttons();

    item.data.clear_subtasks();
    item.data.needs_feedback_decomposition = false;
    
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

function show_all_children() {
    tree_data.show_children(true);
    update();
}

function hide_all_children() {
    tree_data.hide_children(true);
    update();
}


window.update = update;
window.new_tree = new_tree;
window.save = save_to_server;
window.load = load_from_server;
window.load_id = load_from_server_id;
window.login = login;
window.show_all_children = show_all_children;
window.hide_all_children = hide_all_children;
window.focus_root = focus_root;