/**
 * Class myDateTime. To handle date/times format in interface
 * @version 1.0
 * @copyright (c) 2014
 * @author Aarón Rosas (aarr90@gmail.com) - Fco Javier Gijon (fcojaviergijon@gmail.com)
 * @returns {myDateTime}
 */
function myDateTime()
{
    //month names
    var meses = [_("Enero"), _("Febrero"), _("Marzo"), _("Abril"), _("Mayo"), _("Junio"), _("Julio"), _("Agosto"), _("Septiembre"), _("Octubre"), _("Noviembre"), _("Diciembre")];

    /**
     * Get the difference in days between two dates
     * @param {Date} date1
     * @param {Date} date2
     * @returns {Int}
     */
    function diffDays(date1, date2)
    {
        var diff = date1.getTime() - date2.getTime();
        return parseInt((diff / (24 * 60 * 60 * 1000)));
    }

    /**
     * Get the difference in hours between two dates
     * @param {Date} date1
     * @param {Date} date2
     * @returns {Int}
     */
    function diffHours(date1, date2)
    {
        var diff = date1.getTime() - date2.getTime();
        return parseInt((diff / (60 * 60 * 1000)));
    }

    /**
     * Get the difference in minutes between two dates
     * @param {Date} date1
     * @param {Date} date2
     * @returns {Int}
     */
    function diffMinutes(date1, date2)
    {
        var diff = date1.getTime() - date2.getTime();
        return parseInt((diff / (60 * 1000)));
    }

    /**
     * Get the difference in seconds between two dates
     * @param {Date} date1
     * @param {Date} date2
     * @returns {Int}
     */
    function diffSeconds(date1, date2)
    {
        var diff = date1.getTime() - date2.getTime();
        return parseInt((diff / (1000)));
    }

    /**
     * Get the String in the format for interface, corresponding to the date
     * @param {Date} date
     * @returns {String}
     */
    this.dateContent = function(date)
    {
        var now = new Date();
        var diffdays = diffDays(now, date);
        if (diffdays < 1)
        {
            var diffhours = diffHours(now, date);
            if (diffhours < 1)
            {
                var diffminutes = diffMinutes(now, date);
                if (diffminutes < 1)
                {
                    var diffseg = diffSeconds(now, date);
                    return _(diffseg + " " + _("s"));
                }
                else
                    return _(diffminutes + " " + _("min"));
            }
            else
                return _(diffhours + " " + _("h"));
        }
        else
            return date.getDate() + " " + meses[date.getMonth()];
    };
}