<?php

require_once('twitteroauth/twitteroauth.php'); //connection with Twitter API
require_once('controller/Graph.php'); //Father Class
require_once('config_tt.php'); //connection app configuration

/**
 * Description of TwitterGraph
 * 
 * @version 1.0
 * @copyright (c) 2014
 * @author Aarón Rosas (aarr90@gmail.com) - Fco Javier Gijon (fcojaviergijon@gmail.com)
 */
class TwitterGraph extends Graph {

    private $c = null; //connection with Twitter
    private $myFriends = null; //array of ids of my friends

    /**
     * Initialize the connection with the Twitter API
     * @param type $access_token
     */

    function __construct($access_token = null) {
        parent::__construct();
        if ($access_token === null)
            $access_token = $_SESSION['access_token'];
        $this->c = new TwitterOAuth(CONSUMER_KEY, CONSUMER_SECRET, $access_token['oauth_token'], $access_token['oauth_token_secret']);
    }

    /**
     * Add the edge betweet "me" and the user, if the edge doesn't exist and they are friends
     * @param Node $user
     */
    private function checkFriend(Node $user) {
        $me = $this->getMe();
        if (!$this->isEdge($me, $user) && in_array($user->id, $this->myFriends)) {
            $this->addEdge($me, $user);
        }
    }

    private function isMyFriend(Node $user) {
        return in_array($user->id, $this->myFriends);
    }

    /**
     * Add a node if it doesn't exist or update some fields (picture and name) if they aren't defined
     * @param Node $node
     */
    protected function addNode(Node $node) {
        $id = $node->id . "";

        if (!isset($this->getNodes()[$id]))  // node doesn't exist
            parent::addNode($node);
        else { //node exists
            if ($this->getField($id, "picture") === null && isset($node->picture)) { //Does the picture exist?
                $this->nodes[$id]->picture = $node->picture;
            }if ($this->getField($id, "name") === null && isset($node->name)) { //Does the name exist?
                $this->nodes[$id]->name = $node->name;
            }
        }
    }

    /**
     * Given the information of an User retrieved by Twitter, get a node with the data
     * @param type $data
     * @return \Node
     */
    private function newNode($data) {
        $node = new stdClass();
        $node->id = $data->id . "";
        if (isset($data->name))//NOTE: For now, we supossed OK if name doens't exist
            $node->name = $data->name;
        $node->screen_name = $data->screen_name;
        if (isset($data->profile_image_url))
            $node->picture = $data->profile_image_url;
        return new Node($node);
    }

    /**
     * Get a tweet embed in HTML format (with media and without the script)
     * @param type $idT
     * @return boolean
     */
    private function getTweetHTML($idT) {
        //request tweet embed
        $res = $this->c->get("statuses/oembed", array("id" => $idT, "hide_media" => false, "omit_script" => true));
        if (isset($res->html)) {
            $res = $res->html;
        } else {
            $res = false;
        }
        return $res;
    }

    /**
     * Given the information of an Tweet retrieved by Twitter, get a Content with the data
     * @param type $data
     * @return \Content
     */
    private function newContent($data) {
        $content = new stdClass();
        $content->id = $data->id . "";
        $content->text = $data->text;
        $content->user_id = $data->user->id;
        $content->datetime = $data->created_at;
        $content->retweeted = $data->retweeted;
        $content->retweeted = $data->favorited;
        //Is it a retweet?
        if (isset($data->retweeted_status))
            $content->orig_user_id = $data->retweeted_status->user->id;
        //Entities
        if (isset($data->entities)) {
            //Does the tweet have any mention?
            if (isset($data->entities->user_mentions) && count($data->entities->user_mentions) > 0)
                $content->mentions = $data->entities->user_mentions;
            //Does the tweet have any url?
            if (isset($data->entities->urls) && count($data->entities->urls) > 0)
                $content->urls = $data->entities->urls;
            //Does the tweet have any media?
            if (isset($data->entities->media) && count($data->entities->media) > 0)
                $content->media = $data->entities->media;
            //Does the tweet have any hashtag?
            if (isset($data->entities->hashtags) && count($data->entities->hashtags) > 0)
                $content->hashtags = $data->entities->hashtags;
        }
//        $content->extra = $data; 
//        $content->html = $this->getTweetHTML($data->id);  
        return new Content($content);
    }

