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
        url: `http://${SERVER_ADDR}/login`,
        data: {
            'user_id': JSON.stringify(uid),
        },
        success: function(d) {
            let data = d;
            
            if (data.status && data.status == 'invalid_request') {
                throw Error(data.message);
            }
            
            if (data.user) {
                user_id = uid;
            
                $('#login').hide();
                update_user_data();
                
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

    $('#user-id').text(user_id);
    $('#credits').text(100);
    $('#ranking').text(1);

}

function check_user_id() {
    if (!user_id) {
        alert('You need to login first!');
        return false;
    }

    return true;
}