var x = null;


class Task {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.subtasks = [];
        this.parent = null;
        this.solved = false;
        this.implementation = null;
        this.implementation_language = null;
        this.children = null;
        this.level = 0;
    }

    id() {
        if (this.is_root())
            return []

        let my_id = this.parent.subtasks.findIndex(d => d === this);
        
        return this.parent.id().concat(my_id);
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
        // Exclude the 'parent' property while converting to JSON, to avoid circular structures
        return {
            name: this.name,
            description: this.description,
            subtasks: this.subtasks,
            solved: this.solved,
            implementation: this.implementation,
            implementation_language: this.implementation_language,
            children: !!this.subtasks.length,
        };
    }

    generate_decomposition(user_id, creation_ts, cb, cb_error = console.error) {
        let this_task = this;

        let root_task = this;
        while(!root_task.is_root())
            root_task = root_task.parent;

        $.ajax({
            type: 'POST',
            url: 'http://localhost:5000/decompose',
            data: {
                'tree': JSON.stringify(root_task),
                'task_id': JSON.stringify(this_task.id()),
                'creation_ts': JSON.stringify(creation_ts),
                'user_id': JSON.stringify(user_id)
            },
            success: function(d) {
                try {
                    let data = JSON.parse(d);
                    
                    if (data.status && data.status == 'invalid_request') {
                        throw Error(data.message);
                    }
                    
                    for (let subtask of data.result) {
                        this_task.add_subtask(subtask.name, subtask.description);
                    }

                    cb(data);
                } catch (e) {
                    cb_error(d);
                    throw e;
                }
            },
            error: cb_error
        });
    }

    generate_implementation(user_id, creation_ts, language, cb, cb_error = console.error) {
        if (!this.can_be_implemented()) {
            throw Error('This task cannot be implemented');
        }
        
        let this_task = this;

        let root_task = this;
        while(!root_task.is_root())
            root_task = root_task.parent;

        $.ajax({
            type: 'POST',
            url: 'http://localhost:5000/implement',
            data: {
                'tree': JSON.stringify(root_task),
                'language': JSON.stringify(language),
                'task_id': JSON.stringify(this_task.id()),
                'creation_ts': JSON.stringify(creation_ts),
                'user_id': JSON.stringify(user_id)
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
        task.implementation = data.implementation;
        task.implementation_language = data.implementation_language;

        return task; // Return the constructed Task instance

    }

    add_subtask(name, description) {
        let child = new Task(name, description);
        child.parent = this;
        child.level = this.level + 1;

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