(function(window){

// "JavaScript Patterns" (Stoyan Stefanov) O'Reilly, ISBN 9780596806750
function mix() {
    var arg, prop, child = {};
    for (arg = 0; arg < arguments.length; arg += 1) {
        for (prop in arguments[arg]) {
            if (arguments[arg].hasOwnProperty(prop)) {
                child[prop] = arguments[arg][prop];
            }
        }
    }
    return child;
}

NicoAPI_Interface = (function(){
	function NewNicoAPI_Interface () {}

	NewNicoAPI_Interface.prototype = (function(){
 		return {
			getMylistGroup : function( callback ){
				console.log(this);
			}
		}
	}());

	return NewNicoAPI_Interface;
}());


	function a (){}
	a.protorype = window.HdNicoAPI;

var n = new NicoAPI_Interface;
console.log( n );
var HdNicoAPI = Object.create( window.HdNicoAPI, n );

console.log( HdNicoAPI );
}(window));
