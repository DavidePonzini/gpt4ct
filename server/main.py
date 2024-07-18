from flask import Flask, request
from flask_cors import CORS

import task
import json

import decomposition
import database


app = Flask(__name__)
CORS(app)


@app.route('/get-user', methods=['POST'])
def login():
    user_id = json.loads(request.form['user_id'])

    return {
        'user': database.get_user_data(user_id)
    }

@app.route('/create-tree', methods=['POST'])
def create_tree():
    user_id = json.loads(request.form['user_id'])
    
    name = json.loads(request.form['name'])
    description = json.loads(request.form['description'])

    tree_id = database.create_tree(name, description, user_id)

    tree, last_update, feedback_list = database.load_tree(tree_id, user_id)
    return {
        'tree_id': tree_id,
        'tree': tree.to_json(),
        'last_update': last_update,
        'feedback_list': feedback_list,
    }

@app.route('/load-tree', methods=['POST'])
def load_tree():
    tree_id = json.loads(request.form['tree_id'])
    user_id = json.loads(request.form['user_id'])
    
    tree, last_update, feedback_list = database.load_tree(tree_id, user_id)

    if tree is not None:
        return {
            'tree': tree.to_json(),
            'last_update': last_update,
            'feedback_list': feedback_list,
        }
    
    return {
        'status': 'error'
    }

@app.route('/get-tree-last-update', methods=['POST'])
def get_tree_last_update():
    tree_id = json.loads(request.form['tree_id'])
    
    last_update = database.get_tree_last_update_ts(tree_id)

    return {
        'last_update': last_update,
    }

@app.route('/my-trees', methods=['POST'])
def my_trees():
    user_id = json.loads(request.form['user_id'])

    trees = database.get_user_trees(user_id)

    return {
        'trees': trees
    }

@app.route('/update-tasks', methods=['POST'])
def update_tasks():
    user_id = json.loads(request.form['user_id'])
    parent_id = json.loads(request.form['parent_id'])
    tasks = json.loads(request.form['tasks'])

    database.set_children_of_task(user_id, parent_id, tasks, task.TaskCreationMode.MANUAL)

    return {
        'status': 'ok'
    }

@app.route('/solve', methods=['POST'])
def solve():
    user_id = json.loads(request.form['user_id'])
    task_id = json.loads(request.form['task_id'])
    solved = json.loads(request.form['solved'])

    database.solve_task(task_id, user_id, solved)

    return {
        'status': 'ok'
    }

@app.route('/decompose', methods=['POST'])
def decompose_task():
    task_id = json.loads(request.form['task_id'])
    user_id = json.loads(request.form['user_id'])

    current_task = database.load_task(task_id, user_id)

    decomposition.decompose(
        task=current_task,
        user_id=user_id,
    )

    return {
        'status': 'ok'
    }

@app.route('/implement', methods=['POST'])
def implement():
    task_id = json.loads(request.form['task_id'])
    language = json.loads(request.form['language'])
    user_id = json.loads(request.form['user_id'])
    additional_instructions = json.loads(request.form['additional_instructions'])

    task = database.load_task(task_id, user_id)

    if language is None:
        database.set_implementation(
            task=task,
            user_id=user_id,
            implementation=None,
            language=None,
            additional_prompt=None,
            tokens=None
        )
    else:
        decomposition.implement(
            task=task,
            language=language,
            user_id=user_id,
            additional_prompt=additional_instructions,
        )

    return {
        'status': 'ok'
    }

@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    return database.get_leaderboard()

@app.route('/feedback', methods=['POST'])
def feedback():
    task_id = json.loads(request.form['task_id'])
    user_id = json.loads(request.form['user_id'])
    q1 = json.loads(request.form['q1'])
    q2 = json.loads(request.form['q2'])
    q3 = json.loads(request.form['q3'])

    database.save_feedback(task_id, user_id, q1, q2, q3)

    return {
        'status': 'ok'
    }


if __name__ == '__main__':
    app.run(
    	host='0.0.0.0',
    	debug=True
    )
