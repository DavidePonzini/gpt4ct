import json

class TaskCreationMode:
    MANUAL = 'manual'
    AI = 'ai'
    MIXED = 'mixed'


class Task:
    '''
    Represents a single task, and its decomposition in subtasks
    '''

    def __init__(self, tree_id: int, task_id: int, task_user_id: int, creation_mode: str, name: str, description: str, solved: bool = False,
                 implementation_id: int | None = None, implementation: str | None = None, implementation_language: str | None = None, implementation_user_id: str | None = None) -> None:
        self.task_id = task_id
        self.task_user_id = task_user_id
        self.tree_id = tree_id

        self.name = name
        self.description = description

        self.subtasks = []
        self.parent = None

        self.creation_mode = creation_mode

        self.solved = solved

        self.implementation_id = implementation_id
        self.implementation = implementation
        self.implementation_language = implementation_language
        self.implementation_user_id = implementation_user_id
        assert (self. implementation_id is None and self.implementation is None and self.implementation_language is None and self.implementation_user_id is None) or (self.implementation_id is not None and self.implementation is not None and self.implementation_language is not None and self.implementation_user_id is not None)


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
            'task_id': self.task_id,
            'task_user_id': self.task_user_id,
            'tree_id': self.tree_id,

            'name': self.name,
            'description': self.description,
            'subtasks': [ subtask.to_dict() for subtask in self.subtasks ],

            'creation_mode': self.creation_mode,

            'solved': self.solved,

            'implementation_id': self.implementation_id,
            'implementation': self.implementation,
            'implementation_language': self.implementation_language,
            'implementation_user_id': self.implementation_user_id,

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
            task = task.subtasks[int(i)]    # cast to int is required because we might have `decimal.Decimal`

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


def from_node_list(data: list[dict]) -> Task | None:
    '''Load a task from a node list'''

    # if list is empty we don't even have a root node
    if len(data) == 0:
        return None
    
    # add root node
    root_node = data[0]
    root_task = Task(
        tree_id=root_node['tree_id'],
        task_id=root_node['task_id'],
        task_user_id=root_node['task_user_id'],
        creation_mode=root_node['creation_mode'],
        name=root_node['name'],
        description=root_node['description'],
        solved=root_node['solved'],
        implementation_id=root_node['implementation_id'],
        implementation=root_node['implementation'],
        implementation_language=root_node['implementation_language'],
        implementation_user_id=root_node['implementation_user_id'])
    
    # add all children
    for node in data[1:]:
        node_path = node['path']

        t = root_task.get_subtask_from_path(node_path[:-1])
        child = Task(
            tree_id=node['tree_id'],
            task_id=node['task_id'],
            task_user_id=node['task_user_id'],
            creation_mode=node['creation_mode'],
            name=node['name'],
            description=node['description'],
            solved=node['solved'],
            implementation_id=node['implementation_id'],
            implementation=node['implementation'],
            implementation_language=node['implementation_language'],
            implementation_user_id=node['implementation_user_id'])
        
        t.add_subtask(child)

        assert child.path() == node_path

    return root_task
