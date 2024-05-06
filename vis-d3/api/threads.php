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
        $url = 'https://api.openai.com/v1/threads/' . $thread_id . '/messages';
        
        $result = make_request('POST', $url, json_encode(
            array(
                'role' => $role,
                'content' => $content
            )
        ));

        return $result;
    }

    function create_first_message($thread_id, $problem, $description) {
        $text = '-- Problem description --\n' . json_encode(array(
            'name' => $problem,
            'description' => $description
        ));
    
        return create_message($thread_id, 'user', $text);
    }
  
    function create_followup_message($thread_id, $problem) {
        $text = 'Using the same approach, decompose the task "' . $problem . '"';
  
        return create_message($thread_id, 'user', $text);
    }

    // todo: fare richiesta da curl e guardare il valore di usage
    function run_thread($thread_id, $assistant_id) {
        $url = 'https://api.openai.com/v1/threads/' . $thread_id . '/runs';

        $result = make_request('POST', $url, json_encode(
            array(
                'assistant_id' => ASSISTANT_ID, // TO BE CHANGED
                'response_format' => array('type' => 'json_object')
            )
        ));

        $result = json_decode($result);
        // $result = $result->result;

        return $result;

    }
?>