/**
 * Class GroupsManager 
 * @version 1.0
 * @copyright (c) 2014
 * @author Aarón Rosas (aarr90@gmail.com) - Fco Javier Gijon (fcojaviergijon@gmail.com)
 */
function GroupsManager()
{
    /**
     * To assing idCluster when "desgranar", to save history
     * @type Number
     */
    var idCluster = 0;
    /**
     * To store groups linked to a Father Cluster identified by idCluster. "Desgranar" Operation
     * @type json array
     */
    var saved = {};
    /**
     * Step in the stack
     * @type Number
     */
    var p = 0;
    /*
     * To store the groups in each step of the groups stack
     * @type json array
     */
    var history = {};
    /**
     * To know which idCluster father is for each step in the groups stack
     * @type array of idCluster Father
     */
    var parents = {};

    var that = this;

    /**
     * Responsive Function (hide groups and show contents)
     * @returns {undefined}
     */
    function showOnlyContents()
    {
        //show only contents
        $("#CONTENTS").css("width", "100%").css("display", "block");
        $("#GROUPS").css("display", "none");
        $("#backButton").trigger("setEnabled");
    }

    /**
     * Find the contents that are relatives of user(idU), and show them
     * @param {Number} idU id of the user
     * @returns {undefined}
     */
    function showContentsByIdU(idU)
    {
        //foreach content
        for (var id in g.getContents())
        {
            //load the content
            var c = g.getContents()[id];
            var show = false;
            //Is it a content from this user?
            if (c.user_id === idU || c.orig_user_id === idU) {
                show = true;
            }
            //Is this user mentioned in this content?
            else if (c.mentions !== undefined)
            {
                for (var idM in c.mentions)
                {
                    var m = c.mentions[idM];
                    if (m.id === idU) {
                        show = true;
                        break;
                    }
                }
            }
            //show the content if appropiate
            if (show)
                $(".tweetswrapper .tweetwrapper[idT='" + id + "']").show();
        }
    }

    /**
     * Show only the contents that are relatives of cluster users
     * @param {.groupwrapper} cluster
     * @returns {undefined}
     */
    function showClusterContents(cluster)
    {
        //hide all contents
        $(".tweetswrapper .tweetwrapper").hide();
        //foreach userimage in the cluster
        $(cluster).find(".groupUsers").find(".groupuserimage").each(function(i, img)
        {
            //determinate user id
            var idU = parseInt($(img).attr("idU"));
            //show their contents
            showContentsByIdU(idU);
        });
        //go to the contents top
        $(".tweetswrapper").scrollTop(0);
    }

    /**
     * Manage the history and stack. Show the clusters children of a Cluster Father
     * @param {jQuery} clusterPadre the Cluster Father
     * @param {Number} idClusterPadre the id Cluster Father
     * @param {array .groupwrapper} wrappers groupwrappers clusters childrens
     * @returns {undefined}
     */
    function showChildrenClusters(clusterPadre, idClusterPadre, wrappers)
    {
        //back button enabled
        $("#backButton").trigger("setEnabled");
        //saved actual groups in history
        history[p] = (new $("<div/>")).append($("#groupswrapper").find(".groupwrapper"));
        //saved the id cluster father in the parents stack
        parents[p] = idClusterPadre;
        //next step in the stack
        p++;
        //append clusters children to the interface
        $("#groupswrapper").append(wrappers.hide());
        //effect (according to desktop or mobile version)
        if (mobile)
            wrappers.show();
        else
            wrappers.slideDown();
        $("#groupswrapper").scrollTop(0);

        //show the cluster father contents 
        showClusterContents(clusterPadre);
    }

    /**
     * Simulate a progress bar that lasts "millis" milliseconds
     * @param {boolean} init true at the first called
     * @param {type} millis time to fill 100%
     * @returns {undefined}
     */
    function progressBar(init, millis)
    {
        //initialization
        if (init === true) {
            if (millis === undefined)
                millis = 1000; //default millis
            //init the progress bar
            $("#progressbar").show().progressbar({
                "value": 0,
                "complete": function()
                {
                    $("#progressbar").hide();
                },
                "millis": millis
            });
            //force 100% if delay
            setTimeout(function()
            {
                $("#progressbar").progressbar({
                    "value": 100
                });
                setTimeout(function()
                {
                    $("#progressbar").hide();
                }, 10);
            }, millis * 1.2);
        }
        //determinate value and delay time between increments
        var v = $("#progressbar").progressbar("option", "value");
        v = parseInt(v) + 1;
        millis = $("#progressbar").progressbar("option", "millis");
        var t = parseInt(millis) / 100;
        if (v <= 100) {
            //change the value a call next increment
            $("#progressbar").progressbar({
                "value": v,
                "change": function()
                {
                    setTimeout(progressBar, t);
                }
            });
        }
    }

    /**
     * Get more groups from a group father
     * @param {.groupwrapper}  clusterPadre
     * @returns {undefined}
     */
    this.displaySubgroups = function(clusterPadre)
    {
        //determinate idClusterPadre
        var idClusterPadre = (clusterPadre.attr("idCluster") !== undefined) ? clusterPadre.attr("idCluster") : clusterPadre.attr("idCluster", ++idCluster).attr("idCluster");
        //check if their clusters children are saved
        if (saved[idClusterPadre] !== undefined)//saved
        {
            debug("Saved in history");
            showChildrenClusters(clusterPadre, idClusterPadre, saved[idClusterPadre].find(".groupwrapper"));
        }
        else//clusters children not saved
        {
            //determinate the cluster nodes to "clusterize"
            var nodes = {};
            $.each(clusterPadre.find(".groupUsers").find(".groupuserimage"), function(i, img)
            {
                var idU = parseInt($(img).attr("idU"));
                nodes[idU] = {"id": idU};
            });
            progressBar(true, 1000);
            //"clusterize" request
            clusterizator.clusterize({
                "nodes": nodes, //the nodes determinated
                "onAlways": function()
                {
                    //get groups resulting of the last clusterization 
                    var wrappers = clusterizator.getGroups();
                    if (wrappers.length > 1) //there are groups children
                    {
                        //show the groups children
                        showChildrenClusters(clusterPadre, idClusterPadre, wrappers);
                    }
                    else { //there are NOT groups children
                        //remove "desgranar" button in this cluster father
                        clusterPadre.find(".desgranar").fadeOut("fast", function()
                        {
                            $(this).remove();
                        });
                        //click the cluster father
                        clusterPadre.click();
                    }
                }
            });
        }
    };

    /**
     * Show only the contents that are relatives of user (cluster users) if it's selected or all else
     * Accept a .groupuserimage or a .groupwrapper
     * @param {jQuery element} element 
     */
    this.displayContents = function(element)
    {
        //determinate group or user to show their contents
        var selected;
        var groupWrapper = undefined;
        var userImage = undefined;
        element = $(element);
        if (element.hasClass("groupuserimage"))
        {
            userImage = element;
            selected = userImage.hasClass("userSelected");
        }
        else if (element.hasClass("groupwrapper"))
        {
            groupWrapper = element;
            selected = groupWrapper.hasClass("groupSelected");
        }
        else
            return false;
        //if there is a group or user determinated
        if (userImage !== undefined || groupWrapper !== undefined) {


            if ($("body").width() < 800) //responsive
            {
                showOnlyContents();
            }
            //if the user/group is selected
            if (!selected)
            {
                //back button enabled
                $("#backButton").trigger("setEnabled");
                //unflag selecting/selected groups and users
                $(".groupwrapper").removeClass("groupSelected").removeClass("groupSelecting");
                $(".groupuserimage").removeClass("userSelected").removeClass("userSelecting");
                //flag the user/group as selected and filter the contents according to the users
                if (userImage !== undefined)
                {
                    userImage.addClass("userSelected");
                    var idU = parseInt(userImage.attr("idU"));
                    debug("Show contents for an user");
                    $(".tweetswrapper .tweetwrapper").hide();
                    showContentsByIdU(idU);
                    $(".tweetswrapper").scrollTop(0);
                }
                else {
                    groupWrapper.addClass("groupSelected");
                    debug("Show contents for a cluster");
                    showClusterContents(groupWrapper);
                }
            }
            //if the user/group is NOT selected
            else
                showAllContents();

        }
    };

    /**
     * Determinate the step from the stack and show the contents according to it
     * @returns {Boolean}
     */
    function showAllContents()
    {
        var moreBack = true; //Is it possible more back steps in the stack?
        debug("Show all contents");
        //unflag selecting/selected groups and users
        $(".groupwrapper").removeClass("groupSelected").removeClass("groupSelecting");
        $(".groupuserimage").removeClass("userSelected").removeClass("userSelecting");
        //if we are in a step from the stack
        if (p > 0) {
            //determinate cluster father and show his contents
            var clusterPadre = history[p - 1].find(".groupwrapper[idCluster='" + parents[p - 1] + "']");
            showClusterContents(clusterPadre);
        }
        //if we are in the step 0 from the stack
        else {
            //show all contents and NO more back
            $(".tweetswrapper .tweetwrapper").show();
            moreBack = false;
        }
        return moreBack;
    }

    /**
     * Takes a step back on the stack
     * @returns {Boolean}
     */
    function goToBack()
    {
        //if we are in a step from the stack
        if (p > 0) {
            p--;//step back
            //save the clusters children linked to their cluster father id
            saved[parents[p]] = (new $("<div/>")).append($("#groupswrapper").find(".groupwrapper"));
            //reset saved clusters (selected and selecting)
            saved[parents[p]].find(".groupwrapper").removeClass("groupSelected").removeClass("groupSelecting");
            saved[parents[p]].find(".groupuserimage").removeClass("userSelected").removeClass("userSelecting");
            //recover the clusters from the step in the history and append to the interface
            var wrappers = history[p].find(".groupwrapper");
            $("#groupswrapper").append(wrappers.show());
            $("#groupswrapper").scrollTop(0);
        }
        //if we are on the top stack, show all contents
        return showAllContents();
    }

    /**
     * Do back step
     * @returns {undefined}
     */
    this.backButtonClick = function() {
        var moreBack = true;
        //reponsive: if groups are not visible
        if (!$(".groupswrapper").is(":visible")) {
            //close contents and show groups
            $("#CONTENTS").css("width", "").css("display", "");
            $("#GROUPS").css("display", "");
            moreBack = showAllContents();
        }
        //else, step back on the stack
        else
            moreBack = goToBack();
        //disable back button if appropiate
        if (!moreBack)
            $("#backButton").trigger("setDisabled");
        return false;
    };

    /*******************************************************************************************************/
    /** Constructor, initializator */
    /*******************************************************************************************************/

    /*BACK BUTTON*/
    $("#backButton")
            //for disabling
            .bind("setDisabled", function()
            {
                $(this).addClass("myDisabled");
                $(this).attr("disabled", "disabled");
            })
            //for enabling
            .bind("setEnabled", function()
            {
                $(this).removeClass("myDisabled");
                $(this).removeAttr("disabled");
            })
            //when click
            .click(that.backButtonClick);
    /*SHOW CONTENTS BUTTON*/
    $("#showTweetsButton").click(showOnlyContents);
}

