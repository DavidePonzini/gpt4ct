from task import Task, decompose

problem = 'Write a python program to find the most trending videos, given a csv file containing each visualizion'
root_task = Task(problem, problem)

sub = decompose(root_task, [
    {
        "name": "Read CSV file",
        "description": "Write a Python function to read the CSV file containing video views data."
    },
    {
        "name": "Parse CSV data",
        "description": "Write a Python function to parse the data from the CSV file and extract relevant information such as video IDs and view counts."
    },
    {
        "name": "Calculate trending score",
        "description": "Write a Python function to calculate a trending score for each video based on its view count and possibly other factors such as upload date."
    },
    {
        "name": "Sort videos by trending score",
        "description": "Write a Python function to sort the videos based on their calculated trending scores in descending order."
    },
    {
        "name": "Retrieve top trending videos",
        "description": "Write a Python function to retrieve the top N videos with the highest trending scores, where N is a parameter."
    }
]
)

