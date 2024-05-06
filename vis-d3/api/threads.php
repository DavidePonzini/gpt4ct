<?php
    include('request.php');

    function create_thread() {
        $result = make_request('POST', 'https://api.openai.com/v1/threads', null);
        $result = json_decode($result);
        $result = $result->id;

        return $result;
    }

    function get_messages($thread_id) {
        $url = 'https://api.openai.com/v1/threads/' . $thread_id . '/messages';

        return make_request('GET', $url, null);
    }

    function create_message($thread_id, $role, $content) {
        $result = make_request(
            'POST',
            'https://api.openai.com/v1/threads/' . $thread_id . '/messages',
            array(
                'role' => $role,
                'content' => $content
            )
        );

        return $result;
    }

    function create_first_message($thread_id, $problem) {
        $text = '-- Problem description --\n' . json_encode(array(
            'name' => $problem,
            'description' => $problem
        ));
    
        return create_message($thread_id, 'user', $text);
    }
  
    function create_followup_message($thread_id, $problem) {
        $text = 'Using the same approach, decompose the task "' . $problem . '"';
  
        return create_message($thread_id, 'user', $text);
    }
?>