<?php

/**
 * Description of Content
 * 
 * @version 1.0
 * @copyright (c) 2014
 * @author Aarón Rosas (aarr90@gmail.com) - Fco Javier Gijon (fcojaviergijon@gmail.com)
 */
class Content extends stdClass {

    function __construct(stdClass $_content) {
        $requireds = array("id","text","datetime","user_id");
        foreach ($requireds as $required) {
            if (!isset($_content->$required))
                throw new Exception("Content without $required");
        }
        foreach ($_content as $key => $value)
            $this->$key = $value;
    }

}