    /**
     * Add nodes, edges and contents to the graph
     * @param int $numTweets to consider to load the graph
     * @return Boolean according load success
     */
    public function loadGraph($numTweets) {
        $hashtags = array(); //for add edges according the hashtags
        $maxId = null; //for several request
        //load Friends and me
        $me = $this->getMe();
        $this->myFriends = $this->c->get('friends/ids', array('user_id' => $me->id))->ids;
        //check error
        $error = !($me instanceof Node && is_array($this->myFriends));
        //while no error and there are remaining request
        while ($numTweets > 0 && !$error) {
            //request tweets
            $params = array(
                'count' => $numTweets,
                'include_entities' => 'true');
            if ($maxId != null)
                $params['max_id'] = $maxId;
            $tweets = $this->c->get('statuses/home_timeline', $params);
            //treat tweets
            if (!isset($tweets->errors)) {
                $numTweets-=count($tweets);
                foreach ($tweets as $tweet) {
                    //for future request tweets
                    $maxId = ($tweet->id < $maxId || $maxId == null) ? $tweet->id : $maxId;
                    //it the tweet it's already treated, dont' treat it
                    if (isset($this->getContents()[$tweet->id . ""]))
                        continue;
                    //user of the tweet
                    $user = $this->newNode($tweet->user);
                    //add the tweet to contents
                    $this->addContent($this->newContent($tweet));
                    //edge me-user_tweet
                    $this->addEdge($me, $user);

                    /* ADD EDGES */
                    /* edge by reply */
                    if ($tweet->in_reply_to_user_id > 0) {
                        $user2 = new stdClass();
                        $user2->id = $tweet->in_reply_to_user_id;
                        $user2->screen_name = $tweet->in_reply_to_screen_name;
                        $this->addEdge($user, $this->newNode($user2));
                    }
                    /* edge by retweet */
                    $retweet_user = null;
                    if (isset($tweet->retweeted_status)) {
                        $retweet_user = $this->newNode($tweet->retweeted_status->user);
                        $this->addEdge($user, $retweet_user);
                        $this->checkFriend($retweet_user);
                    }
                    /* edges by mention */
                    if (isset($tweet->entities->user_mentions)) {
                        foreach ($tweet->entities->user_mentions as $userMentioned) {
                            $userMentioned = $this->newNode($userMentioned);
                            $this->addEdge($user, $userMentioned);
                            $this->checkFriend($userMentioned);
                        }
                        /* it asumes nodes created previously with newNode for to manage only the fields needed */
                        $this->addAllEdges($tweet->entities->user_mentions);
                    }
                    /* edges by hashtag */
                    if (isset($tweet->entities->hashtags)) {
                        foreach ($tweet->entities->hashtags as $hashtag) {
                            $hashTagText = strtolower($hashtag->text); //mayus or minus, insensitive
                            if (!isset($hashtags[$hashTagText]))
                                $hashtags[$hashTagText] = array();
                            //save the hashtag and the users who use them to create edges after
                            array_push($hashtags[$hashTagText], $user);
                            if ($retweet_user != null) {
                                array_push($hashtags[$hashTagText], $retweet_user);
                            }
                        }
                    }
                }
            } else {
                $error = true;
            }
        }

        /* create edges by hashtags */
        foreach ($hashtags as $hashtag => $usersHashTag) {
            $num = count($usersHashTag);
            if ($num > 1) {
                /* it asumes nodes created previously with newNode for to manage only the fields needed */
                $this->addAllEdges($usersHashTag);
            }
        }

        return !$error;
    }

    /**
     * Load Node Me
     */
    protected function loadMe() {
        $result = false;
        //request "me" information
        $me = $this->c->get('account/verify_credentials');
        if (!isset($me->errors)) {
            $result = $this->newNode($me);
            //add more fields to me
            $result->followers_count = $me->followers_count;
            $result->friends_count = $me->friends_count;
            $result->tweets_count = $me->statuses_count;
        }

        return $result;
    }

    /*     * ********************************************************************************* */
    /* Social Network Functions */
    /*     * ********************************************************************************* */

