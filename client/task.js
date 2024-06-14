var x = null;

const SERVER_ADDR = '15.237.153.101:5000';


class Task {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.subtasks = [];
        this.parent = null;

        this.solved = false;

        this.decomposition_id = null;
        this.requires_feedback_decomposition = false;

        this.implementation = null;
        this.implementation_id = null;
        this.implementation_language = null;
        
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
        return this.requires_feedback_decomposition;
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

    show_children() {
        this.children = this.subtasks;
        return this;
    }

    hide_children() {
        this.children = null;
        return this;
    }

    can_be_implemented() {
        // Only leaves and nodes with all theirs children already implemented can be implemented
        // for (let child of this.subtasks) {
        //     if (!child.implementation || !child.can_be_implemented())
        //         return false;
        // }

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

                    this_task.copy(data.task);

                    cb(data);
                } catch (e) {
                    cb_error(d);
                    throw e;
                }
            },
            error: cb_error
        });
    }

    copy(task) {
        console.log(task)
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
                    let data = JSON.parse(d);
                    
                    if (data.status && data.status == 'invalid_request') {
                        throw Error(data.message);
                    }
                    
                    this_task.implementation_language = language;
                    this_task.implementation = data.implementation;

                    cb(data);
                } catch (e) {
                    cb_error(d);
                    throw e;
                }
            },
            error: cb_error
        });
    }

    static load_from_json(data) {
        return Task.load_tree(JSON.parse(data));
    }

    static load_tree(data) {
        const task = new Task(data.name, data.description);

        // If 'subtasks' array is present in JSON, add each subtask to the task
        data.subtasks.forEach(subtaskData => {
            const subtask = Task.load_tree(subtaskData); // Recursively create subtasks
            subtask.parent = task;
            task.subtasks.push(subtask);
        });

        // Automatically show children if they were shown
        if (data.children)
            task.show_children();

        // Set other properties
        task.solved = data.solved;

        task.decomposition_id = data.decomposition_id;
        task.requires_feedback_decomposition = data.requires_feedback_decomposition;
        
        task.implementation = data.implementation;
        task.implementation_id = data.implementation_id;
        task.implementation_language = data.implementation_language;

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
