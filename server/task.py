import json

class TaskCreationMode:
    MANUAL = 'manual'
    AI = 'ai'
    MIXED = 'mixed'


class Task:
    '''
    Represents a single task, and its decomposition in subtasks
    '''

    def __init__(self, tree_id: int, node_id: int, user_id: int, creation_mode: str, name: str, description: str, solved: bool) -> None:
        self.node_id = node_id
        self.user_id = user_id
        self.tree_id = tree_id

        self.name = name
        self.description = description

        self.subtasks = []
        self.parent = None

        self.creation_mode = creation_mode

        self.solved = False


    def is_root(self):
        return self.parent is None

    def level(self):
        return len(self.path())

    def path(self):
        if self.is_root():
            return []

        my_path = self.parent.subtasks.index(self)
        
        return self.parent.path() + [my_path]

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
            'requires_feedback_implementation': self.requires_feedback_implementation,
        }
    
    def to_json(self) -> str:
        return json.dumps(self.to_dict())
    
    def add_subtask(self, subtask):
        subtask.parent = self

        self.subtasks.append(subtask)

        return subtask

    def get_root(self):
        task = self

        while not task.is_root():
            task = task.parent

        return task

    def get_subtask_from_path(self, path: list[int]):
        task = self.get_root()

        for i in path:
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
    task.requires_feedback_implementation = data['requires_feedback_implementation']

    return task

def from_json(data: str) -> Task:
    return from_dict(json.loads(data))

def from_node_list(data: list[dict]) -> Task | None:
    '''Load a task from a node list'''

    # if list is empty we don't even have a root node
    if len(data) == 0:
        return None
    
    # add root node
    root_node = data[0]
    root_task = Task(
        tree_id=root_node['tree_id'],
        node_id=root_node['node_id'],
        user_id=root_node['user_id'],
        creation_mode=root_node['creation_mode'],
        name=root_node['name'],
        description=root_node['description'],
        solved=root_node['solved'])
    
    # add all children
    for node in data[1:]:
        node_path = [int(n) for n in node['path']]

        t = root_task.get_subtask_from_path(node_path[:-1])
        child = Task(
            tree_id=node['tree_id'],
            node_id=node['node_id'],
            user_id=node['user_id'],
            creation_mode=node['creation_mode'],
            name=node['name'],
            description=node['description'],
            solved=node['solved'])
        
        t.add_subtask(child)

        assert child.path() == node_path

    return root_task
