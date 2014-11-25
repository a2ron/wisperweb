/**
 * Initialize the interfaz
 * @version 1.0
 * @copyright (c) 2014
 * @author Aarón Rosas (aarr90@gmail.com) - Fco Javier Gijon (fcojaviergijon@gmail.com)
 */

var g; //the graph
var clusterizator = new Clusterizator();
var gManager; /* new GroupsManager(); on ready*/

$(document).ready(function()
{
    //load the graph
    g = new Graph({
        "max": $("#max").val(),
        "onError": function()
        {
            $("p.error").show();
            $("#loading").remove();//loading done
            console.error("ERROR on new Graph");
        },
        "onSuccess": function()
        {
            //LOAD MENU
            setMenuTwitter();
            /*LOAD CONTENTS*/
            $("#tweetswrapper").append(function()
            {
                var wrappers = new jQuery("<div/>");
                var ids = Object.keys(g.getContents()).sort(function(a, b) {
                    return b - a;
                });
                for (var i in ids)
                {
                    var tweet = g.getContents()[ids[i]];
                    wrappers.append(TweetWrapper.new(tweet));
                }
                return wrappers.contents();
            });
            //LOAD GROUPS
            clusterizator.clusterize({//clusterize request
                "nodes": g.getNodes(), //all nodes
                "onAlways": function() {
                    //append groups resulting of the last clusterization 
                    $("#groupswrapper").append(clusterizator.getGroups());

                    $("#loading").remove();//loading done

                    /* NOTE: In Twitter, there may be nodes without name or picture. Here we obtain missing data*/
                    for (var id in g.getNodes()) {
                        var node = g.getNodes()[id];
                        if (node.picture === undefined || node.name === undefined)
                        {
                            $.getJSON("ajax/request.php?op=getUser&id=" + node.id, function(response)
                            {
                                if (response) {
                                    var rNode = g.getNodes()[response.id];
                                    //update picture
                                    if (rNode.picture === undefined) {
                                        g.getNodes()[rNode.id].picture = response.profile_image_url;
                                        var imgs = $("img[idU='" + rNode.id + "']");
                                        imgs.attr("src", response.profile_image_url);
                                        /*$(".node.idT" + data.id + "").find("image").attr("href", data.profile_image_url);*/
                                    }
                                    //update name
                                    if (rNode.name === undefined) {
                                        g.getNodes()[rNode.id].name = response.name;
                                    }
                                }
                            });
                        }
                    }
                }});
        }
    });

    //for interaction with the groups
    gManager = new GroupsManager();

    //close session event
    $("#closeButton").click(function()
    {
        if (confirm(_("¿Seguro que desea salir?")))
            location.href = "index.php?cerrar";
        return false;
    });

    //reload
    $("#reloadButton").click(function()
    {
        location.reload();
        return false;
    });


});
