/**
 * jQuery Element for TweetWrapper generator
 * @version 1.0
 * @copyright (c) 2014
 * @author Aarón Rosas (aarr90@gmail.com) - Fco Javier Gijon (fcojaviergijon@gmail.com)
 */
var TweetWrapper = {
    "new": function(tweet)
    {
        /* DEV: Code if We use Tweet Embed Original by Twitter */
        /*var wrapper = new $("<div/>")
         .attr("idT", tweet.id)
         .addClass("tweetwrapper")
         .addClass("tweetwrapperFrame");
         return wrapper.append($(tweet.html));
         */
        /*else (our tweets)*/

        /*Determine the tweet User*/
        var user = g.getNodes()[tweet.user_id];
        if (user === undefined) {
            console.error("Tweet without user");
            return null;
        }
        /*create a wrapper clonning the model*/
        var wrapper = $("#models .tweetwrapper").clone().attr("idT", tweet.id);
        //TWEET CONTENT
        wrapper.find(".tweetcontent div").html(_getPreparedTextTweet(tweet));
        //TWEET CAB (photo, screen_name and name link to Profile Web)
        var linkUser = '<a href="' + "https://twitter.com/" + user.screen_name + '" target="_blank"+>' + dt.dateContent(new Date(tweet.datetime)) + '</a>';
        //screen_name
        wrapper.find(".tweetdataitem.tweetscreenname").html('<a href="' + "https://twitter.com/" + user.screen_name + '" target="_blank"+>@' + user.screen_name + '</a>');
        //name
        wrapper.find(".tweetdataitem.twitterusername").html('<a href="' + "https://twitter.com/" + user.screen_name + '" target="_blank"+>' + user.name + '</a>');
        //photo
        wrapper.find(".tweetcab .tweetuserimage")
                .attr("src", user.picture)
                .attr("alt", user.name)
                .attr("idU", user.id);
        //photo link to Twitter user url 
        wrapper.find(".tweetcab .tweetuserimage").wrapAll('<a href="' + "https://twitter.com/" + user.screen_name + '" target="_blank"+></a>');
        //TWEET DATE (link to the tweet)
        wrapper.find(".tweetdataitem.tweetDate").html('<a href="' + "https://twitter.com/" + user.screen_name + "/statuses/" + tweet.id + '" target="_blank"+>' + dt.dateContent(new Date(tweet.datetime)) + '</a>');
        //MENTIONS
        //Determinate the mentions, pushing ids in the array 
        var idMentions = [];
        if (tweet.mentions !== undefined) //mentions
        {
            for (var idM in tweet.mentions)
                idMentions.push(tweet.mentions[idM].id);
        }
        if (tweet.orig_user_id !== undefined && $.inArray(tweet.orig_user_id, idMentions) === -1)//orig_user
            idMentions.push(tweet.orig_user_id);
        // Find and remove tweet user from mentions (if exists) 
        var i = idMentions.indexOf(tweet.user_id);
        if (i !== -1)
            idMentions.splice(i, 1);
        //Create the Mentions Elements and adding to the tweet wrapper
        for (var i in idMentions)
        {
            var uMention = g.getNodes()[idMentions[i]]; //user mentioned id
            var mentioned = Mentioned.new(uMention); //mention element
            wrapper.find(".tweetmentions").append(mentioned); //append to the tweet wrapper
        }

        /*RETWEET */
        _switchButtonOn(wrapper.find(".retweetButton"), tweet.retweeted);
        wrapper.find(".retweetButton").click(TweetWrapper.retweet);
        /*FAVORITE */
        _switchButtonOn(wrapper.find(".favoriteButton"), tweet.favorited);
        wrapper.find(".favoriteButton").click(TweetWrapper.favorite);
        //REPLY
        wrapper.find(".replyButton").click(TweetWrapper.reply);
        //HOVER EFFECT: photo, screen_name and name
        wrapper.find(".tweetdataitem.tweetscreenname, .tweetcab .tweetuserimage, .tweetdataitem.twitterusername")
                .mouseover(TweetWrapper.overLink)
                .mouseout(TweetWrapper.desOverLink);
        //HOVER EFFECT: reply and retweet action
        wrapper.find(".tweetactionbutton")
                .mouseover(TweetWrapper.actionButtonOver)
                .mouseout(TweetWrapper.actionButtonDesOver);
        //OPEN PHOTO
        wrapper.find(".tweetcontent div").find(".tweetImage").addClass("clickable").click(TweetWrapper.openPhoto);
        //FOLLOW BUTTON
        wrapper.find(".bFollow").attr("href", "https://twitter.com/intent/follow?screen_name=" + user.screen_name);
        /* DEV: Code if We hide the mentionateds */
        //VIEW MENTIONATEDS
        /*if (idMentions.length > 0)
         wrapper.find(".viewMentionateds").click(TweetWrapper.viewMentionateds);
         else
         wrapper.find(".viewMentionateds").remove();*/

        return wrapper;
    },
    /**
     * DEV: Show the mentionateds (if viewMentionateds button display)
     * @returns {Boolean}
     */
    /*
     "viewMentionateds": function()
     {
     var tweetWrapper = $(this).parents(".tweetwrapper");
     tweetWrapper.find(".tweetmentions").fadeIn();
     tweetWrapper.find(".viewMentionateds").hide();
     return false;
     },*/
    /* EVENTS FUNCTIONS */
    /**
     * Open/Close the Tweet Photo. Toggle full/preview size.
     * @returns {undefined}
     */
    "openPhoto": function()
    {
        var div = $(this); //container father wrapper
        var img = div.find("img"); // the img
        if (img.length > 0) {
            var heightImg = img.height(); //container father wrapper size
            var heightDiv = div.height(); // the img size
            if (heightDiv !== heightImg) { //set the full size
                div.attr("oldHeight", heightDiv);
                img.attr("oldMT", img.css("margin-top"));
                div.animate({"height": heightImg});
                img.animate({"margin-top": "0px"});
            }
            else //set the preview size
            {
                div.animate({"height": div.attr("oldHeight")});
                img.animate({"margin-top": img.attr("oldMT")});
            }
        }
    },
    /**
     * HOVER EFFECT: photo, screen_name and name
     * @returns {undefined}
     */
    "overLink": function()
    {
        $(this).parents(".tweetwrapper").find(".tweetdataitem.twitterusername a").addClass("linkHover");
    },
    /**
     * HOVER EFFECT: photo, screen_name and name
     * @returns {undefined}
     */
    "desOverLink": function()
    {
        $(this).parents(".tweetwrapper").find(".tweetdataitem.twitterusername a").removeClass("linkHover");
    },
    /**
     * HOVER EFFECT: tweet action buton
     * @returns {undefined}
     */
    "actionButtonOver": function()
    {
        var img = $(this).find("img");
        var src = img.attr("src");
        if (src.indexOf("_on.png") === -1) {
            var i = src.indexOf(".png");
            var newSrc = src.substring(0, i) + "_hover.png";
            img.attr("src", newSrc);
        }
    },
    /**
     * HOVER EFFECT: tweet action buton
     * @returns {undefined}
     */
    "actionButtonDesOver": function()
    {
        var img = $(this).find("img");
        var src = img.attr("src");
        var i = src.indexOf("_hover.png");
        if (i > -1) {
            var newSrc = src.substring(0, i) + ".png";
            img.attr("src", newSrc);
        }
    },
    /**
     * Do the retweet
     * @returns {Boolean}
     */
    "retweet": function()
    {
        var retweetButton = $(this);
        var retweeted = retweetButton.hasClass("tweetActionDone");
//        if (retweetButton.hasClass("tweetActionDone"))
//            return false; //if the tweet is retweeted, do no more
        //determinate the id tweet
        var tweetWrapper = retweetButton.parents(".tweetwrapper");
        var idT = tweetWrapper.attr("idT");
        debug("Retweet " + idT);
        //asumes OK
        _switchButtonOn(retweetButton, !retweeted);

        //retweet request
        $.getJSON("ajax/request.php?op=retweet&id=" + idT, function(result)
        {
            _switchButtonByResponse(result, retweetButton, "ERROR retweeting(" + !retweeted + ") " + idT);
        });
        return false;
    },
    /**
     * Do the favorite
     * @returns {Boolean}
     */
    "favorite": function()
    {
        var favoriteButton = $(this);
        var favorited = favoriteButton.hasClass("tweetActionDone");
        //determinate the id tweet
        var tweetWrapper = favoriteButton.parents(".tweetwrapper");
        var idT = tweetWrapper.attr("idT");
        debug("Favorite(" + !favorited + ") " + idT);
        var action = "action=";
        //asumes OK
        _switchButtonOn(favoriteButton, !favorited);

        if (!favorited)
            action += "1";
        else
            action += "0";

        //favorite request
        $.getJSON("ajax/request.php?op=favorite&id=" + idT + "&" + action, function(result)
        {
            _switchButtonByResponse(result, favoriteButton, "ERROR favoriting(" + !favorited + ") " + idT);
        });
        return false;
    },
    /**
     * Do the reply
     * @returns {Boolean}
     */
    "reply": function()
    {
        var replyButton = $(this);
        var tweetWrapper = $(this).parents(".tweetwrapper");
        if (replyButton.hasClass("tweetActionDone") || tweetWrapper.find("textarea").length > 0)
            return false; //if the tweet is replied, do no more

        //determinate the id tweet
        var idT = tweetWrapper.attr("idT");
        //get the tweet to reply
        var tweet = g.getContents()[idT];
        //get the tweet user to reply
        var user = g.getNodes()[tweet.user_id];
        //create the textarea to introduce the reply
        var textArea = new $("<textarea/>", {
            "class": "replyText"
        });
        //users mentions
        var mentions = "@" + user.screen_name + " ";
        //if the tweet has any mention, adding the screen_names to default reply
        tweetWrapper.find(".tweetmentions .tweetuserimage").each(function(i, u)
        {
            var mention = g.getNodes()[$(u).attr("idU")];
            mentions += "@" + mention.screen_name + " ";
        });
        //append the textarea to introduce the reply
        textArea.insertAfter(replyButton.parents(".tweetactions"));
        //pushing the default value in reply (mentions)
        textArea.focus().val(mentions);
        //KEYPRESS event to control textarea
        textArea.keypress(function(event) {
            //limit of 140 characters
            if ($(this).val().length > 140)
                $(this).val($(this).val().substr(0, 140));
            //when KEYPRESS===INTRO
            if (event.which === 13) {
                event.preventDefault();
                if ($.trim($(this).val()).length > 0) { //if there is any message
                    //get the status
                    var status = $(this).val();
                    debug("Reply tweet: " + tweet.id);
                    //It asumes ok
                    textArea.attr("disabled", "disabled").addClass("disabled").blur();
                    _tweetActionOn(replyButton);
                    //reply request
                    $.getJSON("ajax/request.php?op=reply&idT=" + tweet.id + "&status=" + status, function(ok)
                    {
                        if (!ok) //error case
                        {
                            console.error("ERROR replying " + tweet.id);
                            //reset (it was asumed ok)
                            textArea.removeAttr("disabled").removeClass("disabled").blur();
                            _tweetActionDesOn(replyButton);
                        }
                    });
                }
            }
        });
        return false;
    }
};
/***************************************************************************************************************/
/* AUXILIAR */
/***************************************************************************************************************/
var dt = new myDateTime();
/**
 * Preprocess the text and set the links(mentioneds, urls, hashtags) and media(imgs)
 * @param {type} tweet
 * @returns {tweet.text prepared}
 */
