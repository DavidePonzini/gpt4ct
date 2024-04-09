/*
given the following problem, help the user identify any technological requirements. Provide the answer in json format, as a list of strings

--- problem ---
Write a python program to find the most trending videos, given a csv file containing each visualization
*/


function show_requirements(requirements) {
    let list = $('#requirements');
    list.empty();

    for (let requirement of requirements) {
        let item = $('<li></li>');
        item.addClass('list-group-item');
        item.text(requirement);

        list.append(item);
    }
}




/*
given the following problem, help the user formulate their question more accurately.

--- instruction ---
- ask the user several question to help them refine their query. focus on unclear parts of the problem. the questions should engage critical thinking in the user. the questions should be sorted in order of relevance
- unless the user has already specified them and unless the problem is too broad, ask about which tools are going to be used 
- return the results in json format, as a list of strings

--- problem ---
create a program that finds the most trending videos 
*/

function show_refinement_questions(questions) {
    let list = $('#description');
    list.empty();

    for (let question of questions) {
        let item = $('<li></li>');
        item.addClass('list-group-item');
        item.text(question);

        list.append(item);
    }
}
