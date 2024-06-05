from dav_tools import database
from task import Task


db = database.PostgreSQL(database='postgres',
                         host='127.0.0.1',
                         user='problem_decomposition_admin',
                         password='decomp')


# todo: add chatgpt's answer
def log_usage_decomposition(task: Task, creation_ts, user_id, answer, usage):
    root_task = task.get_root()

    db.insert('problem_decomposition', 'decomposition_runs', {
        'creation_ts': creation_ts,
        'user_id': user_id,
        'root_task_name': root_task.name,
        'root_task_description': root_task.description,
        'task_name': task.name,
        'task_description': task.description,
        'task_level': task.level,
        'answer': answer,
        'prompt_tokens': usage.prompt_tokens,
        'completion_tokens': usage.completion_tokens 
    })

def log_usage_implementation(task: Task, creation_ts, user_id, language, answer, usage):
    root_task = task.get_root()

    db.insert('problem_decomposition', 'implementation_runs', {
        'creation_ts': creation_ts,
        'user_id': user_id,
        'root_task_name': root_task.name,
        'root_task_description': root_task.description,
        'task_name': task.name,
        'task_description': task.description,
        'task_level': task.level,
        'implementation_language': language,
        'answer': answer,
        'prompt_tokens': usage.prompt_tokens,
        'completion_tokens': usage.completion_tokens 
    })

def log_feedback():
    ...

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


