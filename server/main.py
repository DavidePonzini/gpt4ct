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

    return decomposition.decompose(
        task=current_task,
        creation_ts=creation_ts,
        user_id=user_id
    )


@app.route('/implement', methods=['POST'])
def implement_task():
    tree = json.loads(request.form['tree'])
    language = json.loads(request.form['language'])
    task_id = json.loads(request.form['task_id'])
    creation_ts = json.loads(request.form['creation_ts'])
    user_id = json.loads(request.form['user_id'])

    root_task = task.from_dict(tree)
    current_task = root_task.get_subtask_from_id(task_id)

    return decomposition.implement(
        task=current_task,
        language=language,
        creation_ts=creation_ts,
        user_id=user_id
    )

@app.route('/login', methods=['POST'])
def login():
    user_id = json.loads(request.form['user_id'])

    return database.check_user_exists(user_id)


@app.route('/feedback-decomposition', methods=['POST'])
def feedback_decomposition():
    tree = json.loads(request.form['tree'])
    task_id = json.loads(request.form['task_id'])
    creation_ts = json.loads(request.form['creation_ts'])
    user_id = json.loads(request.form['user_id'])

    q1 = json.loads(request.form['q1'])
    q2 = json.loads(request.form['q2'])
    q3 = json.loads(request.form['q3'])
    q4 = json.loads(request.form['q4'])
    comments = json.load(request.form['comments'])

    root_task = task.from_dict(tree)
    current_task = root_task.get_subtask_from_id(task_id)

    database.log_feedback(
        user_id=user_id,
        creation_ts=creation_ts,
        task=current_task,
        q1=q1,
        q2=q2,
        q3=q3,
        q4=q4,
        comments=comments
    )


if __name__ == '__main__':
    app.run(debug=True)