from flask import Flask, request
from flask_cors import CORS

import task
import json

import decomposition
import database


app = Flask(__name__)
CORS(app)


@app.route('/login', methods=['POST'])
def login():
    user_id = json.loads(request.form['user_id'])

    return {
        'user': database.check_user_exists(user_id)
    }

@app.route('/create-tree', methods=['POST'])
def create_tree():
    user_id = json.loads(request.form['user_id'])
    
    name = json.loads(request.form['name'])
    description = json.loads(request.form['description'])

    tree_id = database.create_tree(name, description, user_id)

    tree, last_update = database.load_tree(tree_id)
    return {
        'tree_id': tree_id,
        'tree': tree.to_json(),
        'last_update': last_update
    }

@app.route('/load-tree', methods=['POST'])
def load_tree():
    tree_id = json.loads(request.form['tree_id'])
    
    tree, last_update = database.load_tree(tree_id)

    if tree is not None:
        return {
            'tree': tree.to_json(),
            'last_update': last_update
        }
    
    return {
        'status': 'error'
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
    task_id = json.loads(request.form['task_id'])
    solved = json.loads(request.form['solved'])

    database.solve_task(task_id, solved)

    return {
        'status': 'ok'
    }

@app.route('/decompose', methods=['POST'])
def decompose_task():
    task_id = json.loads(request.form['task_id'])
    user_id = json.loads(request.form['user_id'])

    current_task = database.load_task(task_id)

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

    task = database.load_task(task_id)

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


if __name__ == '__main__':
    app.run(
    	host='0.0.0.0',
    	debug=True
    )
