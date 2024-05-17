var x = null;


class Task {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.subtasks = [];
        this.parent = null;
        this.solved = false;
        this.implementation = null;
        this.children = null;
        this.level = 0;
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
        for (let child of this.subtasks) {
            if (!child.implementation || !child.can_be_implemented())
                return false;
        }

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
            children: !!this.subtasks.length,
        };
    }

    get_decomposition_path() {
        // Handle root task
        if (!this.parent) {
            return {
                'name': this.name,
                'description': this.description,
                'parent': null
            }
        }

        // Handle subtasks
        let tasks = [];
        for (let task of this.parent.subtasks) {
            tasks.push({
                'name': task.name,
                'description': task.description
            })
        }

        return {
            'tasks': tasks,
            'name': this.name,
            'description': this.description,
            'parent': this.parent.get_decomposition_path()
        };
    }

    get_implementation_path() {
        if (!this.can_be_implemented()) {
            throw Error('This task cannot be implemented');
        }

        // Return all decomposition, both parent (& siblings) and all its children
        // Return implementation of all its children

        return {
            'decomposition': this.get_decomposition_path(),
            'implementation': this._get_implementation_path_implementation(),
            'name': this.name,
            'description': this.description,
            'level': this.level
        }
    }

    /**
     * Return the decomposition of both parent & siblings and of all this node's children
     */
    _get_implementation_path_decomposition() {
        let result = [];
        let task = this;

        while(task) {
            for(let subtask of task.subtasks) {
                result.push({
                    'name': subtask.name,
                    'decomposition': subtask.subtasks
                });
            }

            task = task.parent;
        }

        return result;
    }

    _get_implementation_path_decomposition_rec_children(result) {
        for (let subtask of this.subtasks) {
            result.push({
                'name': subtask.name,
                'description': subtask.description
            });

            subtask._get_implementation_path_decomposition_rec_children(result);
        }

        return result;
    }


    _get_implementation_path_implementation() {
        if (!this.has_children())
            return;

        let result = [];
        for (let subtask of this.subtasks)
            subtask._get_implementation_path_implementation_rec(result);

        return result;
    }

    _get_implementation_path_implementation_rec(result) {
        result.unshift({
            'name': this.name,
            'implementation': this.implementation
        })
 
        for (let subtask of this.subtasks)
            subtask._get_implementation_path_implementation_rec(result);
 
    }

    generate_implementation() {
        if (!this.can_be_implemented()) {
            throw Error('This task cannot be implemented');
        }

        console.warn('fake implemenation');
        this.implementation = 'print("fake implementation")';
    }

    generate_decomposition(cb) {
        let this_task = this;

        $.ajax({
            type: 'POST',
            // url: 'https://ponzidav.altervista.org/utils/request.php',
            url: 'api/decompose_task.php',
            data: {
                'task': JSON.stringify(this.get_decomposition_path()),
                'level': this.level,
                'name': 'name',
                'description': 'description'
            },
            success: function(d) {
                try {
                    let data = JSON.parse(d);
                    
                    if (data.status && data.status == 'invalid_request') {
                        throw Error(data.message);
                    }
                    
                    for (let subtask of data.decomposition) {
                        this_task.add_subtask(subtask.name, subtask.description);
                    }

                    cb(data);
                } catch (e) {
                    console.error(d);
                    throw e;
                }
            },
            error: console.error
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

    set_implementation(implementation) {
        this.implementation = implementation;
    }

    solve() {
        this.solved = true;

        for (let subtask of this.subtasks)
            subtask.solve();
    }

    unsolve() {
        this.solved = false;

        if (this.parent)
            this.parent.unsolve();
    }
}