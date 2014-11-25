/**
 * Set the menu elements for Twitter
 * @version 1.0
 * @copyright (c) 2014
 * @author Aarón Rosas (aarr90@gmail.com) - Fco Javier Gijon (fcojaviergijon@gmail.com) * @returns {undefined}
 */
function setMenuTwitter()
{
    //Name, Screen_name and Photo
    $("#userSessionTitle").html(g.getMe().name);
    $("#userScreenNameTitle").html("@" + g.getMe().screen_name);
//    $("#userSessionPhoto").html('<a href="https://twitter.com/' + g.getMe().screen_name + '" target="_blank"><img src="' + g.getMe().picture + '" alt=""/></a>');
    $("#userSessionPhoto").html('<img src="' + g.getMe().picture + '" alt=""/>');
    /*followers count*/
    $("#userFollowersCount").wrapInner('<a href="https://twitter.com/followers" target="_blank"></a>')//link to "followers"
            .show().find(".menuCount").html(g.getMe().followers_count);//show and set count
    //friends count
    $("#userFriendsCount").wrapInner('<a href="https://twitter.com/following" target="_blank"></a>')//link to "friends"
            .show().find(".menuCount").html(g.getMe().friends_count);//show and set count
    //tweetsCount count
    $("#userTweetsCount").wrapInner('<a href="https://twitter.com/' + g.getMe().screen_name + '" target="_blank"></a>')//link to Twitter User Page
            .show().find(".menuCount").html(g.getMe().tweets_count);//show and set count
    //Twitter ico
    $("#socialNetIco").wrapInner('<a href="https://twitter.com/" target="_blank"><img src="images/twitter_logo_h36.png" alt=""/></a>').show();

    //Responsive: toggle #userData/#userCounts when both do not fit 
    $("#userData, #userCounts").click(function()
    {
        var width = $("body").width();
        if (width < 580) //see responsive css, small size, show one
        {
            if (!$("#userCounts").is(":visible")) { //user count not visible?
                $("#userCounts").css("display", "inline-block");
                $("#userData").hide();
            }
            else if (!$("#userData").is(":visible")) { //user data not visible?
                $("#userCounts").hide();
                $("#userData").css("display", "inline-block");
            }
            return false;//not link
        } else //big size, show both
        {
            $("#userData").css("display", "");
            $("#userCounts").css("display", "");
        }
    });

}