/**
 * jQuery Element for GroupWrapper generator
 * @version 1.0
 * @copyright (c) 2014
 * @author Aarón Rosas (aarr90@gmail.com) - Fco Javier Gijon (fcojaviergijon@gmail.com)
 */
var GroupWrapper = {
    /**
     * Return the element jQuery for the GroupWrapper
     * @returns {jQuery|GroupWrapper.new.wrapper}
     */
    "new": function()
    {

        var wrapper = $("#models .groupwrapper").clone();

        //MOUSE EVENTS (flag as selecting)
        if (!mobile)
            wrapper.mouseover(GroupWrapper.mouserOver).mouseout(GroupWrapper.mouseOut);

        //CLICK
        wrapper.addClass("clickable").click(GroupWrapper.display);

        //DESGRANAR
        wrapper.find(".desgranar").addClass("clickable").click(GroupWrapper.subgroups);

        return wrapper;
    },
    /**
     * Flag the group as selecting
     * @returns {undefined}
     */
    "mouserOver": function()
    {
        if (!$(this).hasClass("groupSelected"))
            $(this).addClass("groupSelecting");
    },
    /**
     * Unflag the group as selecting
     * @returns {undefined}
     */
    "mouseOut": function()
    {
        $(this).removeClass("groupSelecting");
    },
    /**
     * Show the contents of the user in the group
     * @returns false
     */
    "display": function()
    {
        gManager.displayContents(this);
        return false;
    },
    /**
     * Get more groups with the users in the group
     * @returns false
     */
    "subgroups": function()
    {
        var clusterPadre = $(this).parents(".groupwrapper");
        gManager.displaySubgroups(clusterPadre);
        return false;
    }
};