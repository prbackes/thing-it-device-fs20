/**
 * Created by backes on 1/4/16.
 */

// my house code
var val = "F51D";

console.info(val + "-->" + hex2elv(val));

// the main group and sub group of my test plug
val = "B0";

console.info(val + "-->" + hex2elv(val));

// switch off command
val = "00";

console.info(val + "-->" + hex2elv(val));

// switch on command
val = "11";

console.info(val + "-->" + hex2elv(val));

// elv2hex() by Uwe Langhammer
function elv2hex(val) {
    var i = 0;
    var ret = '';
    while (i < val.length) {
        var ch = val.substr(i, 1);
        if (ch != ' ') {
            var cl = val.substr(i + 1, 1);
            if (!(ch > 0 && ch < 5)) {
                return false;
            }
            if (cl == '') {
                cl = 1;
            }
            if (!(cl > 0 && cl < 5)) {
                return false;
            }
            ch -= 1;
            cl -= 1;
            var r = (ch << 2) + cl;
            ret += r.toString(16).toUpperCase();
            i += 2;
        } else i += 1;
    }
    return ret;
}

// hex2elv() by Uwe Langhammer
function hex2elv(val) {
    var i = 0;
    var ret = '';
    while (i < val.length) {
        var h = val.substr(i, 1);
        var d = parseInt(h, 16);
        if (d >= 0 && d <= 15) {
            var cl = d & 3;
            var ch = d >> 2;
            cl++;
            ch++;
            if (i && (i % 2 == 0)) ret += ' ';
            ret += ch.toString() + cl.toString();
        } else {
            return false;
        }
        i++;
    }
    return ret;
}