function _getPreparedTextTweet(tweet)
{
    var text = tweet.text;
    //MENTIONS
    if (tweet.mentions !== undefined)
    {
        for (var idM in tweet.mentions) //foreach mention
        {
            var m = tweet.mentions[idM];
            var sname = "@" + m.screen_name;
//            if (text.toLowerCase().search(sname.toLocaleLowerCase()) > -1) //if text contains the mention screen_name
            {
                //link the mention to Twitter user page
                var link = '<a href="' + "https://twitter.com/" + m.screen_name + '" target="_blank"+>' + sname + '</a>';
                var contentStr = $("<div />").append(link).html();
                text = text.replace(new RegExp(sname, "gi"), contentStr);
            }
        }
    }
    //URLS
    if (tweet.urls !== undefined)
    {
        for (var idURL in tweet.urls)//foreach url
        {
            var url = tweet.urls[idURL];
//            if (text.search(url.url) > -1) //if text contains the url
            {
                //link the url correctly
                var contentStr = '<a target="_blank" href="' + url.expanded_url + '" >' + url.display_url + '</a>';
                text = text.replace(new RegExp(url.url, "g"), contentStr);
            }
        }
    }
    //PHOTOS
    if (tweet.media !== undefined)
    {
        for (var idM in tweet.media)//foreach media
        {
            var media = tweet.media[idM];
            if (media.type === "photo" /*&& text.search(media.url) > -1*/)//if it's a photo
            {
                //replace the url with the img
                var contentStr = '<div class ="tweetImage"><img src="' + media.media_url + '" /></div>';
                text = text.replace(new RegExp(media.url, "g"), contentStr);
            }
        }
    }
    //HASHTAGS
    if (tweet.hashtags !== undefined)
    {
        for (var idH in tweet.hashtags)//foreach media
        {
            var hashtag = tweet.hashtags[idH].text;
            var sHashtag = "#" + hashtag;
//            if (text.search(sHashtag) > -1)//if text contains the hashtag
            {
                //link the hashtag to the Twitter Hashtag page 
                var contentStr = '<a target="_blank" href="https://twitter.com/hashtag/' + hashtag + '" >' + sHashtag + '</a>';
                text = text.replace(new RegExp(sHashtag, "g"), contentStr);
            }
        }
    }

    //return the text prepared
    return text;
}

