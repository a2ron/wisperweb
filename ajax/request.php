<?php

set_include_path(get_include_path() . PATH_SEPARATOR . dirname(dirname(__FILE__))); //ajax request
//load graph manager
require_once "controller/TwitterGraph.php";
session_start();
$tge = new TwitterGraph($_SESSION['access_token']);

//determinate operation and apply with the graph manager
if ($_GET['op'] == "getUser") {
    $res = $tge->getUser($_GET['id']);
} elseif ($_GET['op'] == "retweet") {
    $res = $tge->retweet($_GET['id']);
} elseif ($_GET['op'] == "reply") {
    $res = $tge->reply($_GET['status'], $_GET['idT']);
} elseif ($_GET['op'] == "follow") {
    $res = $tge->follow($_GET['id']);
} elseif ($_GET['op'] == "unfollow") {
    $res = $tge->unfollow($_GET['id']);
} elseif ($_GET['op'] == "favorite") {
    $action = ($_GET['action'] === "1") ? true : false;
    $res = $tge->favorite($_GET['id'], $action);
}
//return the operation result
echo json_encode($res);
?>