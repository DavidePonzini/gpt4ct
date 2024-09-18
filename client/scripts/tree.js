import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Main components
let tree_data = null;
let tree_id = null;
let last_update = null;
let feedback_list = [];
let expanded_tasks = [];

let hide_implementation = true;

const zoom = d3.zoom().on('zoom', function(e) {
    $('#task-data').modal('hide');
    g.attr('transform', e.transform);
});

const svg = d3.select('#tree');
const g = svg.append('g');

const SERVER_ADDR = '15.237.153.101:5000';

window.disable_feedback = false;


$(document).ready(function() {
    // Make dummy tree
    let tree = new Task(null, null, null, null, 'Load an existing task or create a new one', '');

    // Handle zoom
    svg.call(zoom);

    // Init tree
    init(JSON.stringify(tree.toJSON()));
    show_all_children(tree);
    focus_root();

    // Init automatic updates
    setInterval(check_for_update, 2000);
})

function focus_root() {
    svg.transition()
        .duration(750)
        .call(zoom.transform,
            d3.zoomIdentity.translate(0, 50)
        );
}

function focus_on(item) {
    // svg.transition()
    //     .duration(750)
    //     .call(zoom.transform,
    //         d3.zoomIdentity.translate(-item.x, -item.y)
    //     );
}

function new_tree() {
    if (!check_user_id())
        return;

    // let name = $('#new-task-name').val();
    let description = $('#new-task-description').val();

    $.ajax({
        type: 'POST',
        url: `http://${SERVER_ADDR}/create-tree`,
        data: {
            'user_id': JSON.stringify(user_id),
            // 'name': JSON.stringify(name),
            'description': JSON.stringify(description),
        },
        success: function(d) {
            let data = d;
            
            if (data.status && data.status == 'invalid_request') {
                throw Error(data.message);
            }
            
            init(data.tree, data.tree_id, data.last_update, data.feedback_list);
        },
        error: console.error
    });

    $('#new-tree-modal').modal('hide');
}

function load_from_server(focus = false, cb = () => {}) {
    if (!check_user_id())
        return;

    let tree_id = +prompt('Insert tree ID:');
    if (!tree_id)
        return;

    load_from_server_id(tree_id, focus, cb);
}

function load_from_server_id(tree_id, focus = false, cb = () => {}) {
    if (!check_user_id())
        return;

    if (isNaN(tree_id)) {
        alert('Invalid ID format, please try again.');
        return;
    }

    $.ajax({
        type: 'POST',
        url: `http://${SERVER_ADDR}/load-tree`,
        data: {
            'user_id': JSON.stringify(user_id),
            'tree_id': JSON.stringify(tree_id),
        },
        success: function(d) {
            if (d.status && d.status == 'error') {
                alert('Invalid tree ID.');
                return;
            }

            init(d.tree, tree_id, d.last_update, d.feedback_list, expanded_tasks);

            if (focus)
                focus_root();

            cb();
        },
        error: console.error
    });
}

function init(tree_json, _tree_id = null, _last_update = null, _feedback_list = [], _expanded_tasks = []) {
    let tree = Task.load_from_json(tree_json, null, _expanded_tasks);

    tree_data = tree;
    set_tree_id(_tree_id);
    last_update = _last_update;
    feedback_list = _feedback_list;
    expanded_tasks = _expanded_tasks;
    
    draw();
    // Useful for debugging, should be eventually removed
    window.data = tree;
}

function set_tree_id(id) {
    tree_id = id;

    if (tree_id)
        $('#task-button').text(`Tree [${tree_id}]`);
    else
        $('#task-button').text(`Tree`);
}

