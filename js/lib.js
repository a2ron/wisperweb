/**
 * General functions LIB  
 * @version 1.0
 * @copyright (c) 2014
 * @author Aarón Rosas (aarr90@gmail.com) - Fco Javier Gijon (fcojaviergijon@gmail.com)
 */

//for translate
function _(string)
{
    return string;
}
//for debug
var showDebug = false;
function debug(msg)
{
    if (showDebug)
        console.log(msg);
}

//for mobile support
var mobile = (navigator.userAgent.toLowerCase().search(/iphone|ipod|ipad|android/) > -1 );