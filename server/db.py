import psycopg2
from task import Task

conn = psycopg2.connect(database='postgres',
                        host='127.0.0.1',
                        user='problem_decomposition_admin',
                        password='decomp')

cursor = conn.cursor()

# todo: add answer
def log_usage_decomposition(task: Task, usage):
    query = '''INSERT INTO problem_decomposition.decomposition_runs
                (
                    user_id,
                    root_task_name,
                    root_task_description,
                    task_name,
                    task_description,
                    task_level,
                    prompt_tokens,
                    completion_tokens
                ) VALUES(
                    %(user_id)s,
                    %(root_task_name)s,
                    %(root_task_description)s,
                    %(task_name)s,
                    %(task_description)s,
                    %(task_level)s,
                    %(prompt_tokens)s,
                    %(completion_tokens)s
                )
            '''

    root_task = task.get_root()

    cursor.execute(query, {
        'user_id': 'user',
        'root_task_name': root_task.name,
        'root_task_description': root_task.description,
        'task_name': task.name,
        'task_description': task.description,
        'task_level': task.level,
        'prompt_tokens': usage.prompt_tokens,
        'completion_tokens': usage.completion_tokens 
    })

    conn.commit()

def log_usage_implementation(task: Task, usage):
    ...
    query = '''INSERT INTO problem_decomposition.implementation_runs
                (
                    user_id,
                    root_task_name,
                    root_task_description,
                    task_name,
                    task_description,
                    task_level,
                    prompt_tokens,
                    completion_tokens
                ) VALUES(
                    %(user_id)s,
                    %(root_task_name)s,
                    %(root_task_description)s,
                    %(task_name)s,
                    %(task_description)s,
                    %(task_level)s,
                    %(prompt_tokens)s,
                    %(completion_tokens)s
                )
            '''

    root_task = task.get_root()

    cursor.execute(query, {
        'user_id': 'user',
        'root_task_name': root_task.name,
        'root_task_description': root_task.description,
        'task_name': task.name,
        'task_description': task.description,
        'task_level': task.level,
        'prompt_tokens': usage.prompt_tokens,
        'completion_tokens': usage.completion_tokens 
    })

    conn.commit()

def log_feedback():
    ...