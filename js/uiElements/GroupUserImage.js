/**
 * jQuery Element for GroupUserImage generator
 * @version 1.0
 * @copyright (c) 2014
 * @author Aarón Rosas (aarr90@gmail.com) - Fco Javier Gijon (fcojaviergijon@gmail.com)
 */
var GroupUserImage = {
    /**
     * Return the element jQuery for the GroupWrapper
     * @returns {GroupUserImage.new}
     */
    "new": function(node)
    {
        //apply user attributes 
        var userImage = $("#models .groupuserimage").clone()
                .attr("src", node.picture)
                .attr("alt", node.name)
                .attr("title", node.name)
                .attr("idU", node.id);

        //MOUSE EVENTS (flag as selecting and show title)
        if (!mobile)
            userImage.mousemove(GroupUserImage.mouseMove).mouseout(GroupUserImage.mouseOut);

        //CLICK
        userImage.addClass("clickable").click(GroupUserImage.display);
        return userImage;

    },
    /**
     * Flag the user image as selecting and show title
     * @returns {undefined}
     */
    "mouseMove": function(ev)
    {
        //determinate the title
        var name = "@" + g.getNodes()[$(this).attr("idU")].screen_name;
        var title = $("#userNameTitle");
        title.html(name);
        //set the title position
        var top = ev.pageY - 15;
        var left = ev.pageX - title.width() - 10;
        if (left < 5) {
            top -= 10;
            left = 5;
        }
        title.css({
            "top": top,
            "left": left,
            "display": "block"
        });
        //flag as selecting
        $(this).addClass("userSelecting");
    },
    /**
     * Unflag the user image as selecting and hide title
     * @returns {undefined}
     */
    "mouseOut": function()
    {
        //hide title
        $("#userNameTitle").html("").css({
            "top": 0,
            "left": 0,
            "display": "none"
        });
        //unflag selecting
        $(this).removeClass("userSelecting");
    },
    /**
     * Show the contents of the user
     * @returns false
     */
    "display": function()
    {
        gManager.displayContents(this);
        return false;
    }
};
