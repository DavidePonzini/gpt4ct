from dav_tools import database
from task import Task
import json


schema = 'problem_decomposition'

db = database.PostgreSQL(database='postgres',
                         host='127.0.0.1',
                         user='problem_decomposition_admin',
                         password='decomp')

def create_tree(task: Task, user_id: str) -> int:
    '''Create a tree and get its id'''
    
    root_task = task.get_root()

    return db.insert(schema, 'trees', {
        'user_id': user_id,
        'root_task_name': root_task.name,
        'tree_data': root_task.to_json()
    },
    return_fields=['tree_id'])

def log_decomposition(task: Task, creation_ts, user_id, subtasks_amount, answer, usage):
    root_task = task.get_root()

    db.insert(schema, 'decomposition', {
        'user_id': user_id,
        'creation_ts': creation_ts,
        'root_task_name': root_task.name,
        'task_name': task.name,
        'task_level': task.level(),
        'task_id': task.id(),
        'subtasks_amount': subtasks_amount,
        'tree': json.dumps(root_task.to_dict()),
        'answer': answer,
        'prompt_tokens': usage.prompt_tokens,
        'completion_tokens': usage.completion_tokens 
    })

def log_usage_implementation(task: Task, creation_ts, user_id, language, answer, usage):
    root_task = task.get_root()

    db.insert(schema, 'implementation', {
        'user_id': user_id,
        'creation_ts': creation_ts,
        'root_task_name': root_task.name,
        'task_name': task.name,
        'task_level': task.level(),
        'task_id': task.id(),
        'implementation_language': language,
        'tree': json.dumps(root_task.to_dict()),
        'answer': answer,
        'prompt_tokens': usage.prompt_tokens,
        'completion_tokens': usage.completion_tokens 
    })

def log_feedback(user_id, creation_ts, task: Task, q1, q2, q3, q4, comments):
    root_task = task.get_root()

    db.insert(schema, 'feedback_decomposition', {
        'user_id': user_id,
        'creation_ts': creation_ts,
        'root_task_name': root_task.name,
        'task_name': task.name,
        'task_level': task.level(),
        'task_id': task.id(),
        'tree': json.dumps(root_task.to_dict()),
        'q1': q1,
        'q2': q2,
        'q3': q3,
        'q4': q4,
        'comments': comments if len(comments) > 0 else None
    })

def check_user_exists(user_id: str):
    base_query = 'SELECT COUNT(*) FROM {schema}.{table} WHERE {column} = {value}'

    query = database._sql.SQL(base_query).format(
        schema=database._sql.Identifier('problem_decomposition'),
        table=database._sql.Identifier('users'),
        column=database._sql.Identifier('user_id'),
        value = database._sql.Placeholder('user_id')
    )

    data = {
        'user_id': user_id
    }

    db._cursor.execute(query, data)
    val = db._cursor.fetchone()

    return {
        'user': val[0] == 1
    }

    print(val)


