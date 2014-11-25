<?php

require_once('model/Node.php');//Class nodes for the graph
require_once('model/Content.php');//Class contents for the graph

/**
 * Description of Graph undirected with Nodes, Edges and Contents that relate 
 * 
 * @version 1.0
 * @copyright (c) 2014
 * @author Aarón Rosas (aarr90@gmail.com) - Fco Javier Gijon (fcojaviergijon@gmail.com)
 */
abstract class Graph {

    /**
     *
     * @var array of Node
     */
    private $nodes = null;

    /**
     * Array for store the edges in the next format:
     * $edges = array(idNodeSource1=>array(), idNodeSource2=>array(),...)∫
     * $edges[idNodeSourceX] = array(idNodeDestination1, idNodeDestination2...)
     * idNodeSource always < idNodeDestination
     * @var array 
     */
    private $edges = null;

    /**
     *
     * @var array of Content 
     */
    private $contents = null;

    /**
     *
     * @var Node 
     */
    private $me = null;

    /**
     * Retrieves information stored in the $_SESSION var if exist
     */
    function __construct() {
        $this->nodes = (isset($_SESSION["nodes"])) ? $_SESSION["nodes"] : array();
        $this->edges = (isset($_SESSION["edges"])) ? $_SESSION["edges"] : array();
        $this->contents = (isset($_SESSION["contents"])) ? $_SESSION["contents"] : array();
        $this->me = (isset($_SESSION["me"])) ? $_SESSION["me"] : null;
    }

    /**
     * Give a node id, returns the value of the field especified by the key
     * @param type $id
     * @param type $key
     * @return type
     */
    protected function getField($id, $key) {
        return (isset($this->nodes[$id]) && isset($this->nodes[$id]->$key)) ? $this->nodes[$id]->$key : null;
    }

    /**
     * Add a node if not exist
     * @param Node $node
     * @return boolean True if the node was added
     */
    protected function addNode(Node $node) {
        $id = $node->id . "";
        $added = false;
        if (!isset($this->nodes[$id])) { // node doesn't exist
            $this->nodes[$id] = $node;
            $added = true;
        }
        return $added;
    }

    /**
     * Update the information for a node in the $_SESSION var
     * @param type $id
     */
    protected function updateSessionNode($id) {
        if (isset($this->nodes[$id]))
            $_SESSION['nodes'][$id] = $this->nodes[$id];
    }

    /**
     * Add a edge between 2 nodes. Add the nodes if not exist
     * @param Node $node1
     * @param Node $node2
     * @param type $updateSession If it's true, update the $_SESSION var
     * @return boolean True if the edge was added
     */
    protected function addEdge(Node $node1, Node $node2, $updateSession = false) {
        $created = false;
        //add nodes if not exist
        $this->addNode($node1);
        $this->addNode($node2);
        //determinate source and destination ids (for respect format $edges)
        $s = $node1->id;
        $d = $node2->id;
        if ($s != $d) {
            if ($s > $d) {
                $s = $node2->id;
                $d = $node1->id;
            }
            if (!isset($this->edges[$s]))
                $this->edges[$s] = array();
            if (array_search($d, $this->edges[$s]) === false) {
                //if the edge doesn't exist, add the edge
                array_push($this->edges[$s], $d);
                $created = true;
                if ($updateSession)
                    $_SESSION['edges'] = $this->edges;
            }
        }
        return $created;
    }

    /**
     * Remove a edge between 2 nodes.
     * @param Node $node1
     * @param Node $node2
     * @param type $updateSession If it's true, update the $_SESSION var
     * @return boolean True if the edge was removed
     */
    protected function removeEdge(Node $node1, Node $node2, $updateSession = false) {
        $removed = false;
        //determinate source and destination ids (for respect format $edges)
        $s = $node1->id;
        $d = $node2->id;
        if ($s != $d) {
            if ($s > $d) {
                $s = $node2->id;
                $d = $node1->id;
            }
            if (isset($this->edges[$s])) {
                $index = array_search($d, $this->edges[$s]);
                if ($index !== false) {
                    //if the edge exists, remove the edge
                    unset($this->edges[$s][$index]);
                    if ($updateSession)
                        $_SESSION['edges'] = $this->edges;
                    $removed = true;
                }
            }
        }
        return $removed;
    }

    /**
     * Add all edges between all nodes
     * @param array $nodes
     */
    protected function addAllEdges(array $nodes) {
        $num = count($nodes);
        for ($i = 0; $i < $num; ++$i) {
            for ($j = $i + 1; $j < $num; ++$j) {
                //add the edge
                $this->addEdge(new Node($nodes[$i]), new Node($nodes[$j]));
            }
        }
    }

    /**
     * Add a content if not exist
     * @param Content $c
     * @return boolean True if the content was added
     */
    protected function addContent(Content $c) {
        $id = $c->id . "";
        $added = false;
        if (!isset($this->contents[$id])) { // content not exists
            $this->contents[$id] = $c;
            $added = true;
        }
        return $added;
    }
    /**
     * Update the information for a content in the $_SESSION var
     * @param type $id
     */
    protected function updateSessionContent($id) {
        if (isset($this->contents[$id]))
            $_SESSION['contents'][$id] = $this->contents[$id];
    }

    /**
     * Get Node "me"
     * @return Node
     */
    protected function getMe() {
        $this->me = $_SESSION['me'] = isset($_SESSION['me']) ? $_SESSION['me'] : $this->loadMe();
        return $this->me;
    }

    /**
     * Get the nodes
     * @return array of Node
     */
    protected function getNodes() {
        return $this->nodes;
    }

    /**
     * Get the contents
     * @return array of Content
     */
    protected function getContents() {
        return $this->contents;
    }

    /**
     * To know if 2 nodes are linked
     * @param Node $node1
     * @param Node $node2
     * @return boolean True if the edge exists
     */
    protected function isEdge(Node $node1, Node $node2) {
        $is = false;
        $s = $node1->id;
        $d = $node2->id;
        if ($s != $d) {
            if ($s > $d) {
                $s = $node2->id;
                $d = $node1->id;
            }
            if (isset($this->edges[$s]) && in_array($d, $this->edges[$s]))
                $is = true;
        }
        return $is;
    }

    /**
     * Returns the graph with all the information in json format
     * @return json
     */
    public function getJSONGraph() {

        $edges = array();
        foreach ($this->edges as $i => $js) {
            foreach ($js as $j) {
                array_push($edges, "$i-$j");
            }
        }

        //update Session
        $me = $this->loadMe();
        if ($me)//always, try to update me
            $_SESSION['me'] = $this->me = $me;
        $_SESSION['nodes'] = $this->nodes;
        $_SESSION['edges'] = $this->edges;
        $_SESSION['contents'] = $this->contents;

        return array(
            "nodes" => $this->nodes,
            "edges" => $edges,
            "contents" => $this->contents,
            "me" => $this->me,
        );
    }

    /**
     * Add nodes, edges and contents to the graph
     * @return boolean success or error
     */
    public abstract function loadGraph($param1);

    /**
     * Load Node Me
     */
    protected abstract function loadMe();
}
