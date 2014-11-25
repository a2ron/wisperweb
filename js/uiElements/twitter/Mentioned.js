/**
 * jQuery Element for Mentioned generator
 * @version 1.0
 * @copyright (c) 2014
 * @author Aarón Rosas (aarr90@gmail.com) - Fco Javier Gijon (fcojaviergijon@gmail.com)
 */
var Mentioned = {
    /**
     * Return the element jQuery for the Mentioned
     * @param {type} uMentioned Node with the information of the user mentioned
     * @returns {Mentioned.new.mentioned|jQuery}
     */
    "new": function(uMentioned)
    {
        if (uMentioned === null || uMentioned===undefined)
            return [];
        //following or unfollowing
        var me = g.getMe();
        var title = _("Follow");
        var classFollow = "unfollowing";
        if (g.isEdge(me, uMentioned)) {
            title = _("Unfollow");
            classFollow = "following";
        }

        //apply user attributes 
        var mentioned = $("#models .tweetuserimage").clone();
        mentioned = $(mentioned[0])
                .attr("src", uMentioned.picture)
                .attr("alt", "@" + uMentioned.screen_name)
                .attr("idU", uMentioned.id)
                .attr("title", title + " " + "@" + uMentioned.screen_name)
                .addClass(classFollow);


        //MOUSE EVENTS (title like groupUserImage)
        if (!mobile)
            mentioned.mousemove(GroupUserImage.mouseMove).mouseout(GroupUserImage.mouseOut);

        //FOLLOW / UNFOLLOW
        mentioned.addClass("clickable").click(Mentioned.followUnfollow);
        return mentioned;
    },
    /**
     * Manage the action follow/unfollow for a user mentioned
     * @returns {undefined}
     */
    "followUnfollow": function()
    {
        //params for the action follow/unfollow
        var that = $(this);
        var idU = that.attr("idU");
        var uMentioned = g.getNodes()[idU];
        var following = that.hasClass("following");

        //actions functions
        function follow()
        {
            g.addEdge(g.getMe(), uMentioned);
        }
        function unfollow()
        {
            g.removeEdge(g.getMe(), uMentioned);
        }

        //determinate the action and request to apply according to the user mentioned
        var fOk = follow;
        var fNotOk = unfollow;
        var msgAction = "follow";
        if (following)
        {
            fNotOk = follow;
            fOk = unfollow;
            msgAction = "unfollow";
        }
        var requestURL = "ajax/request.php?op=" + msgAction + "&id=" + idU;

        //asumes OK
        fOk.apply();
        $(".tweetmentions .tweetuserimage[idU='" + idU + "']").replaceWith(Mentioned.new(uMentioned));

        //request to server
        debug(msgAction + " " + idU);
        $.getJSON(requestURL, function(nowFollowing)
        {
            if (nowFollowing !== !following)//Is it Ok the change?
            {
                //not OK, revert the action
                console.error("ERROR: " + msgAction + " " + idU);
                fNotOk.apply();
                $(".tweetmentions .tweetuserimage[idU='" + idU + "']").replaceWith(Mentioned.new(uMentioned));
            }
        });
    }
};