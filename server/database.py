from typing import Literal

from dav_tools import database
import task
from task import Task, TaskCreationMode
from gamification import Credits


schema = 'problem_decomposition'

db = database.PostgreSQL(database='postgres',
                         host='127.0.0.1',
                         user='problem_decomposition_admin',
                         password='decomp')


def create_tree(name: str, description: str, user_id: str) -> int:
    '''Create a tree and get its id'''

    with db.connect() as c:
        result = c.insert(schema, 'trees', {'user_id': user_id}, return_fields=['tree_id'])
        tree_id = result[0][0]

        c.insert(schema, 'tasks', {
            'tree_id': tree_id,
            'order_n': 0,
            'user_id': user_id,
            'creation_mode': 'manual',
            'name': name,
            'description': description,
        })

        _add_credits(user_id, Credits.Decomposition.CREATE_TREE, c)

        c.commit()

        return tree_id

def set_children_of_task(user_id: str, parent_id: int, tasks: list[dict], new_task_creation_mode: Literal['manual', 'ai', 'mixed'], tokens: tuple[int, int] | None = None) -> None:
    get_tree_id = database.sql.SQL('''SELECT tree_id FROM {schema}.tasks WHERE task_id = {task_id}''').format(
        schema=database.sql.Identifier(schema),
        task_id=database.sql.Placeholder('task_id'),
    )

    delete_children = database.sql.SQL('''
        UPDATE {schema}.tasks
        SET deleted = TRUE
        WHERE parent_id = {parent_id}
        ''').format(
            schema=database.sql.Identifier(schema),
            parent_id=database.sql.Placeholder('parent_id'),
        )

    get_task_data = database.sql.SQL('''
        SELECT
            creation_mode,
            name,
            description
        FROM {schema}.tasks
        WHERE task_id = {task_id}
        ''').format(
            schema=database.sql.Identifier(schema),
            task_id=database.sql.Placeholder('task_id'),
        )

    only_set_order = database.sql.SQL('''
        UPDATE {schema}.tasks
        SET
            deleted = FALSE,
            order_n = {order_n}
        WHERE
            task_id = {task_id}
        ''').format(
            schema=database.sql.Identifier(schema),
            order_n=database.sql.Placeholder('order_n'),
            task_id=database.sql.Placeholder('task_id'),
        )

    with db.connect() as c:
        # get tree id
        c.execute(get_tree_id, {
            'task_id': parent_id
        })
        tree_id = c.fetch_one()
        if tree_id is None:
            return
        tree_id = tree_id[0]

        # remove all children of parent
        c.execute(delete_children, {
            'parent_id': parent_id,
        })

        # re-add all tasks in the given order
        for i, task in enumerate(tasks):
            if task['task_id'] is None:
                # if task_id is not set, it's a new task
                c.insert(schema, 'tasks', {
                    'parent_id': parent_id,
                    'tree_id': tree_id,
                    'order_n': i,
                    'user_id': user_id,
                    'creation_mode': new_task_creation_mode,
                    'name': task['name'],
                    'description': task['description'],
                    'tokens_in': tokens[0] if new_task_creation_mode == TaskCreationMode.AI else None,
                    'tokens_out': tokens[1] if new_task_creation_mode == TaskCreationMode.AI else None,
                })
            else:
                # if task already exists, get its data
                c.execute(get_task_data, {
                    'task_id': task['task_id']
                })
                creation_mode, name, description = c.fetch_one()

                # if the only change is the order, don't replace the task
                if task['name'] == name and task['description'] == description:
                    c.execute(only_set_order, {
                        'task_id': task['task_id'],
                        'order_n': i,
                    })
                else:
                    # update creation mode if needed
                    if creation_mode == TaskCreationMode.AI:
                        creation_mode = TaskCreationMode.MIXED

                    c.insert(schema, 'tasks', {
                        'is_edit_from': task['task_id'],
                        'parent_id': parent_id,
                        'tree_id': tree_id,
                        'order_n': i,
                        'user_id': user_id,
                        'creation_mode': creation_mode,
                        'name': task['name'],
                        'description': task['description'],
                    })

        _add_credits(user_id, Credits.Decomposition.DECOMPOSE, c)
        _update_tree_ts(tree_id, c)

        c.commit()

def load_task(task_id: int) -> Task:
    query_get_task_info = database.sql.SQL('''SELECT tree_id, path FROM {schema}.v_trees WHERE task_id = {task_id}''').format(
        schema=database.sql.Identifier(schema),
        task_id=database.sql.Placeholder('task_id')
    )

    result = db.execute_and_fetch(query_get_task_info, {
        'task_id': task_id
    })

    if len(result) == 0:
        return None
    
    tree_id, path = result[0]
    
    tree, last_update = load_tree(tree_id)
    return tree.get_subtask_from_path(path)