function draw() {
    const svg_height = $('#tree').innerHeight();

    const padding_x = 100;
    const padding_y = svg_height / 2;

    const max_label_length = 130;

    const treeLayout = d3.tree(null).nodeSize([75, 300]);
    const treeData = treeLayout(d3.hierarchy(tree_data, d => d.children));

    // -------------------------------------------------------------------------------------------------------------
    // Nodes
    // -------------------------------------------------------------------------------------------------------------
    let nodes = g.selectAll('.node')
        .data(treeData.descendants())

    // Nodes - enter
    let nodesG_enter = nodes.enter().append('g')
        .classed('node', true)
        .classed('node-internal', d => !d.data.is_leaf())
        .classed('node-leaf', d => d.data.is_leaf())
        .classed('has-children', d => d.data.has_children())
        .classed('running', d => d.data.running)
        .classed('feedback-required', d => feedback_list.includes(d.data.task_id) && !window.disable_feedback)
        .attr('state', d => d.data.get_state())
        .attr('transform', d => `translate(${d.y + padding_x}, ${d.x + padding_y})`);
    nodesG_enter.append('circle')
        .attr('r', 10)
        .on('click', open_node_menu);
    nodesG_enter.append('text')
        .classed('node-label', true)
        .attr('dx', d => d.data.is_leaf() ? (d.data.has_children() ? 38 : 18) : 0)
        .attr('dy', d => d.data.is_leaf() ? '.31em' : 30)
        .style('text-anchor', d => d.data.is_leaf() ? 'start' : 'middle')
        .each(function (d) {
            let name = d.data.name;
            let elem = d3.select(this);
            
            elem.text(name);

            if (d.data.is_leaf())
                return;

            while (this.getComputedTextLength() > max_label_length) {
                name = name.substr(0, name.length - 1);
                elem.text(name + '...');
            }
        });
    // Expand node icon
    nodesG_enter.append('foreignObject')
        .classed('node-icon-expand', true)
        .classed('fa-solid fa-square-caret-right', d => d.data.is_leaf())
        .classed('fa-regular fa-square-caret-left', d => !d.data.is_leaf())
        .classed('hidden', d => !d.data.has_children())
        .on('click', (e, d) => d.data.is_leaf() ? show_children(d.data, d) : hide_children(d.data, d))
        .attr('width', 20)
        .attr('height', 20)
        .attr('x', 15)
        .attr('y', -10)
    // Implementation icon
    nodesG_enter.append('foreignObject')
        .classed('node-icon-implementation', true)
        .classed('fa', true)
        .classed('fa-code', true)
        .classed('hidden', d => d.data.get_state() != 'implementable' && !hide_implementation)
        .on('click', open_node_menu)       // needed since it's on top of the circle
        .attr('width', 20)
        .attr('height', 20)
        .attr('x', -10)
        .attr('y', -10)
    
    // Nodes - update
    let nodesG_update = nodes
        .classed('node-internal', d => !d.data.is_leaf())
        .classed('node-leaf', d => d.data.is_leaf())
        .classed('has-children', d => d.data.has_children())
        .classed('running', d => d.data.running)
        .classed('feedback-required', d => feedback_list.includes(d.data.task_id) && !window.disable_feedback)
        .attr('state', d => d.data.get_state())
        .attr('transform', d => `translate(${d.y + padding_x}, ${d.x + padding_y})`);
    nodesG_update.select('circle')
        .on('click', open_node_menu);
    nodesG_update.select('.node-label')
        .attr('dx', d => d.data.is_leaf() ? (d.data.has_children() ? 38 : 18) : 0)
        .attr('dy', d => d.data.is_leaf() ? '.31em' : 30)
        .style('text-anchor', d => d.data.is_leaf() ? 'start' : 'middle')
        .each(function (d) {
            let name = d.data.name;
            let elem = d3.select(this);
            
            elem.text(name);

            if (d.data.is_leaf())
                return;

            while (this.getComputedTextLength() > max_label_length) {
                name = name.substr(0, name.length - 1);
                elem.text(name + '...');
            }
        });
    nodesG_update.select('.node-icon-expand')
        .classed('fa-solid fa-square-caret-right', d => d.data.is_leaf())
        .classed('fa-regular fa-square-caret-left', d => !d.data.is_leaf())
        .classed('hidden', d => !d.data.has_children())
        .on('click', (e, d) => d.data.is_leaf() ? show_children(d.data, d) : hide_children(d.data, d));
    nodesG_update.select('.node-icon-implementation')
        .classed('hidden', d => d.data.get_state() != 'implementable' && !hide_implementation)
        .on('click', open_node_menu);       // needed since it's on top of the circle

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
        .classed('has-children', d => d.target.data.has_children())
        .classed('feedback-required', d => feedback_list.includes(d.target.data.task_id) && !window.disable_feedback)
        .attr('state', d => d.target.data.get_state())
        .attr('d', d3.linkHorizontal()
        .source(d => [
            d.source.y + padding_x + 10.5,
            d.source.x + padding_y
        ])
        .target(d => [
            d.target.y + padding_x - 10.5,   // 10 = circle radius; .5 = stroke width / 2
            d.target.x + padding_y
        ])
    )

    // Links - Update
    let links_update = links;
    links_update
        .classed('link-internal', d => !d.target.data.is_leaf())
        .classed('link-leaf', d => d.target.data.is_leaf())
        .classed('has-children', d => d.target.data.has_children())
        .classed('feedback-required', d => feedback_list.includes(d.target.data.task_id) && !window.disable_feedback)
        .attr('state', d => d.target.data.get_state())
        .attr('d', d3.linkHorizontal()
        .source(d => [
            d.source.y + padding_x + 10.5,
            d.source.x + padding_y
        ])
        .target(d => [
            d.target.y + padding_x - 10.5,   // 10 = circle radius; .5 = stroke width / 2
            d.target.x + padding_y
        ])
    )

    // Links - Exit
    links.exit().remove('path');

    // -------------------------------------------------------------------------------------------------------------
    // Raised elements
    // -------------------------------------------------------------------------------------------------------------
    
    // Raise nodes above links
    g.selectAll('g').raise();


    // Update feedback counter
    let feedback_count = $('g.feedback-required').length;
    let feedback_button = $('#feedback-count');
    if (feedback_count > 0  && !window.disable_feedback) {
        feedback_button.text(`You can provide feedback for ${feedback_count} task(s)`)
        feedback_button.show();
    } else {
        feedback_button.hide();
    }

}

