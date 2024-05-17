from flask import Flask, request
from flask_cors import CORS

import task
import json

import decomposition as decomposition


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

    root_task = task.from_dict(tree)
    current_task = root_task.get_subtask_from_id(task_id)

    return decomposition.decompose(current_task)


@app.route('/implement', methods=['POST'])
def implement_task():
    tree = json.loads(request.form['tree'])
    task_id = json.loads(request.form['task_id'])

    root_task = task.from_dict(tree)
    current_task = root_task.get_subtask_from_id(task_id)

    return decomposition.implement(current_task)



if __name__ == '__main__':
    app.run(debug=True)