    /**
     * Get the user information, giving an id or screen_name of user
     * @param $id id or screen_name in format @name
     * @return false|twitterUserResponse
     */
    public function getUser($id) {
        $result = false;
        //request user information
        $param = "user_id";
        if ($id[0] === "@")
            $param = 'screen_name';
        $user = $this->c->get('users/show', array($param => $id));
        if (!isset($user->errors)) {
            //success, get the user and save information
            $result = $user;
            $id = $user->id . "";
            //save image if it's necessary
            if (isset($this->getNodes()[$id]) && $this->getField($id, "picture") === null) {
                $this->getNodes()[$id]->picture = $user->profile_image_url;
                $this->updateSessionNode($id);
            }
            //save name if it's necessary
            if (isset($this->getNodes()[$id]) && $this->getField($id, "name") === null) {
                $this->getNodes()[$id]->name = $user->name;
                $this->updateSessionNode($id);
            }
        }
        return $result;
    }

    /**
     * Make a retweet
     * @param type $id of the tweeet to retweet
     * @return boolean true=retweeted, false=unRetweeted, null=error
     */
    public function retweet($id) {
        $result = null;
        //request retweet
        if (isset($this->getContents()[$id])) {
            if (!isset($this->getContents()[$id]->myRetweeted))
                $res = $this->c->post("statuses/retweet/$id", array("id" => $id));
            else {
                $idR = $this->getContents()[$id]->myRetweeted;
                $res = $this->c->post("statuses/destroy/$idR", array("id" => $idR));
            }
            if (!isset($res->errors)) {
                //success
                $result = $res->retweeted;
                //save the retweet
                $this->getContents()[$id]->retweeted = $result;
                if ($result)
                    $this->getContents()[$id]->myRetweeted = $res->id_str;
                else
                    unset($this->getContents()[$id]->myRetweeted);
                $this->updateSessionContent($id);
            } else{ //error
                return $res;
            }
        }
        return $result;
    }

    /**
     * Make a favorite
     * @param number_string $id of the tweeet to favorite
     * @param boolean action true or false (favorite/unFavorite)
     * @return boolean true=favorited, false=unFavorited, null=error
     */
    public function favorite($id, $action) {
        $action = ($action === true) ? "create" : "destroy";
        $result = null;
        //request favorite
        if (isset($this->getContents()[$id])) {

            $res = $this->c->post("favorites/$action", array("id" => $id));
            if (!isset($res->errors)) {
                //success
                $result = $res->favorited;
                //save the favorite
                $this->getContents()[$id]->favorited = $result;
                $this->updateSessionContent($id);
            } else //error
                $result = $this->getContents()[$id]->favorited;
        }
        return $result;
    }

    /**
     * Make a reply
     * @param type $status message, the reply
     * @param type $id2Reply id of the tweeet to reply
     * @return boolean success or error
     */
    public function reply($status, $id2Reply = null) {
        //request reply
        $param = array("status" => $status, "in_reply_to_status_id" => $id2Reply);
        $res = $this->c->post("statuses/update", $param);
        if (!isset($res->errors)) {
            $res = true;
        } else
            $res = false;
        return $res;
    }

    /**
     * Make a follow
     * @param type $user_id id of the user to follow
     * @return boolean if "me" is connected with the user after the request
     */
    public function follow($user_id) {
        $me = $this->getMe();
        $user = $this->getNodes()[$user_id];
        //request follow
        $param = array("user_id" => $user_id);
        $res = $this->c->post("friendships/create", $param);
        if (!isset($res->errors)) {
            $this->addEdge($me, $user, true);
        }
        return $this->isEdge($me, $user);
    }

    /**
     * Make an unfollow
     * @param type $user_id id of the user to unfollow
     * @return boolean if "me" is connected with the user after the request
     */
    public function unfollow($user_id) {
        $me = $this->getMe();
        $user = $this->getNodes()[$user_id];
        //request unfollow
        $param = array("user_id" => $user_id);
        $res = $this->c->post("friendships/destroy", $param);
        if (!isset($res->errors)) {
            $this->removeEdge($me, $user, true);
        }
        return $this->isEdge($me, $user);
    }

}
