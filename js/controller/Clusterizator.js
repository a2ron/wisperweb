/**
 * Class Clusterizator 
 * @version 1.0
 * @copyright (c) 2014
 * @author Aarón Rosas (aarr90@gmail.com) - Fco Javier Gijon (fcojaviergijon@gmail.com)
 * @returns {Clusterizator}
 */
function Clusterizator()
{

    var mirrors = ["http://cd-wisperapp.rhcloud.com/webresources/cd",
        "http://cdrest3-fgijon.rhcloud.com/webresources/cd"];

    /**
     * Request function with mirrors
     * @param {type} idMirror
     * @param {type} params
     * @param {type} cdRequest
     * @param {type} index
     * @returns {undefined}
     */
    function request(idMirror, params, cdRequest, index)
    {
        console.log("Mirror: " + idMirror);
        $.ajax({
            "type": "POST",
            "dataType": "text",
            "url": mirrors[idMirror],
            "data": {source: cdRequest},
            "success": function(response)
            {
                //cd request OK
                debug("Clusterize: " + response);
                var clusters = response.split(";");
                //save the last clustering
                lastClustering = {};
                for (var id in index) {
                    lastClustering[id] = clusters[index[id]];
                }
                //when cd request finished (always)
                if (params.onAlways !== undefined)
                    params.onAlways.apply();
            }
        }).fail(function() { //fail in cd request
            console.error("Response Clusters: FAIL");
            idMirror++;
            if (idMirror < mirrors.length)
                request(idMirror, params, cdRequest, index);
            else {
                uniqueCluster(index);
                //when cd request finished (always)
                if (params.onAlways !== undefined)
                    params.onAlways.apply();
            }
        });
    }

    /**
     * Aux Function: Order a json array by "prop" key (asc|desc)
     * @param {json} json the array to order
     * @param {String} prop key to order
     * @param {Boolean} asc If true, order asc
     * @returns {json ordered}
     */
    function sortJSON(json, prop, asc) {
        json = json.sort(function(a, b) {
            if (asc)
                return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
            else
                return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
        });
        return json;
    }

    /**
     * Save the last result for a "clusterization"
     * @type String|@arr;clusters
     */
    var lastClustering = null;

    /**
     * Aux Function: Set lastClustering: all nodes in the same group
     * @param {array of node ids} index
     * @returns {undefined}
     */
    function uniqueCluster(index)
    {
        lastClustering = {};
        for (var id in index) {
            lastClustering[id] = "1";
        }
    }

    /**********************************************************************************************************/
    /* PUBLIC */
    /**********************************************************************************************************/

    /**
     * Do the request to "clusterize" several nodes (especified in param.nodes)
     * Use the general val g (the graph)
     * After the request apply the function param.onAlways
     * @param {json} params
     * @returns {undefined}
     */
    this.clusterize = function(params)
    {
        //check that there are nodes
        var nodes = params.nodes;
        if (nodes === undefined) {
            lastClustering = null;
            return;
        }

        //prepare index-nodes for community deteccion request
        var index = {}, i = 0;
        for (var id in nodes) {
            index[id] = i++;
        }

        //prepare edges for community deteccion request
        var edges = "";
        $.each(g.getEdges(), function(i, edge)
        {
            edge = edge.split("-");
            //edge valid in the cluster especified
            if (index[edge[0]] !== undefined && index[edge[1]] !== undefined)
                edges += index[edge[0]] + "-" + index[edge[1]] + ";";
        });
        //if there are edges to the community detection request
        if (edges.length > 0) {
            //cd request
            var cdRequest = i + ";" + edges;
            debug("CD Request: " + cdRequest);
            cdRequest = cdRequest.substring(0, cdRequest.length - 1);
            request(0, params, cdRequest, index);
        }
        else {
            debug("NO Edges, NO CD Request");
            uniqueCluster(index);
            //always function
            if (params.onAlways !== undefined)
                params.onAlways.apply();
        }
    };

    /**
     * Gets the .groupwrapper according to the lastClustering result
     * @returns {jQuery}
     */
    this.getGroups = function()
    {
        var wrappers = new jQuery("<div/>");
        var count = [];//for sort

        for (var id in lastClustering)
        {
            //deteminate the node and cluster
            var node = g.getNodes()[id];
            var cluster = lastClustering[id];
            //in not exists the group wrapper for the cluster, create it
            if (wrappers.find("[cluster='" + cluster + "']").length === 0) {
                //new groupwrapper
                wrappers.append(GroupWrapper.new().attr("cluster", cluster));
                //init counter
                count[cluster] = {"cluster": cluster, "num": 0};
            }
            //get the GroupWrapper for the cluster
            var wrapper = wrappers.find("[cluster='" + cluster + "']");
            //create the GroupUserImage for the node
            var userImage = GroupUserImage.new(node);
            //add the GroupUserImage to the GroupWrapper
            wrapper.find(".groupUsers").append(userImage);
            //inc counter
            count[cluster].num++;
        }

        //sort
        count = sortJSON(count, "num");
        //group wrapper for nodes in groups with only one node
        var resto = GroupWrapper.new();
        for (var c in count)//reordering wrappers and handle group wrapper resto
        {
            //determinate de GroupWrapper
            var wrapper = wrappers.find(".groupwrapper[cluster='" + count[c].cluster + "']");
            //if the Group have only one user, append to "resto"
            if (count[c].num === 1) {
                //append to "resto"
                resto.find(".groupUsers").append(wrapper.find(".groupuserimage"));
                //delete this group
                wrapper.remove();
            }
            else {
                //bring the group to the top (ordering)
                wrappers.append(wrapper.removeAttr("cluster"));
            }
        }
        //if there are nodes in "resto", append to wrappers
        if (resto.find(".groupuserimage").length > 0)
            wrappers.append(resto);

        //remove the "desgranar" button if the group have less than X nodes(users)
        $(wrappers).find(".groupwrapper").each(function(i, g)
        {
            if ($(g).find(".groupuserimage").length < 6)
                $(g).find(".desgranar").remove();

        });

        //return the wrappers
        return wrappers.contents();

    };

}

