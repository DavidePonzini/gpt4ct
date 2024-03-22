from task import Task, decompose

problem = 'Write a python program to find the most trending videos, given a csv file containing each visualization'
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

sub2 = decompose(sub[2], [
    {
        "name": "Calculate view count factor",
        "description": "Write a Python function to calculate a factor based on the view count of a video, possibly using logarithmic scaling to give more weight to videos with higher view counts."
    },
    {
        "name": "Calculate time decay factor",
        "description": "Write a Python function to calculate a factor to represent the time decay of a video's popularity, considering how recently it was uploaded."
    },
    {
        "name": "Combine factors into trending score",
        "description": "Write a Python function to combine the factors calculated in the previous steps into an overall trending score for each video."
    }
]
)

sub20 = decompose(sub2[0], [
    {
        "name": "Normalize view counts",
        "description": "Write a Python function to normalize the view counts of all videos to a common scale, such as dividing each view count by the maximum view count in the dataset."
    },
    {
        "name": "Apply logarithmic scaling",
        "description": "Write a Python function to apply a logarithmic scaling to the normalized view counts, giving more weight to videos with higher view counts while avoiding skewing the distribution."
    }
]
)

# sub200 = decompose(sub20[0], [
#     {
#         "name": "Identify maximum view count",
#         "description": "Write a Python function to identify the maximum view count among all videos in the dataset."
#     },
#     {
#         "name": "Normalize each view count",
#         "description": "Write a Python function to normalize each individual view count by dividing it by the maximum view count."
#     }
# ]
# )

# sub2001 = decompose(sub200[1], [
#     {
#         "name": "Read view counts",
#         "description": "Write a Python function to read the view counts of all videos from the dataset."
#     },
#     {
#         "name": "Identify maximum view count",
#         "description": "Write a Python function to identify the maximum view count among all videos."
#     },
#     {
#         "name": "Normalize each view count",
#         "description": "Write a Python function to normalize each individual view count by dividing it by the maximum view count."
#     }
# ]
# )

# sub20012 = decompose(sub2001[2], [
#     {
#         "name": "Read view counts",
#         "description": "Write a Python function to read the view counts of all videos from the dataset."
#     },
#     {
#         "name": "Identify maximum view count",
#         "description": "Write a Python function to identify the maximum view count among all videos."
#     },
#     {
#         "name": "Normalize each view count",
#         "description": "Write a Python function to normalize each individual view count by dividing it by the maximum view count."
#     }
# ]
# )

sub21 = decompose(sub2[1], [
    {
        "name": "Determine time since upload",
        "description": "Write a Python function to determine the time elapsed since each video was uploaded, possibly by subtracting the upload date from the current date."
    },
    {
        "name": "Apply time decay function",
        "description": "Write a Python function to apply a time decay function to the time since upload, giving more weight to videos that were uploaded more recently."
    }
]
)

sub20[0].implementation = '''
def normalize_view_counts(view_counts):
    """
    Normalize view counts to a common scale.

    Args:
    - view_counts (list): List of view counts for each video.

    Returns:
    - normalized_counts (list): List of normalized view counts.
    """
    max_view_count = max(view_counts)
    normalized_counts = [count / max_view_count for count in view_counts]
    return normalized_counts

# Example usage:
view_counts = [1000, 500, 2000, 300]
normalized_counts = normalize_view_counts(view_counts)
print(normalized_counts)
'''

sub20[1].implementation = '''
import math

def apply_logarithmic_scaling(view_counts):
    """
    Apply logarithmic scaling to view counts.

    Args:
    - view_counts (list): List of view counts for each video.

    Returns:
    - scaled_counts (list): List of view counts after applying logarithmic scaling.
    """
    scaled_counts = [math.log(count + 1) for count in view_counts]
    return scaled_counts

# Example usage:
view_counts = [1000, 500, 2000, 300]
scaled_counts = apply_logarithmic_scaling(view_counts)
print(scaled_counts)
'''

sub2[0].implementation = '''
def calculate_view_count_factor(view_counts):
    """
    Calculate the view count factor for each video.

    Args:
    - view_counts (list): List of view counts for each video.

    Returns:
    - view_count_factors (list): List of view count factors for each video.
    """
    normalized_counts = normalize_view_counts(view_counts)
    view_count_factors = apply_logarithmic_scaling(normalized_counts)
    return view_count_factors

# Example usage:
view_counts = [1000, 500, 2000, 300]
view_count_factors = calculate_view_count_factor(view_counts)
print(view_count_factors)
'''
