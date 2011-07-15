(function(){

// "JavaScript Patterns" (Stoyan Stefanov) O'Reilly, ISBN 9780596806750
function extendDeep(parent, child) {
    var i,
        toStr = Object.prototype.toString,
        astr = "[object Array]";
    child = child || {};
    for (i in parent) {
        if (parent.hasOwnProperty(i)) {
            if (typeof parent[i] === "object") {
                child[i] = (toStr.call(parent[i]) === astr) ? [] : {};
                extendDeep(parent[i], child[i]);
            } else {
                child[i] = parent[i];
            }
        }
    }
    return child;
}

NicoAPI_Interface = (function(){
	function NicoAPI_Interface (){}

	NicoAPI_Interface.prototype = (function(){
 		return {
			getToken : function( callback ){
				xhr( "post", url.getToken, "", function( result ){
					callback(
						result
							.match(/NicoAPI\.token.+/)[0]
							.match(/[0-9a-z\-]{8,}/)[0]
					);
				});
			}
		}
	}());

	return NicoAPI_Interface;
}());

}());