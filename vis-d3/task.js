var x = null;


class Task {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.subtasks = [];
        this.parent = null;
        this.solved = false;
        this.implementation = null;
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

    static fromJSON(json_str) {
        const data = JSON.parse(json_str);
        const task = new Task(data.name, data.description);

        // If 'subtasks' array is present in JSON, add each subtask to the task
        data.subtasks.forEach(subtaskData => {
            const subtask = Task.fromJSON(JSON.stringify(subtaskData)); // Recursively create subtasks
            subtask.parent = task;
            task.subtasks.push(subtask);
        });

        // Set other properties
        task.solved = data.solved;
        task.implementation = data.implementation;

        return task; // Return the constructed Task instance
    }

    save(filename) {
        var a = document.createElement("a");
        var file = new Blob([JSON.stringify(this)], {type: 'text/plain'});
        a.href = URL.createObjectURL(file);
        a.download = filename;
        a.click();
    }

    static load() {
        let input = $('<input type="file" id="inputfile" accept=".json,text/plain" />');
        input.unbind().bind('change', function(e) {
            let reader = new FileReader();
            reader.addEventListener('load', function(e) {
                x = e
                console.log(e.target.result)
            });
            reader.readAsText(e.target.files[0]);
        });
        input.click();
    }

    // add_subtasks(children) {
    //     for (let child in children) {
    //         console.log(this.add_subtask(child.name, child.description))//.add_subtasks(child.subtasks);
    //     }

    //     return this.subtasks
    // }

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