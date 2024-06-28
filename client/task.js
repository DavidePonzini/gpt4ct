const SERVER_ADDR = '15.237.153.101:5000';

class Task {
    constructor(tree_id, node_id, user_id, creation_mode, name, description, solved) {
        this.tree_id = tree_id;
        this.node_id = node_id;
        this.user_id = user_id;
        
        this.name = name;
        this.description = description;

        this.subtasks = [];
        this.parent = null;

        this.creation_mode = creation_mode;

        this.solved = false;

        // only needed for ui, no need to store these properties on server
        this.children = null;
    }

    id() {
        if (this.is_root())
            return []

        let my_id = this.parent.subtasks.findIndex(d => d === this);
        
        return this.parent.id().concat(my_id);
    }

    needs_feedback() {
        return this.requires_feedback_decomposition || this.requires_feedback_implementation;
    }

    is_root() {
        return this.parent == null;
    }

    is_leaf() {
        // Node has no visible children
        return this.children == null;
    }

    is_solved() {
        // Node has been marked as solved
        return this.solved;
    }

    is_explored() {
        // Node has been explored (decomposed) but not marked as solved
        return this.subtasks.length && !this.is_solved();
    }

    is_unexplored() {
        // Node has neither been explored (decomposed) or marked as solved
        return !this.subtasks.length && !this.is_solved();
    }

    has_children() {
        return this.subtasks.length;
    }

    show_children(recursive = false) {
        this.children = this.subtasks;

        if (recursive)
            for (let subtask of this.subtasks)
                subtask.show_children(recursive);

        return this;
    }

    hide_children(recursive = false) {
        this.children = null;

        if (recursive)
            for (let subtask of this.subtasks)
                subtask.hide_children(recursive);

        return this;
    }

    can_be_implemented() {
        // Only leaves and nodes with all theirs children already implemented can be implemented
        for (let child of this.subtasks) {
            if (!child.implementation || !child.can_be_implemented())
                return false;
        }

        return true;
    }

    /**
     * Remove implemenation from current task and all tasks above it (since it would be invalid)
     */
    remove_implementation() {
        this.implementation = null;
        this.implementation_id = null;
        this.implementation_language = null;

        this.requires_feedback_implementation = false;

        if (this.parent)
            this.parent.remove_implementation()
    }

    toJSON() {
        return {
            name: this.name,
            description: this.description,
            subtasks: this.subtasks,
            // Exclude the 'parent' property while converting to JSON, to avoid circular structures

            solved: this.solved,

            decomposition_id: this.decomposition_id,
            requires_feedback_decomposition: this.requires_feedback_decomposition,
            
            implementation: this.implementation,
            implementation_id: this.implementation_id,
            implementation_language: this.implementation_language,
            requires_feedback_implementation: this.requires_feedback_implementation,

            children: !!this.subtasks.length,
        };
    }

    clear_subtasks() {
        this.subtasks = [];
        this.children = [];
        this.requires_feedback_decomposition = false;
    }

    generate_decomposition(tree_id, user_id, cb, cb_error = console.error) {
        // Clear previous decomposition, if exists
        this.clear_subtasks();

        let this_task = this;

        let root_task = this;
        while(!root_task.is_root())
            root_task = root_task.parent;

        $.ajax({
            type: 'POST',
            url: `http://${SERVER_ADDR}/decompose`,
            data: {
                'tree': JSON.stringify(root_task),
                'tree_id': JSON.stringify(tree_id),
                'user_id': JSON.stringify(user_id),
                'task_id': JSON.stringify(this_task.id()),
            },
            success: function(d) {
                try {
                    let data = d;
                    
                    if (data.status && data.status == 'invalid_request') {
                        throw Error(data.message);
                    }

                    let new_task = Task.load_from_json(data.task, parent = this_task.parent);
                    this_task.copy_subtasks(new_task);
                    this_task.decomposition_id = new_task.decomposition_id;
                    this_task.requires_feedback_decomposition = new_task.requires_feedback_decomposition;

                    cb(data);
                } catch (e) {
                    cb_error(d);
                    throw e;
                }
            },
            error: cb_error
        });
    }

    copy_subtasks(task) {
        this.subtasks = task.subtasks;
        this.subtasks.forEach(t => t.parent = this);
    }

    generate_implementation(tree_id, user_id, language, cb, cb_error = console.error) {
        if (!this.can_be_implemented()) {
            throw Error('This task cannot be implemented');
        }
        
        let this_task = this;

        let root_task = this;
        while(!root_task.is_root())
            root_task = root_task.parent;

        $.ajax({
            type: 'POST',
            url: `http://${SERVER_ADDR}/implement`,
            data: {
                'tree': JSON.stringify(root_task),
                'tree_id': JSON.stringify(tree_id),
                'user_id': JSON.stringify(user_id),
                'task_id': JSON.stringify(this_task.id()),
                'language': JSON.stringify(language),
            },
            success: function(d) {
                try {
                    let data = d;
                    
                    if (data.status && data.status == 'invalid_request') {
                        throw Error(data.message);
                    }
                    
                    this_task.implementation_language = language;
                    this_task.implementation = data.implementation;
                    this_task.implementation_id = data.implementation_id;
                    this_task.requires_feedback_implementation = true;

                    // remove all implementations above (which would now be invalid)
                    if (this_task.parent)
                        this_task.parent.remove_implementation()

                    cb(data);
                } catch (e) {
                    cb_error(d);
                    throw e;
                }
            },
            error: cb_error
        });
    }

    static load_from_json(data, parent = null, expanded_tasks = []) {
        return Task.load_tree(JSON.parse(data), parent, expanded_tasks);
    }

    static load_tree(data, parent = null, expanded_tasks = []) {
        const task = new Task(
            data.tree_id,
            data.node_id,
            data.user_id,
            data.creation_mode,
            data.name,
            data.description,
            data.solved
        );

        if (parent) {
            task.parent = parent;
        }

        // If 'subtasks' array is present in JSON, add each subtask to the task
        data.subtasks.forEach(subtaskData => {
            const subtask = Task.load_tree(subtaskData, task, expanded_tasks); // Recursively create subtasks
            task.subtasks.push(subtask);
        });

        // Automatically show children if they were shown
        if (expanded_tasks.includes(task.task_id))
            task.show_children();

        return task; // Return the constructed Task instance
    }

    add_subtask(name, description) {
        let child = new Task(name, description);
        child.parent = this;

        this.subtasks.push(child);
        
        return child;
    }

    remove_subtask(name) {
        let idx = this.subtasks.findIndex(subtask => subtask.name == name);
        if(idx !== -1)
            this.subtasks.splice(idx, 1);
    }

    solve() {
        this.solved = true;

        // if the task is solved without an implementation, it means it doesn't need one
        if (!this.implementation)
            this.implementation = false;

        for (let subtask of this.subtasks)
            subtask.solve();
    }

    unsolve() {
        this.solved = false;

        if (this.parent)
            this.parent.unsolve();
    }
}
