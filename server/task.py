import json

class Task:
    '''
    Represents a single task, and its decomposition in subtasks
    '''

    def __init__(self, name, description) -> None:
        self.name = name
        self.description = description
        self.subtasks = []
        self.parent = None

        self.solved = False

        self.decomposition_id = None
        self.requires_feedback_decomposition = False

        self.implementation = None              # None: not yet implemented; False: task doesn't need to be implemented
        self.implementation_id = None
        self.implementation_language = None

    def is_root(self):
        return self.parent is None

    def level(self):
        return len(self.id())

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

            'solved': self.solved,

            'decomposition_id': self.decomposition_id,
            'requires_feedback_decomposition': self.requires_feedback_decomposition,

            'implementation': self.implementation,
            'implementation_id': self.implementation_id,
            'implementation_language': self.implementation_language,
        }
    
    def to_json(self) -> str:
        return json.dumps(self.to_dict())
    
    def add_subtask(self, name, description):
        child = Task(name, description)
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


    def for_each_child(self, cb, where = lambda task: True):
        for child in self.subtasks:
            if not where(child):
                return

            # child.for_each_child(cb)
            cb(child)

    def for_each_sibling(self, cb, where = lambda task: True):
        if self.is_root():
            return
        
        for sibling in self.parent.subtasks:
            if sibling is self or not where(sibling):
                return
            
            cb(sibling)

    
def from_dict(data) -> Task:
    task = Task(data['name'], data['description'])

    for subtask_data in data['subtasks']:
        subtask = from_dict(subtask_data)  # Recursively create subtasks
        task.subtasks.append(subtask)
        subtask.parent = task

    # Set other properties
    task.solved = data['solved']
    task.decomposition_id = data['decomposition_id']
    task.requires_feedback_decomposition = data['requires_feedback_decomposition']
    task.implementation = data['implementation']
    task.implementation_id = data['implementation_id']
    task.implementation_language = data['implementation_language']

    return task

def from_json(data: str) -> Task:
    return from_dict(json.loads(data))

