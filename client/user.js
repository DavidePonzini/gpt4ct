let user_id = null;

function login() {
    if (user_id)
        return;

    let uid = prompt('Insert user id:');
    if (!uid) {
        return;
    }

    $.ajax({
        type: 'POST',
        url: `http://${SERVER_ADDR}/get-user`,
        data: {
            'user_id': JSON.stringify(uid),
        },
        success: function(d) {
            let data = d;
            
            if (data.user) {
                user_id = uid;
            
                $('#login').hide();
    
                $('#user-id').text(user_id);
                $('#credits').text(d.user.credits);
                $('#ranking').text(d.user.rank);
                
                return;
            }

            alert(`User "${uid}" does not exist. Try again.`);
        },
        error: console.error
    });
}

function update_user_data() {
    if (!check_user_id())
        return;

    $.ajax({
        type: 'POST',
        url: `http://${SERVER_ADDR}/get-user`,
        data: {
            'user_id': JSON.stringify(user_id),
        },
        success: function(d) {
            let data = d;
            
            if (data.user) {
                $('#credits').text(d.user.credits);
                $('#ranking').text(d.user.rank);
                
                return;
            }
        }
    });
}

function check_user_id() {
    if (!user_id) {
        alert('You need to login first!');
        return false;
    }

    return true;
}

function show_leaderboard() {
    $.ajax({
        type: 'GET',
        url: `http://${SERVER_ADDR}/leaderboard`,
        success: function(d) {
            let data = d;

            let leaderboard = $('#leaderboard');
            leaderboard.empty();

            for (let row of d) {
                let tr = $('<tr></tr>');
                if (user_id && user_id == row.user_id) {
                    tr.addClass('table-secondary');
                }

                let col_rank = $('<th scope="row"></tr>');
                col_rank.text(row.rank);

                let col_username = $('<td></td>');
                col_username.text(row.user_id);

                let col_credits = $('<td></td>');
                col_credits.text(row.credits);

                tr.append(col_rank).append(col_username).append(col_credits);
                leaderboard.append(tr);
            }

            $('#leaderboard-modal').modal('show');
        },
        error: console.error
    });
}