function open_node_menu(event, item) {
    // Prevent any action if API is generating output
    if ($('.running').length > 0)
        return;

    // Prevent any action for sample tree
    if (!tree_id)
        return;

    // Set name
    let name = $('#task-name');
    name.text(`${item.data.name}`);

    // Set description
    let description = $('#task-description');
    description.text(item.data.description);
    
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

        // Implementation edit
        let impl_prompt = $('#task-implementation-prompt-text');
        let impl_button = $('#task-implementation-prompt-send');

        // Reset each time implementation prompt text
        impl_prompt.val('');

        // Function to enable/disable the button based on input value
        const toggleButtonState = () => {
            impl_button.prop('disabled', impl_prompt.val().trim() === '');
        };

        // Initial button state
        toggleButtonState();

        // Bind impl edit
        impl_prompt.unbind().on('input', () => {
            toggleButtonState();
        }).keydown(({key}) => {
            if (key === 'Enter' && impl_prompt.val().trim() !== '') {
                impl_button.click(); // Trigger button click on Enter
            }
        });

        // Bind impl edit button 
        impl_button.unbind().on('click', function() {
            let text = impl_prompt.val().trim();
            if (text !== '') {
                generate_implementation(item, item.data.implementation_language, text);
            }
        });
    } else {
        impl.hide()
    }


    // Hide manual decomposition prompt
    $('#task-decomposition-manual').hide();

    // Show decomposition feedback, if needed
    if (feedback_list.includes(item.data.task_id) && !window.disable_feedback) {
        prepare_feedback_decomposition(item);
        $('#task-feedback-decomposition').show();
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

    // hide question about decomposition if task has no children
    if (!item.data.has_children()) {
        $('#task-feedback-decomposition-q3').val(-1);
        $('#task-feedback-decomposition-q3-all').hide();
    } else {
        $('#task-feedback-decomposition-q3-all').show();
    }

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

            $.ajax({
                type: 'POST',
                url: `http://${SERVER_ADDR}/feedback`,
                data: {
                    'task_id': JSON.stringify(item.data.task_id),
                    'user_id': JSON.stringify(user_id),
                    'q1': JSON.stringify(q1),
                    'q2': JSON.stringify(q2),
                    'q3': JSON.stringify(q2),
                },
                success: function(d) {
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
    // let button_show_decomposition = $('#show-decomposition');
    // button_show_decomposition.text(item.data.is_leaf() ? 'Show decomposition' : 'Hide decomposition');
    // if (item.data.has_children()) {
    //     button_show_decomposition.show().unbind().on('click', () => item.data.is_leaf() ? show_children(item.data) : hide_children(item.data));
    // } else {
    //     button_show_decomposition.hide();
    // }

    // Decompose: only available for unsolved tasks
    let button_decompose = $('#decompose');
    if (!item.data.is_solved()) {
        button_decompose.show();
        $('#decompose-manual').unbind().on('click', () => manual_decomposition(item));
        $('#decompose-ai').unbind().on('click', () => generate_decomposition(item));
    } else {
        button_decompose.hide();
    }

    // Implement: only available on unsolved tasks that can be implemented
    let button_implement = $('#implement');
    if (!item.data.is_solved() && item.data.can_be_implemented() && !hide_implementation) {
        button_implement.show();
        $('#dont-implement').unbind().on('click', function() {
            delete_implementation(item);
            solve(item, true);
        });
        $('#implement-py').unbind().on('click', () => generate_implementation(item, 'python'));
        $('#implement-c').unbind().on('click', () => generate_implementation(item, 'c'));
        $('#implement-cpp').unbind().on('click', () => generate_implementation(item, 'c++'));
        $('#implement-cs').unbind().on('click', () => generate_implementation(item, 'c#'));
        $('#implement-java').unbind().on('click', () => generate_implementation(item, 'java'));
        $('#implement-js').unbind().on('click', () => generate_implementation(item, 'javascript'));
        $('#implement-delete').unbind().on('click', () => delete_implementation(item));
    } else {
        button_implement.hide();
    }

    // Solve/unsolve: available on all tasks, depending on whether they've been solved
    let button_solve = $('#solve');
    let button_unsolve = $('#unsolve');
    if (item.data.is_solved()) {
        button_solve.hide();
        button_unsolve.show().unbind().on('click', () => solve(item, false));
    } else {
        button_solve.show().unbind().on('click', () => solve(item, true));
        button_unsolve.hide();
    }
}

function generate_decomposition(item) {
    hide_buttons();

    if (!check_user_id())
        return;    

    let task = item.data;

    task.generate_decomposition(user_id, function(d) {
        task.running = false;

        d = JSON.parse(d);

        if (d.status == 'not_allowed') {
            alert('This option is not enabled for your account');
            return;
        }

        // show this task after refresh
        expanded_tasks.push(task.task_id);

        update();
    }, function(e) {
        console.error(e);
        task.running = false;
        alert('error, see console for info');
        draw();
    });

    item.data.running = true;
    draw();
}

function manual_decomposition(item) {
    if (!check_user_id())
        return;

    // Clear the list
    $('#task-decomposition-manual-tasks > div').remove();
    
    let subtasks = item.data.subtasks;
    if (subtasks.length) {
        for (let subtask of subtasks)
            manual_decomposition_add_button(subtask.task_id, subtask.name, subtask.description);
    } else {
        manual_decomposition_add_button(null, '', '');
    }

    // Make the list sortable
    $("#task-decomposition-manual-tasks").sortable().disableSelection();

    // Bind functionality to "add subtask" button
    $('#task-decomposition-manual-add-subtask').unbind().on('click', () => manual_decomposition_add_button(null, '', ''));

    $('#task-decomposition-manual-submit').unbind().on('click', () => submit_manual_decomposition(item));
    $('#task-decomposition-manual').show();
}

function manual_decomposition_add_button(task_id, name, description) {
    let div = $('<div class="list-group-item list-group-item-action list-group-item-light"></div>');
    
    let div_title = $('<div style="display: flex"></div>');
    let label1 = $('<label class="form-label"><b>Name:</b></label>');
    let sort = $('<i class="fa-solid fa-sort" style="margin: 0 0 0 auto; padding: .25em"></i>');
    let close = $('<button type="button" class="btn-close" aria-label="Close" style="margin: 0 0 0 .5em;"></button>');
    close.on('click', () => div.remove());

    div_title.append(label1).append(sort).append(close);

    let input1 = $('<input type="text" class="form-control">');
    input1.val(name);
    input1.attr('task_id', task_id);        // task_id is embedded here for simplicity 

    let label2 = $('<label class="form-label mt-3"><b>Description:</b></label>');
    let input2 = $('<textarea class="form-control" rows="3"></textarea>');
    input2.val(description);

    div.append(div_title).append(input1).append(label2).append(input2);
    
    let button = $('#task-decomposition-manual-add-subtask');
    div.insertBefore(button);
}

function submit_manual_decomposition(item) {
    let subtasks = [];

    let elems = $('#task-decomposition-manual-tasks > div');
    for (let elem of elems) {
        let name = $(elem).find('input').val();
        let task_id = $(elem).find('input').attr('task_id');
        let description = $(elem).find('textarea').val();

        subtasks.push({
            'task_id': task_id ? task_id : null,
            'name': name,
            'description': description,
        })
    }    

    // Mark this task for expansion after update
    expanded_tasks.push(item.data.task_id);

    hide_buttons();
    
    $.ajax({
        type: 'POST',
        url: `http://${SERVER_ADDR}/update-tasks`,
        data: {
            'parent_id': JSON.stringify(item.data.task_id),
            'user_id': JSON.stringify(user_id),
            'tasks': JSON.stringify(subtasks),
        },
        success: update,
        error: function(e) {
            console.error(e);
            item.data.running = false;
            alert('error, see console for info');
        }
    });
    

}


function delete_implementation(item) {
    item.data.remove_implementation(user_id, update, function(e) {
        console.error(e);
        item.data.running = false;
        alert('error, see console for info');
    });

    hide_buttons();
}


function generate_implementation(item, language, additional_instructions = null) {
    hide_buttons();

    if (!check_user_id())
        return;    

    item.data.generate_implementation(user_id, language, additional_instructions, function(d) {
        d = JSON.parse(d);

        if (d.status == 'not_allowed') {
            alert('This option is not enabled for your account');
            return;
        }

        update();
    }, function(e) {
        console.error(e);
        item.data.running = false;
        alert('error, see console for info');
    });

    item.data.running = true;
    draw();
}

function show_task_data_modal() {
    $('#task-data').modal('show');
}

function hide_buttons() {
    $('#task-data').modal('hide');
}

function solve(item, solved) {
    hide_buttons();

    $.ajax({
        type: 'POST',
        url: `http://${SERVER_ADDR}/solve`,
        data: {
            'user_id': JSON.stringify(user_id),
            'task_id': JSON.stringify(item.data.task_id),
            'solved': JSON.stringify(solved)
        },
        success: update,
        error: console.error
    });
}

function show_children(task, item = null) {
    // hide_buttons();

    task.show_children(false, (t) => expanded_tasks.push(t.task_id));

    draw();

    if (item)
        focus_on(item);

}

function hide_children(task, item = null) {
    // hide_buttons();

    task.hide_children(false, (t) => expanded_tasks.splice(expanded_tasks.indexOf(t.task_id)));
    
    draw();

    if (item)
        focus_on(item);    
}

function show_all_children() {
    tree_data.show_children(true, (t) => expanded_tasks.push(t.task_id));
    draw();
window.expanded_tasks = expanded_tasks;
}

function hide_all_children() {
    tree_data.hide_children(true, (t) => expanded_tasks.splice(expanded_tasks.indexOf(t.task_id)));
    draw();
}

function select_my_trees() {
    if (!check_user_id())
        return;

    $.ajax({
        type: 'POST',
        url: `http://${SERVER_ADDR}/my-trees`,
        data: {
            'user_id': JSON.stringify(user_id),
        },
        success: function(d) {
            let trees = d.trees;

            if (trees.length) {
                let list = $('#my-trees');
                let modal = $('#my-trees-modal');
                list.empty();

                for (let tree of trees) {
                    let btn = $('<button class="list-group-item list-group-item-action"></button>');
                    
                    if (tree.solved)
                        btn.addClass('list-group-item-success');

                    btn.text(`[${tree.tree_id}] ${tree.name}`);
                    btn.on('click', () => load_from_server_id(tree.tree_id, true, () => modal.modal('hide')));

                    list.append(btn);
                }

                modal.modal('show');
            } else {
                alert('You have not created any tree yet');
            }
        },
        error: console.error
    });

                        

}

function check_for_update() {
    if (!tree_id)
        return;

    $.ajax({
        type: 'POST',
        url: `http://${SERVER_ADDR}/get-tree-last-update`,
        data: {
            'tree_id': JSON.stringify(tree_id),
        },
        success: function(d) {
            let ts = d.last_update;

            if (ts > last_update)
                update();
        },
        error: console.error
    });
}

function update() {
    if (!tree_id)
        return;

    load_from_server_id(tree_id);
    update_user_data();
}

window.draw = draw;
window.update = update;
window.new_tree = new_tree;
window.load = load_from_server;
window.load_id = load_from_server_id;
window.show_all_children = show_all_children;
window.hide_all_children = hide_all_children;
window.focus_root = focus_root;
window.select_my_trees = select_my_trees;