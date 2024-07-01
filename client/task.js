const SERVER_ADDR = '15.237.153.101:5000';

class Task {
    constructor(tree_id, task_id, task_user_id, creation_mode, name, description, solved = false,
        implementation_id = null, implementation = null, implementation_language = null, implementation_user_id) {
        this.tree_id = tree_id;
        this.task_id = task_id;
        this.task_user_id = task_user_id;
        
        this.name = name;
        this.description = description;

        this.subtasks = [];
        this.parent = null;

        this.creation_mode = creation_mode;

        this.solved = solved;

        this.implementation_id = implementation_id;
        this.implementation = implementation;
        this.implementation_language = implementation_language;
        this.implementation_user_id = implementation_user_id;

        // only needed for ui, no need to store these properties on server
        this.children = null;
    }

    path() {
        if (this.is_root())
            return []

        let my_id = this.parent.subtasks.findIndex(d => d === this);
        
        return this.parent.path().concat(my_id);
    }

    needs_feedback(user_id) {
        return user_id && this.task_user_id && user_id != this.task_user_id;
    }

    is_root() {
        return this.parent == null;
    }

    get_root() {
        if (this.is_root())
            return this;

        return this.parent.get_root();
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

    show_children(recursive = false, cb_expanded = (c) => {}) {
        if (!this.has_children())
            return;

        this.children = this.subtasks;
        cb_expanded(this);

        if (recursive)
            for (let subtask of this.subtasks)
                subtask.show_children(recursive, cb_expanded);

        return this;
    }

    hide_children(recursive = false, cb_hidden = (c) => {}) {
        if (!this.has_children())
            return;

        this.children = null;
        cb_hidden(this);

        if (recursive)
            for (let subtask of this.subtasks)
                subtask.hide_children(recursive, cb_hidden);

        return this;
    }

    can_be_implemented() {
        // Only leaves and nodes with all theirs children already implemented can be implemented. Solved tasks count as implemented
        for (let child of this.subtasks) {
            if (child.solved)
                continue;

            if (!child.implementation || !child.can_be_implemented())
                return false;
        }

        return true;
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

    generate_decomposition(user_id, cb = () => {}, cb_error = console.error) {
        let this_task = this;

        $.ajax({
            type: 'POST',
            url: `http://${SERVER_ADDR}/decompose`,
            data: {
                'task_id': JSON.stringify(this_task.task_id),
                'user_id': JSON.stringify(user_id),
            },
            success: cb,
            error: cb_error
        });
    }

    generate_implementation(user_id, language, additional_instructions = null, cb = () => {}, cb_error = console.error) {
        if (!this.can_be_implemented()) {
            throw Error('This task cannot be implemented');
        }
        
        let this_task = this;

        $.ajax({
            type: 'POST',
            url: `http://${SERVER_ADDR}/implement`,
            data: {
                'task_id': JSON.stringify(this_task.task_id),
                'language': JSON.stringify(language),
                'user_id': JSON.stringify(user_id),
                'additional_instructions': JSON.stringify(additional_instructions),
            },
            success: cb,
            error: cb_error
        });
    }

    remove_implementation(cb = () => {}, cb_error = console.error) {
        let this_task = this;

        $.ajax({
            type: 'POST',
            url: `http://${SERVER_ADDR}/implement`,
            data: {
                'task_id': JSON.stringify(this_task.task_id),
                'language': JSON.stringify(null),
                'user_id': JSON.stringify(user_id),
                'additional_instructions': JSON.stringify(null),
            },
            success: cb,
            error: cb_error
        });
    }

    static load_from_json(data, parent = null, expanded_tasks = []) {
        return Task.load_tree(JSON.parse(data), parent, expanded_tasks);
    }

    static load_tree(data, parent = null, expanded_tasks = []) {
        const task = new Task(
            data.tree_id,
            data.task_id,
            data.task_user_id,
            data.creation_mode,
            data.name,
            data.description,
            data.solved,
            data.implementation_id,
            data.implementation,
            data.implementation_language,
            data.implementation_user_id,
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
}
