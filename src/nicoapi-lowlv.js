(function(window){

var NicoAPI = NicoAPI || {};
NicoAPI	= (function(){
	var xhr = function(){
        var xhr = new XMLHttpRequest();
        return function( method, url, param, callback ){
            xhr.onreadystatechange = function(){
                if ( xhr.readyState === 4 ){
					callback( xhr.responseText );
                }
            };
            xhr.open( method, url+(method==="get" ? "?"+param : ""), true );
            xhr.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded" );
            xhr.send( method==="post" ? param : "" );
        };
    }(),
    
    archetype = function( obj, defParam ){
    	return function( obj ){
			obj = obj || { param:null, callback:function(){} };
			var request = function(){
				xhr( defParam.method, defParam.api, obj.param, function( result ){
					obj.callback( JSON.parse( result ) );
				});
			};
			if ( defParam.token ) {
				var token = this.getToken(function( token ){
					obj.param += "&token=" + token;
					request();
				});
			} else {
				request();
			}
		}.bind(this)
	},
    
	nicow	= "http://www.nicovideo.jp/",
    		    
	url	= {
		def			: nicow + "api/deflist/",
		normal		: nicow + "api/mylist/",
		watchlist	: nicow + "api/watchitem/",
		mylistGroup	: nicow + "api/mylistgroup/",
		getThumbInfo: "http://ext.nicovideo.jp/api/getthumbinfo/",
		getToken	: nicow + "my/mylist"	
	};

	func = {
		// [ request method , url , needs a token ? ]
		mylistGroup : {
			list 	: [ "post", url.mylistGroup + "list",	true ],
			// none
			get 	: [ "post", url.mylistGroup + "copy",	true ],
			// group_id
			add		: [ "post", url.mylistGroup + "add",	true ],
			// name, description, public, default_sort, icon_id
			update	: [ "post", url.mylistGroup + "update",	true ],
			// name, description, public, default_sort, icon_id
			remove	: [ "post", url.mylistGroup + "delete",	true ]
			// group_id
		},
		def : {
			list 	: [ "post", url.def + "list",	true ],
			// none
			add		: [ "post", url.def + "add",	true ],
			// item_type, item_id, description
			update	: [ "post", url.def + "update",	true ],
			// item_type, item_id, description
			remove	: [ "post", url.def + "delete",	true ],
			// id_list
			move 	: [ "post", url.def + "move",	true ],
			// target_group_id, id_list
			copy 	: [ "post", url.def + "copy"]	
			// target_group_id, id_list
		},
		normal	: {
			list 	: [ "post", url.normal + "list",	true ],
			// group_id
			add 	: [ "post", url.normal + "add",	true ],
			// group_id, item_type, item_id, description
			update 	: [ "post", url.normal + "update",	true ],
			// group_id, item_type, item_id, description
			remove 	: [ "post", url.normal + "remove",	true ],
			// group_id, id_list
			move 	: [ "post", url.normal + "get",	true ]
			// group_id, target_group_id, id_list
		},
		watchlist : {
			list 	: [ "post", url.watchlist + "list",	true ],
			add		: [ "post", url.watchlist + "add",	true ],
			exist	: [ "post", url.watchlist + "exist",true ],
			remove	: [ "post", url.watchlist + "delete",true ]
		},
		getThumbInfo: [ "post", url.getThumbInfo,	false]
	};

	// constructor
	function NewNicoAPI () {
		var pt = NewNicoAPI.prototype;
		function recursion( _func, parent ){
			for ( var __func in _func ){
				if ( _func[ __func ] instanceof Array ) {
					parent[ __func ] = archetype.bind(this)(
						{},
						{
							method	: _func[ __func ][0], 
							api		: _func[ __func ][1], 
							token	: _func[ __func ][2]
						}
					);
				} else if ( typeof _func[ __func ] === "object" ) { 
					recursion.bind(this)( _func[ __func ], pt[ __func ]={} );
				}
			}
		}
		recursion.bind(this)( func, pt );
	}

	NewNicoAPI.prototype = (function(){
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

	return NewNicoAPI;
}());

window.HdNicoAPI = new NicoAPI;
console.log( window.HdNicoAPI );
}(window));