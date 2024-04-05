class Task {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.subtasks = [];
        this.parent = null;
        this.solved = false;
    }

    toJSON() {
        // Exclude the 'parent' property while converting to JSON, to avoid circular structures
        return {
            name: this.name,
            description: this.description,
            subtasks: this.subtasks,
            solved: this.solved,
            implementation: this.implementation,
        };
    }

    // static fromJSON(json) {
    //     let task = new Task(json.name, json.description);
    //     task.implementation = json.implementation;
    //     task.solved = solve();
    //     task.add_subtasks(json.subtasks);
    // }

    add_subtasks(children) {
        for (let child in children)
            this.add_subtask(child.name, child.description);

        return this.subtasks
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