def load_tree(tree_id: int, user_id: str) -> tuple[Task, any, list[int]]:
    query_tree_data = database.sql.SQL(
        '''
        SELECT
            tree_id,
            path,
            level,
            task_id,
            parent_id,
            task_user_id,
            implementation_user_id,
            creation_mode,
            solved,
            name,
            description,
            implementation_id,
            implementation,
            implementation_language
        FROM {schema}.v_trees
        WHERE
            tree_id = {tree_id}
        '''
    ).format(
        schema=database.sql.Identifier(schema),
        tree_id=database.sql.Placeholder('tree_id')
    )

    query_last_update = database.sql.SQL(
        '''SELECT last_update_ts FROM {schema}.trees WHERE tree_id = {tree_id}'''
    ).format(
        schema=database.sql.Identifier(schema),
        tree_id=database.sql.Placeholder('tree_id')
    )

    query_feedback = database.sql.SQL(
        '''
            SELECT task_id
            FROM {schema}.tasks
            WHERE
                tree_id = {tree_id}
                AND task_id NOT IN (
                    SELECT task_id
                    FROM {schema}.feedback_tasks
                    WHERE user_id = {user_id}
                )
        ''').format(
            schema=database.sql.Identifier(schema),
            tree_id=database.sql.Placeholder('tree_id'),
            user_id=database.sql.Placeholder('user_id'),
        )

    with db.connect() as c:
        # check if tree exists (by getting its last update)
        c.execute(query_last_update, {
            'tree_id': tree_id
        })

        last_update = c.fetch_one()
        if last_update is None:
            return None, None, None
        
        last_update = last_update[0]

        # get tree data
        c.execute(query_tree_data, {
            'tree_id': tree_id,
        })

        result = c.fetch_all()

        result = [{
            'tree_id':                  task[ 0],
            'path':                     task[ 1],
            'level':                    task[ 2],
            'task_id':                  task[ 3],
            'parent_id':                task[ 4],
            'task_user_id':             task[ 5],
            'implementation_user_id':   task[ 6],
            'creation_mode':            task[ 7],
            'solved':                   task[ 8],
            'name':                     task[ 9],
            'description':              task[10],
            'implementation_id':        task[11],
            'implementation':           task[12],
            'implementation_language':  task[13],
        } for task in result]

        # get tasks feedback can be provided for
        c.execute(query_feedback, {
            'tree_id': tree_id,
            'user_id': user_id,
        })

        feedback_list = c.fetch_all()
        feedback_list = [row[0] for row in feedback_list]

        return task.from_node_list(result), last_update, feedback_list

def solve_task(task_id: int, solved: bool) -> None:
    query = database.sql.SQL('''
        UPDATE {schema}.tasks
        SET solved = {solved}
        WHERE task_id = {task_id}
        ''').format(
            schema=database.sql.Identifier(schema),
            solved=database.sql.Placeholder('solved'),
            task_id=database.sql.Placeholder('task_id'),
        )
    with db.connect() as c:
        c.execute(query, {
            'task_id': task_id,
            'solved': solved,
        })

def get_user_data(user_id: str) -> dict[str, any] | None:
    query = database.sql.SQL('''
                             SELECT
                                credits,
                                rank
                             FROM
                                {schema}.v_leaderboard
                             WHERE
                                user_id = {user_id}
                             ''').format(
                                 schema=database.sql.Identifier(schema),
                                 user_id=database.sql.Placeholder('user_id')
                             )
    
    result = db.execute_and_fetch(query, {
        'user_id': user_id
    })

    if len(result) == 1:
        return {
            'credits':  result[0][0],
            'rank':     result[0][1],
        }
    
    return None

def set_implementation(task: Task, user_id: str, implementation: str, language: str, additional_prompt: str | None, tokens: tuple[int, int]):
    query_delete_implementations = database.sql.SQL('''
        UPDATE {schema}.implementations
        SET deleted = TRUE
        WHERE task_id = {task_id}
        ''').format(
            schema=database.sql.Identifier(schema),
            task_id=database.sql.Placeholder('task_id'),
        )
    
    with db.connect() as c:
        # delete old implementations
        c.execute(query_delete_implementations, {
            'task_id': task.task_id,
        })

        # add new implementation
        c.insert(schema, 'implementations', {
            'task_id': task.task_id,
            'is_edit_from': task.implementation_id,
            'additional_prompt': additional_prompt,
            'user_id': user_id,
            'implementation': implementation,
            'implementation_language': language,
            'tokens_in': tokens[0],
            'tokens_out': tokens[1],
        })

        _add_credits(user_id, Credits.Implementation.IMPLEMENT, c)
        _update_tree_ts(task.tree_id, c)

        c.commit()

def get_leaderboard():
    query = database.sql.SQL('''
        SELECT
            user_id,
            credits,
            rank
        FROM {schema}.v_leaderboard;
        ''').format(
            schema=database.sql.Identifier(schema),
        )
    
    result = db.execute_and_fetch(query)

    return [{
        'user_id': row[0],
        'credits': row[1],
        'rank': row[2],
    } for row in result]

def _add_credits(user_id: str, credits: int, connection: database.PostgreSQLConnection) -> None:
    query = database.sql.SQL('''
                             UPDATE {schema}.users
                             SET credits = credits + {credits}
                             WHERE user_id = {user_id}
                             ''').format(
                                 schema=database.sql.Identifier(schema),
                                 credits=database.sql.Placeholder('credits'),
                                 user_id=database.sql.Placeholder('user_id'),
                            )
    
    connection.execute(query, {
        'credits': credits,
        'user_id': user_id,
    }, commit=False)

def _update_tree_ts(tree_id: int, connection: database.PostgreSQLConnection):
    query = database.sql.SQL('''
                             UPDATE {schema}.trees
                             SET last_update_ts = NOW()
                             WHERE tree_id = {tree_id}
                             ''').format(
                                 schema=database.sql.Identifier(schema),
                                 tree_id=database.sql.Placeholder('tree_id')
                            )

    connection.execute(query, {
        'tree_id': tree_id
    }, commit=False)
