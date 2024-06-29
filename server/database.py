from typing import Literal

from dav_tools import database
import task


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

        c.commit()

        return tree_id


def add_nodes(tree_id: int, parent_id: int, nodes: list[tuple[str, str]], user_id: str, creation_mode: Literal['manual', 'ai', 'mixed'], tokens: tuple[int, int] | None = None):
    '''Adds a new node as the last child of `parent_id` for tree `tree_id`'''
    with db.connect() as c:
        # find max order n
        select_max_order_n = '''
            SELECT MAX(order_n)
            FROM {schema}.tasks
            WHERE parent_id = {parent_id} AND deleted = FALSE
            '''
        
        select_max_order_n = database.sql.SQL(select_max_order_n).format(
            schema=database.sql.Identifier(schema),
            parent_id=database.sql.Placeholder('parent_id')
        )

        c.execute(select_max_order_n, {'parent_id': parent_id})
        max_order_n = c.fetch_one()[0]
        order_n = max_order_n + 1 if max_order_n is not None else 0

        # insert new nodes
        for node in nodes:
            c.insert(schema, 'tasks', {
                'parent_id': parent_id,
                'tree_id': tree_id,
                'order_n': order_n,
                'user_id': user_id,
                'name': node[0],
                'description': node[1],
                'creation_mode': creation_mode,
            })

            order_n += 1

        # update last_update_ts
        _update_tree_ts(tree_id, c)        

        # save all operations
        c.commit()

def _update_tree_ts(tree_id: int, connection: database.PostgreSQLConnection):
    update_tree_ts = '''
        UPDATE {schema}.trees
        SET last_update_ts = NOW()
        WHERE tree_id = {tree_id}
        '''
    
    update_tree_ts = database.sql.SQL(update_tree_ts).format(
        schema=database.sql.Identifier(schema),
        tree_id=database.sql.Placeholder('tree_id')
    )

    connection.execute(update_tree_ts, {'tree_id': tree_id})


def load_task(task_id: int) -> task.Task:
    query_get_task_info = database.sql.SQL('''SELECT tree_id, path FROM {schema}.v_trees WHERE task_id = {task_id} AND deleted = FALSE''').format(
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


def load_tree(tree_id: int) -> tuple[task.Task, any]:
    base_query = '''
        SELECT
            path,
            task_id,
            user_id,
            creation_mode,
            name,
            description,
            solved
        FROM {schema}.v_trees
        WHERE
            tree_id = {tree_id}
            AND deleted = FALSE 
        '''

    query_tree_data = database.sql.SQL(base_query).format(
        schema=database.sql.Identifier(schema),
        tree_id=database.sql.Placeholder('tree_id')
    )

    query_last_update = '''SELECT last_update_ts FROM {schema}.trees WHERE tree_id = {tree_id}'''
    query_last_update = database.sql.SQL(query_last_update).format(
        schema=database.sql.Identifier(schema),
        tree_id=database.sql.Placeholder('tree_id')
    )

    with db.connect() as c:
        c.execute(query_last_update, {
            'tree_id': tree_id
        })

        last_update = c.fetch_one()
        if last_update is None:
            return None
        
        last_update = last_update[0]

        c.execute(query_tree_data, {
            'tree_id': tree_id
        })

        result = c.fetch_all()

        result = [{
            'path':             task[0],
            'task_id':          task[1],
            'user_id':          task[2],
            'creation_mode':    task[3],
            'name':             task[4],
            'description':      task[5],
            'solved':           task[6],
            'tree_id':          tree_id,
        } for task in result]

        return task.from_node_list(result), last_update


def load_tree_with_implementations(tree_id: int) -> task.Task:
    pass


def check_user_exists(user_id: str):
    base_query = 'SELECT COUNT(*) FROM {schema}.users WHERE user_id = {user_id}'

    query = database.sql.SQL(base_query).format(
        schema=database.sql.Identifier(schema),
        user_id = database.sql.Placeholder('user_id')
    )

    result = db.execute_and_fetch(query, {
        'user_id': user_id
    })

    return result[0][0] == 1


