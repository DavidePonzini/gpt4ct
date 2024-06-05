from flask import Flask, request
from flask_cors import CORS

import task
import json

import decomposition
import database


app = Flask(__name__)
CORS(app)


@app.route('/echo', methods=['POST', 'GET'])
def echo():
    '''Echo each request argument back to the user'''
    if request.method == 'POST':
        return request.form
    return request.args

@app.route('/decompose', methods=['POST'])
def decompose_task():
    tree = json.loads(request.form['tree'])
    task_id = json.loads(request.form['task_id'])
    creation_ts = json.loads(request.form['creation_ts'])
    user_id = json.loads(request.form['user_id'])

    root_task = task.from_dict(tree)
    current_task = root_task.get_subtask_from_id(task_id)

    return decomposition.decompose(current_task, creation_ts, user_id)


@app.route('/implement', methods=['POST'])
def implement_task():
    tree = json.loads(request.form['tree'])
    language = json.loads(request.form['language'])
    task_id = json.loads(request.form['task_id'])
    creation_ts = json.loads(request.form['creation_ts'])
    user_id = json.loads(request.form['user_id'])

    root_task = task.from_dict(tree)
    current_task = root_task.get_subtask_from_id(task_id)

    return decomposition.implement(current_task, language, creation_ts, user_id)

@app.route('/login', methods=['POST'])
def login():
    user_id = json.loads(request.form['user_id'])

    return database.check_user_exists(user_id)



if __name__ == '__main__':
    app.run(debug=True)