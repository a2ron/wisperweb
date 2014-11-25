<?php
session_start();
//ACTIONS GET/POST
//close request
if (isset($_GET['cerrar'])) {
    session_destroy();
    unset($_SESSION);
}
//num max of tweets to treat
if (!isset($_GET['max']))
    $_GET['max'] = 200;

//clear session if applicable
if (empty($_SESSION['access_token']) || empty($_SESSION['access_token']['oauth_token']) || empty($_SESSION['access_token']['oauth_token_secret'])) {
    header('Location: ./clearsessions.php');
}
?>
<html lang="es" xml:lang="es">
    <head>

        <meta charset="utf-8">
        <meta name="description" content="Detección de Comunidades en Redes Sociales">
        <meta name="keywords" content="clustering,redes sociales,deteccion de comunidades,modularidad,red social,twitter">
        <meta name="author" content="Aarón Rosas Rodríguez">
        <meta name="author" content="Francisco Javier Gijón Moleón">
        <meta name="dcterms.audience" content="Global" />
        <meta name="Robots" content="all"/>

        <title>Wisper</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no"/>

        <link rel="shortcut icon" type="image/x-icon" href="images/wisperico.png">
        <link rel="apple-touch-icon-precomposed" href="images/wisperiPhone.png" />

        <?php // estilo de la plantilla NOTE: si se quita se rompe el CSS, habria que ver que se usa y llevarlo a nuestro CSS ?>
        <!-- estilo de la plantilla -->
        <link rel="stylesheet" type="text/css" href="css/normalize.css">
        <link rel="stylesheet" type="text/css" href="css/webflow.css">
        <link rel="stylesheet" type="text/css" href="css/magnetic1405697790284.webflow.css">
        <!-- fin estilo de la plantilla -->

        <!-- css interface -->
        <link rel="stylesheet" type="text/css" href="css/index.css">
        <link rel="stylesheet" type="text/css" href="css/index_responsive.css">
        <!-- FIN: css interface -->

        <?php // IF TWEET EMBED <script src=\"//platform.twitter.com/widgets.js\" charset=\"utf-8\"></script> ?>

        <!-- jQuery -->
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>

        <!-- jQuery UI -->
        <link rel="stylesheet" href="//code.jquery.com/ui/1.11.1/themes/smoothness/jquery-ui.css">
        <script src="//code.jquery.com/ui/1.11.1/jquery-ui.js"></script>

        <!-- JS INTERFACE -->
        <script src="js/lib.js"></script>
        <script src="js/DateTimes.js"></script>

        <script src="js/controller/Graph.js"></script>
        <script src="js/controller/Clusterizator.js"></script>
        <script src="js/controller/GroupsManager.js"></script>

        <script src="js/uiElements/GroupUserImage.js"></script>
        <script src="js/uiElements/GroupWrapper.js"></script>

        <script src="js/uiElements/twitter/Mentioned.js"></script>
        <script src="js/uiElements/twitter/TweetWrapper.js"></script>
        <script src="js/uiElements/twitter/menuTwitter.js"></script>

        <script src="js/Interface.js"></script>
        <!--END: JS INTERFACE -->

    </head>
    <body>
        <?php include_once("analyticstracking.php") //for google analitycs?>

        <div id="userNameTitle"></div>
        <div id="progressbar"></div>

        <div id="loading">
            <img src="images/ajax-loader.gif" alt="" />
        </div>

        <p style='display:none' class='error'>Twitter ha bloqueado sus peticiones momentaneamente, por favor inténtelo mas tarde. <a href="?cerrar"><?php echo "Cerrar Sesión" ?></a></p>

        <div id="menu">
            <div id="menuRight">

                <div id="userData">
                    <div class="menuButton">
                        <div id="userSessionTitle"></div>
                        <div id="userScreenNameTitle"></div>
                    </div>
                    <div class="menuButton" id="userSessionPhoto"></div>

                    <div class="menuButton menuButtonIco" id="socialNetIco" style="display:none">
                    </div>
                </div>

                <div id="userCounts">
                    <div class="menuButton count" id="userFollowersCount" style="display:none">
                        <div class="menuTitleCount"><?php echo _("Seguidores") ?></div>
                        <div class="menuCount"></div>
                    </div>
                    <div class="menuButton count" id="userFriendsCount" style="display:none">
                        <div class="menuTitleCount"><?php echo _("Siguiendo") ?></div>
                        <div class="menuCount" ></div>
                    </div>
                    <div class="menuButton count" id="userTweetsCount" style="display:none">
                        <div class="menuTitleCount"><?php echo _("Tweets") ?></div>
                        <div class="menuCount"></div>
                    </div>
                </div>

                <input type="image" id="closeButton" class="menuButton menuButtonIco" src="images/cerrar.png" alt="<?php echo _("Cerrar") ?>" title="<?php echo _("Cerrar") ?>" >
            </div>
            <div id="menuLeft">
                <input type="image" id="backButton" class="menuButton menuButtonIco myDisabled" src="images/back.png" alt="<?php echo _("Atrás") ?>" title="<?php echo _("Atrás") ?>" >
                <input type="image" id="reloadButton"class="menuButton menuButtonIco" src="images/reload.png" alt="<?php echo _("Refrescar") ?>" title="<?php echo _("Refrescar") ?>" >
                <input type="image" id="showTweetsButton"class="menuButton menuButtonIco" src="images/eye.png" alt="<?php echo _("Ver todos los Tweets") ?>" title="<?php echo _("Ver todos los Tweets") ?>" >
            </div>
        </div>
        <div id="body">
            <input type="hidden" id="max" name="max" value="<?php echo $_GET['max']; ?>" />
            <div class="w-row">
                <div class="w-col w-col-6 w-col-small-6" id="GROUPS">
                    <div class="w-container columncontainer">
                        <div class="groupswrapper" id="groupswrapper">
                        </div>
                    </div>
                </div>
                <div class="w-col w-col-6 w-col-small-6 " id="CONTENTS">
                    <div class="w-container columncontainer">
                        <div class="tweetswrapper" id="tweetswrapper">
                        </div>
                    </div>
                </div>
            </div>

            <!--<script type="text/javascript" src="js/webflow.js"></script>-->
            <!--[if lte IE 9]><script src="https://cdnjs.cloudflare.com/ajax/libs/placeholders/3.0.2/placeholders.min.js"></script><![endif]-->
        </div>
    </body>
    <div id="models" style="display:none;">
        <div class="tweetwrapper">
            <div class="w-clearfix tweetcab">
                <img class="tweetuserimage" src="images/transparent.png" alt="<?php echo _("Usuario") ?>">
                <div class="tweetdata">
                    <a class="bFollow underline" target="_blank" href="#"><span>Follow</span></a>
                    <div class="tweetdataitem twitterusername"></div>
                    <div class="tweetdataitem tweetscreenname"></div>
                    <div class="tweetdataitem tweetDate underline"></div>
                </div>
            </div>
            <div class="tweetcontent">
                <div></div> 
            </div>
            <div class="tweetmentions">
            </div>
            <div class="tweetactions">
                <a class="tweetactionbutton retweetButton underline" title="<?php echo _("Retwittear") ?>" href="#" target="_blank"><img src="images/retweet.png" alt=""/> <?php echo _("Retwittear") ?></a>
                <a class="tweetactionbutton replyButton underline" title="<?php echo _("Responder") ?>" href="#" target="_blank"><img src="images/reply.png" alt=""/> <?php echo _("Responder") ?></a>
                <a class="tweetactionbutton favoriteButton underline" title="<?php echo _("Favorito") ?>" href="#" target="_blank"><img src="images/favorite.png" alt=""/> <?php echo _("Favorito") ?></a>
                <!--<input type="image" class="btn tweetactionbutton viewMentionateds" src="images/people.png" title="<?php echo _("Usuarios en este Tweet") ?>" alt="<?php echo _("Usuarios") ?>" />-->
            </div>
        </div>
        <div class="groupwrapper">
            <div class="groupUsers">
            </div>
            <div class="groupactions">
                <input type="image" class="btn tweetactionbutton desgranar" src="images/people.png" title="<?php echo _("Más grupos") ?>" alt="<?php echo _("Más grupos") ?>" />
            </div>
        </div>
        <img class="groupuserimage" src="images/transparent.png" alt="<?php echo _("Usuario") ?>">
        <img class="tweetuserimage" idU="0" src="images/transparent.png"  alt="<?php echo _("Usuario") ?>">
        <input type="button" value="<?php echo _("Unfollow"); ?>" class="followButton" />
        <!-- preloading images -->
        <img src="images/retweet_on.png" alt=""/> 
        <img src="images/retweet_hover.png" alt=""/> 
        <img src="images/favorite_on.png" alt=""/> 
        <img src="images/favorite_hover.png" alt=""/> 
        <img src="images/reply_on.png" alt=""/> 
    </div>

</html>