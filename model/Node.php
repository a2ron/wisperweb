<?php

/**
 * Description of Node
 * 
 * @version 1.0
 * @copyright (c) 2014
 * @author Aarón Rosas (aarr90@gmail.com) - Fco Javier Gijon (fcojaviergijon@gmail.com)
 */
class Node extends stdClass {

    function __construct(stdClass $_node) {
        $requireds = array("id", "screen_name");
        foreach ($requireds as $required) {
            if (!isset($_node->$required))
                throw new Exception("Node without $required");
        }
        foreach ($_node as $key => $value)
            $this->$key = $value;
    }

}
