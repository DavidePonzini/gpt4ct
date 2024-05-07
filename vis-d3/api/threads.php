<?php
    include('request.php');

    function get_run($thread_id, $run_id) {
        $url = 'https://api.openai.com/v1/threads/' . $thread_id . '/runs/' . $run_id;
        $result = make_request('GET', $url);

        return check_error($result);
    }

    function wait_for_run($thread_id, $run_id) {
        while(true) {
            $run = get_run($thread_id, $run_id);
            $status = $run->status;
            
            if ($status == 'completed') {
                return;
            }
        }
    }

    function create_thread() {
        $result = make_request('POST', 'https://api.openai.com/v1/threads', null);
        $result = $result->id;

        return check_error($result);
    }

    function get_messages($thread_id) {
        $url = 'https://api.openai.com/v1/threads/' . $thread_id . '/messages';

        $result = make_request('GET', $url);

        return check_error($result);
    }

    function create_message($thread_id, $role, $content) {
        $url = 'https://api.openai.com/v1/threads/' . $thread_id . '/messages';
        
        $result = make_request('POST', $url, json_encode(
            array(
                'role' => $role,
                'content' => $content
            )
        ));

        return check_error($result);
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

    function run_thread($thread_id, $assistant_id) {
        $url = 'https://api.openai.com/v1/threads/' . $thread_id . '/runs';

        $result = make_request('POST', $url, json_encode(
            array(
                'assistant_id' => $assistant_id,
                'response_format' => array('type' => 'json_object')
            )
        ));

        return check_error($result);
    }
?>