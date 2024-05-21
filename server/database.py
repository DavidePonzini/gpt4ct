from dav_tools import database
from task import Task


db = database.PostgreSQL(database='postgres',
                         host='127.0.0.1',
                         user='problem_decomposition_admin',
                         password='decomp')


# todo: add chatgpt's answer
def log_usage_decomposition(task: Task, answer, usage):
    root_task = task.get_root()

    db.insert('problem_decomposition', 'decomposition_runs', {
        'user_id': 'user',
        'root_task_name': root_task.name,
        'root_task_description': root_task.description,
        'task_name': task.name,
        'task_description': task.description,
        'task_level': task.level,
        'answer': answer,
        'prompt_tokens': usage.prompt_tokens,
        'completion_tokens': usage.completion_tokens 
    })

def log_usage_implementation(task: Task, answer, usage):
    root_task = task.get_root()

    db.insert('problem_decomposition', 'implementation_runs', {
        'user_id': 'user',
        'root_task_name': root_task.name,
        'root_task_description': root_task.description,
        'task_name': task.name,
        'task_description': task.description,
        'task_level': task.level,
        'answer': answer,
        'prompt_tokens': usage.prompt_tokens,
        'completion_tokens': usage.completion_tokens 
    })

def log_feedback():
    ...