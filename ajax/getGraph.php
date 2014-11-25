<?php

set_include_path(get_include_path() . PATH_SEPARATOR . dirname(dirname(__FILE__))); //ajax request

//load graph manager
require_once "controller/TwitterGraph.php";
session_start();
$tge = new TwitterGraph($_SESSION['access_token']);

// (RE)LOAD GRAPH NOW ?
//if no error in the last request and last request is very recent
if (isset($_SESSION["loadGraphSuccess"]) && $_SESSION["loadGraphSuccess"] !== false && (time() < ($_SESSION['last_update'] + 90))) {
    $new = false;
} else {
    //error in the last request or last request is very old
    $_SESSION["loadGraphSuccess"] = $tge->loadGraph($_GET['max']);
    $_SESSION['last_update'] = time();
    $new = true;
}
//get the graph and export in json
$graph = $tge->getJSONGraph();
$graph["error"] = !$_SESSION["loadGraphSuccess"];
$graph['new'] = $new;
echo json_encode($graph);
?>