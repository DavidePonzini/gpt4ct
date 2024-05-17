<?php
    function is_any_field_missing($array, $fields) {
        foreach ($fields as $k => $field) {
            // echo $field . '\n';

            if (!isset($array[$field]))
                return true;
        }
        
        return false;
    }

?>