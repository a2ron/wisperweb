/**
 * Class Graph. Obtains the graph to the server and handles it
 * @version 1.0
 * @copyright (c) 2014
 * @author Aarón Rosas (aarr90@gmail.com) - Fco Javier Gijon (fcojaviergijon@gmail.com)
 * @param {json} params
 * @returns {Graph}
 */
function Graph(params)
{
    var data;//the graph data

    /**
     * Obtain the graph and apply success or error functions, especified in params
     * @returns {undefined}
     */
    function _constructor()
    {
        //obtain the graph
        $.getJSON("ajax/getGraph.php?max=" + params.max, function(response)
        {
            debug(response);
            data = response;
            //if there were errors
            if (data.nodes.length === 0)
                params.onError.apply();
            else
            {
                //there were NOT ERRORS
                if (params.onSuccess !== undefined)
                    params.onSuccess.apply();
            }
        }).fail(function() //if fail
        {
            params.onError.apply();
        });
    }

    /**
     * Return the string according to the edge between 2 ids, in data.edges format 
     * Format: source-destination where source<destination
     * @param {Number} u1
     * @param {Number} u2
     * @returns {String}
     */
    function getEdgeString(u1, u2)
    {
        var id1 = u1.id, id2 = u2.id;
        return (parseInt(id1) > parseInt(id2)) ? id2 + "-" + id1 : id1 + "-" + id2;
    }

    /**********************************************************************************************************/
    /* PUBLIC */
    /**********************************************************************************************************/

    this.getNodes = function()
    {
        return data.nodes;
    };
    this.getContents = function()
    {
        return data.contents;
    };
    this.getEdges = function()
    {
        return data.edges;
    };

    this.getMe = function()
    {
        return data.me;
    };

    /**
     * Determines if there is a edge between u1 and u2
     * @param {Node} u1
     * @param {Node} u2
     * @returns {Boolean}
     */
    this.isEdge = function(u1, u2)
    {
        return data.edges.indexOf(getEdgeString(u1, u2)) !== -1;
    };

    /**
     * Add a edge between u1 and u2 if it doesn't exist
     * @param {Node} u1
     * @param {Node} u2
     * @returns {undefined}
     */
    this.addEdge = function(u1, u2)
    {
        var edge = getEdgeString(u1, u2);
        var index = data.edges.indexOf(edge);
        if (index === -1) {
            data.edges.push(edge);
        }
    };

    /**
     * Remove the edge between u1 and u2 if it exists
     * @param {Node} u1
     * @param {Node} u2
     * @returns {undefined}
     */
    this.removeEdge = function(u1, u2)
    {
        var edge = getEdgeString(u1, u2);
        var index = data.edges.indexOf(edge);
        if (index !== -1) {
            data.edges.splice(index, 1);
        }
    };

    /**********************************************************************************************************/
    _constructor(params);
}