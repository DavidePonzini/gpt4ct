class Task:
    '''
    Represents a single task, and its decomposition in subtasks
    '''

    def __init__(self, name, description) -> None:
        self.name = name
        self.description = description
        self.level = 0
        self.subtasks = []
        self.implementation = None
        self.parent = None

    def is_root(self):
        return self.parent is None

    def id(self):
        if self.is_root():
            return []

        my_id = self.parent.subtasks.index(self)
        
        return self.parent.id() + [my_id]

    def to_dict(self) -> str:
        '''
        Convert current task and subtasks to a dictionary, ready for JSON format conversion
        '''
        return {
            'name': self.name,
            'description': self.description,
            'subtasks': [ subtask.to_dict() for subtask in self.subtasks ],
            'level': self.level,
            'implementation': self.implementation
        }
    
    def add_subtask(self, name, description, implementation=None):
        child = Task(name, description, implementation)
        child.level = self.level + 1
        child.parent = self
        
        self.subtasks.append(child)

    def get_root(self):
        task = self

        while not task.is_root():
            task = task.parent

        return task

    def get_subtask_from_id(self, id):
        task = self.get_root()

        for i in id:
            task = task.subtasks[i]

        return task
    
    def for_each_parent(self, cb):
        if self.is_root():
            return
        
        # First recursion, then callback, so that we start from the root 
        self.parent.for_each_parent(cb)

        cb(self.parent)


    def for_each_child(self, cb):
        for child in self.subtasks:
            if len(self.subtasks) == 0:
                return

            child.for_each_child(cb)
            cb(child)

    
def from_dict(data) -> Task:
    task = Task(data['name'], data['description'])

    for subtask_data in data['subtasks']:
        subtask = from_dict(subtask_data)  # Recursively create subtasks
        task.subtasks.append(subtask)
        subtask.parent = task
        subtask.level = task.level + 1

    # Set other properties
    task.implementation = data['implementation']


    return task

