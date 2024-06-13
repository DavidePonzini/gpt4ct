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

    result = db.insert(schema, 'trees', {
        'user_id': user_id,
        'root_task_name': root_task.name,
        'tree_data': root_task.to_json()
    },
    return_fields=['tree_id'])

    return result[0]

def save_tree(tree_id: int, task: Task) -> None:
    '''Save current tree state'''

    root_task = task.get_root()

    base_query = '''
        UPDATE {schema}.trees
        SET
            tree_data = {tree_data},
            root_task_name = {root_task_name},
            last_save_ts = NOW()
        WHERE tree_id = {tree_id}
        '''

    query = database.sql.SQL(base_query).format(
        schema=database.sql.Identifier(schema),
        tree_data=database.sql.Placeholder('tree_data'),
        root_task_name=database.sql.Placeholder('root_task_name'),
        tree_id=database.sql.Placeholder('tree_id'),
    )

    db.execute(query, {
        'tree_id': tree_id,
        'root_task_name': root_task.name,
        'tree_data': root_task.to_json(),
    })

    db.commit()


def log_decomposition(tree_id: int, task: Task, subtasks_amount: int, answer, usage) -> int:
    # log decomposition
    decomposition_id = db.insert(schema, 'decompositions', {
        'tree_id': tree_id,
        
        'task_name': task.name,
        'task_level': task.level(),
        'task_id': task.id(),
        'subtasks_amount': subtasks_amount,
        'answer': answer,
        
        'prompt_tokens': usage.prompt_tokens,
        'completion_tokens': usage.completion_tokens
    },
    return_fields=['decomposition_id'])

    # save tree state
    save_tree(tree_id, task)

    return decomposition_id[0]

def log_implementation(tree_id: int, decomposition_id: int, task: Task, language, answer, usage) -> int:
    db.insert(schema, 'implementations', {
        'tree_id': tree_id,
        'decomposition_id': decomposition_id,

        'task_name': task.name,
        'task_level': task.level(),
        'task_id': task.id(),
        'implementation_language': language,
        'answer': answer,

        'prompt_tokens': usage.prompt_tokens,
        'completion_tokens': usage.completion_tokens 
    },
    return_fields=['implementation_id'])

    save_tree(tree_id, task)


def log_feedback_decomposition(decomposition_id: int, q1, q2, q3, q4, comments):
    db.insert(schema, 'feedback_decompositions', {
        'decomposition_id': decomposition_id,

        'q1': q1,
        'q2': q2,
        'q3': q3,
        'q4': q4,
        'comments': comments if len(comments) > 0 else None
    })

def check_user_exists(user_id: str):
    base_query = 'SELECT COUNT(*) FROM {schema}.users WHERE user_id = {user_id}'

    query = database.sql.SQL(base_query).format(
        schema=database.sql.Identifier(schema),
        user_id = database.sql.Placeholder('user_id')
    )

    db.execute(query, {
        'user_id': user_id
    })

    val = db._cursor.fetchone()

    return val[0] == 1


