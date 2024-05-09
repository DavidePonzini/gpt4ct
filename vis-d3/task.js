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
    }

    isRoot() {
        return this.parent == null;
    }

    isLeaf() {
        // Node has no visible children
        return this.children == null;
    }

    isSolved() {
        // Node has been marked as solved
        return this.solved;
    }

    isExplored() {
        // Node has been explored (decomposed) but not marked as solved
        return this.subtasks.length && !this.isSolved();
    }

    isUnexplored() {
        // Node has neither been explored (decomposed) or marked as solved
        return !this.subtasks.length && !this.isSolved();
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