/**
 * Set a button action ON
 * @param {type} button
 * @returns {undefined}
 */function _tweetActionOn(button)
{
    button.addClass("tweetActionDone");
    /* chage img ico*/
    var img = button.find("img");
    var src = img.attr("src");
    if (src.indexOf("_on.png") === -1) {
        var i = src.indexOf(".png");
        var i2 = src.indexOf("_hover.png");
        if (i2 < i && i2 > -1)
            i = i2;
        var newSrc = src.substring(0, i) + "_on.png";
        img.attr("src", newSrc);
    }
}

/**
 * Set a button action desON
 * @param {type} button
 * @returns {undefined}
 */
function _tweetActionDesOn(button)
{

    button.removeClass("tweetActionDone");
    /* chage img ico*/
    var img = button.find("img");
    var src = img.attr("src");
    var i = src.indexOf("_on.png");
    if (i > -1) {
        var newSrc = src.substring(0, i) + ".png";
        img.attr("src", newSrc);
    }
}

/**
 * Change on/desOn according to status
 * @param {type} button
 * @param {type} status
 * @returns {undefined}
 */
function _switchButtonOn(button, status)
{
    if (status)
        _tweetActionOn(button);
    else
        _tweetActionDesOn(button);

}

/**
 * Change on/desOn according to result (response of ajax request)
 * @param {type} result
 * @param {type} button
 * @param {type} error (if response is error, show the error string in console)
 * @returns {undefined}
 */
function _switchButtonByResponse(result, button, error)
{
    if (result === null || result === "null")//case error
    {
        console.error("ERROR favoriting(" + !favorited + ") " + idT);
        console.error(error);
        _switchButtonOn(button, !button.hasClass("tweetActionDone"));
    }
    else
        _switchButtonOn(button, (result === true || result === "true"));
}