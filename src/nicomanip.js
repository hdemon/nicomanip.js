(function(window){
"use strict";

window.MyNico = (function(){
	function archetype ( obj, defParam ){
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
	}

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

	// private
	var nicow	= "http://www.nicovideo.jp/",
	url	= {
		def			: nicow + "api/deflist/",
		normal		: nicow + "api/mylist/",
		watchList	: nicow + "api/watchitem/",
		mylistGroup	: nicow + "api/mylistgroup/",
		getThumbInfo: "http://ext.nicovideo.jp/api/getthumbinfo/",
		getToken	: nicow + "my/mylist"
	},
	URLmax = 1000;

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
    }();

	function createItemList(){
		var list = [];
		for (var mylistId in this.mylist){
			var _mylist = this.mylist[mylistId];
			for (var itemId in _mylist.elements){
				if (typeof list[itemId] === "undefined") list[itemId] = [];
				else list[itemId].push( mylistId );
			}
		}
		return list;
	}

	function manipulate( method, mylistId, callback ){
		var idList = this.createIdList();

		idList.forEach(function(e, i){
			idList[i].str = "target_group_id=" + mylistId + idList[i].str;
			this[idList[i].type]
				[method]({
					param 	: idList[i].str,
					callback: callback
				});
		}.bind(this));

		idList = null;
	}

	function checkExistence( argsObj, strArray ){
		var param = {};
		strArray.forEach(function(e, i){
			param[e] = (typeof argsObj[e] === "undefined" ? "" : argsObj[e]);
		});
		return param;
	}

	function quickSort(array, start, end){
		var start = ( typeof start === "undefined" ? 0 : start),
			end = ( typeof end === "undefined" ? array.length - 1 : end),
			p, tmp,
			L, R;

		p = array[ Math.floor((end + start) / 2)  ];
		L = start;
		R = end;
		while (true){
			while ( array[L] < p ) { L++; }
			while ( array[R] > p ) { R--; }
			if ( L >= R ) break;
			tmp = array[L];
			array[L] = array[R];
			array[R] = tmp;
			L++;
			R--;
		}
		if (start < L-1) quickSort(array, start, L-1);
		if (R+1 < end) quickSort(array, R+1, end);

		return array;
	}

	function mergeSort(array){
	    //
	    if( array.length <= 1 ) return;

	    // division phase
	    var leftSize	= Math.floor(array.length / 2),
			rightSize	= array.length - leftSize,
		 	left		= array.slice(0, leftSize),
		 	right		= array.slice(leftSize);

	    // recursion phase
	    mergeSort( left );
	    mergeSort( right );

	    // merge phase
	    var L = 0,
	 		R = 0;
	 	
	    while(
	        ( L  < leftSize  ) ||
	        ( R < rightSize )
		){
	        if( rightSize <= R ){
	            array[L + R] = left[L];
	            ++L;
	        } else if( leftSize <= L ){
	            array[L + R] = right[R];
	            ++R;
	        } else if( left[L].value > right[R].value ){
	            array[L + R] = right[R];
	            ++R;
	        } else {
	            array[L + R] = left[L];
	            ++L;
	        }
	    }
	    return array;
	}

	function charCode(str){
		var code = "";
		for(var i=0, l=str.length; i<l; i++){
			code += String(str.charCodeAt(i));
		}		
		return code-0;
	}
	
	// public
	var func = {
		// [ request method , url , needs a token?, paramator ]
		mylistGroup : {
			list 	: [ "post", url.mylistGroup + "list",	false ],
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
		defList : {
			list 	: [ "post", url.def + "list",	false ],
			// none
			add		: [ "post", url.def + "add",	true ],
			// item_type, item_id, description
			update	: [ "post", url.def + "update",	true ],
			// item_type, item_id, description
			remove	: [ "post", url.def + "delete",	true ],
			// id_list
			move 	: [ "post", url.def + "move",	true ],
			// target_group_id, id_list
			copy 	: [ "post", url.def + "copy",	true ]
			// target_group_id, id_list
		},
		normalList	: {
			list 	: [ "post", url.normal + "list",	false ],
			// group_id
			add 	: [ "post", url.normal + "add",		true ],
			// group_id, item_type, item_id, description
			update 	: [ "post", url.normal + "update",	true ],
			// group_id, item_type, item_id, description
			remove 	: [ "post", url.normal + "remove",	true ],
			// group_id, id_list
			move 	: [ "post", url.normal + "get",		true ],
			// group_id, target_group_id, id_list
			copy 	: [ "post", url.def + "copy",		true ]
			// group_id, target_group_id, id_list
		},
		watchList : {
			list 	: [ "post", url.watchList + "list",	true ],
			add		: [ "post", url.watchList + "add",	true ],
			exist	: [ "post", url.watchList + "exist",true ],
			remove	: [ "post", url.watchList + "delete",true ]
		},
		getThumbInfo: [ "post", url.getThumbInfo,	false]
	},

	func2 = (function(self){
		return {
			// ローレベルメソッド
			getToken : function( callback ){
				xhr( "post", url.getToken, "", function( result ){
					callback(
						result
							.match(/NicoAPI\.token.+/)[0]
							.match(/[0-9a-z\-]{8,}/)[0]
					);
				});
			},

			getMylistGroup : function( _callback ) {
				self.mylistGroup.list({
					callback : function( result ){
						this.mylist.defList = {};
						result.mylistgroup.forEach(function(e, i){
							this.mylist[e.id] = {};
							extendDeep(e, this.mylist[e.id]);
						}.bind(this));
						_callback();
					}.bind(this)
				});
			},

			getMylist : function( mylistId, _callback ) {
				var type = (mylistId!=="defList"?"normalList":"defList");
				self[type].list({
					param : "group_id=" + mylistId, 	// group_id
					callback : function( result ){
						var element = {};
						result.mylistitem.forEach(function(e, i){
							element[e.item_id] = {};
							extendDeep(e, element[e.item_id]);
						});
						_callback( element, mylistId, type );
					}
				});
			},

			// ラッパーメソッド
			// 全マイリス／動画／静画情報を非同期に読みなおす。
			// マイリス数+1のリクエストを行うので、利用には注意。
			reload : function( _callback ) {
				this.getMylistGroup(function(){
					var length = 0,
						counter = 0,
						array = [];

					for (var id in this.mylist){
						array[counter] = id;
						counter++;
					}
					
					length = counter;
					counter = 0;

					function recursion (){
						this.getMylist(array[counter], function( result, mylistId, type ){
							for (var _id in result){
								// item_dataの上の階層にあるupdate_timeと名前がかぶる（しかし意味は違う）ので、
								// あらかじめそれだけ上の階層に移動させておく。
								var _result = result[_id];
								_result.posting_time = _result.item_data.update_time;
								delete _result.item_data.update_time;
								extendDeep(_result.item_data, _result);
								delete _result.item_data;
							}

							var mylist = this.mylist[mylistId];
							mylist.elements = {};
							mylist.type = type;
							extendDeep(result, mylist.elements);
							counter++;

							if (counter === length) _callback(this);
							else recursion.bind(this)();
						}.bind(this));
					}
					recursion.bind(this)();
				}.bind(this));
			},

			// 与えられた条件に該当するアイテムが属するマイリストIDを返す。
			// 条件はオブジェクトの型で与える。
			filter : function( condObj, callback ){
				var result = {};

				for (var mylistId in this.mylist){
					var _mylist = this.mylist[mylistId];
					for (var itemId in _mylist.elements){
						search.bind(this)( mylistId, _mylist.elements[itemId] );
					}
				}

				function search(mylistId, element){
					var counter = 0,
						correspond = 0;

					for (var param in condObj){
						counter++;
						if ( // max minを指定された条件の場合、
							condObj[param].hasOwnProperty('max')
							|| condObj[param].hasOwnProperty('min')
						){
							condObj[param].max = condObj[param].max || 999999999;
							condObj[param].min = condObj[param].min || 0;
							if (
								condObj[param].max > element[param]-0
								&& condObj[param].min < element[param]-0
							) correspond++;
						// equalな条件の場合。
						} else if (element[param] === condObj[param]) correspond++;
					}

					if (counter === correspond){
						var mylist = result[mylistId];
						if (typeof result[mylistId] === "undefined"){
							// 既存マイリス情報から、elementsを除いたものを複製。
							result[mylistId] = {};
							var mylist = result[mylistId];
							extendDeep(this.mylist[mylistId], mylist);
							delete mylist.elements;
							mylist.elements = {};
						}
						if (typeof mylist.elements[element.item_id] === "undefined"){
							mylist.elements[element.item_id] = {};
						}
						extendDeep(element, mylist.elements[element.item_id]);
					}
				}

				// this.mylistをプロトタイプ込みで複製し、該当結果のみを代入。
				var duplication = Object.create(Object.getPrototypeOf(this));
				duplication.mylist = {};
				extendDeep(result, duplication.mylist);

				return duplication;
			},

			findOverlap : function( itemId ){
				var mylist = new MyNico;
				var _list = createItemList.bind(this)(),
					list = {};

				for (var _itemId in list){
					if (_list[_itemId].length > 1) list[_itemId] = _list[_itemId];
				}
				return list;
			},

			/*
			argsObj = {
				condition : [
					{
						name	: "",
						ascend	: boolean
					}, 
					...
				],
				max : ,
				min : 
			}
			*/
			
			sort : function( argsObj ){
				var array = [];
				argsObj.condition.forEach(function(e, i){
					var counter = 0;
					for (var mylistId in this.mylist){
						var mylist = this.mylist[mylistId];
						for (var itemId in mylist.elements){
							if (typeof array[counter] === "undefined") array[counter] = {};
							var el = mylist.elements[itemId];
							array[counter].value	= (
								typeof el === "String"
									? charCode(el[e.name])
									: el[e.name]
							);
							array[counter].itemId	= array[counter].itemId || itemId;
							array[counter].mylistId	= array[counter].mylistId || mylistId;
							counter++;
						}
					}
					mergeSort( array );
					if (!e.ascend) array.reverse();
				}.bind(this));
				
				if (
					typeof argsObj.high === "undefined" &&
					typeof argsObj.low === "undefined" 
				){
					return array;
				} else {
					var mylist = {},
						high = argsObj.high || 0,
						low = (typeof argsObj.low === "undefined" ? array.length : argsObj.low );
					for (var i=high; i<low; i++){
						var e = array[i],
							o = this.mylist[e.mylistId];							
						
						if (typeof mylist[e.mylistId] === "undefined") {
							mylist[e.mylistId] = {};
							var d = mylist[e.mylistId];
							extendDeep(o, d);
							delete d.elements;
							d.elements = {};
						}
						var d = mylist[e.mylistId];
						d.elements[e.itemId] = {};
						extendDeep(o.elements[e.itemId], d.elements[e.itemId]);
					}
					var duplication = Object.create(Object.getPrototypeOf(this));
					duplication.mylist = {};
					extendDeep(mylist, duplication.mylist);
					return duplication;
				}
			},

			// manipulating method
			// for movie & seiga element
			createIdList : function(method){
				/*	1.mylistオブジェクトに含まれる全要素の個別リストを作成
					2.マイリストIDと、とりあえずマイリストとそれ以外を分けて、連結リストを作る。
					3.URLが一定の長さを超えた場合も分割する。				*/

				var _list	= {},
					list	= [],
					counter = 0,
					num		= 0;

				for (var mylistId in this.mylist){
					var mylist = this.mylist[mylistId];
					_list[mylistId] = _list[mylistId] || [];

					for (var itemId in mylist.elements){
						_list[mylistId]
							.push(
								"&id_list[" +
								mylist.elements[itemId].item_type +
								"][]=" +
								itemId
							);
					}
				}

				function concrete(_list, mylistId){
					var thisMylist = this.mylist[mylistId];
					if (thisMylist.type === "defList"){
						list[num] = { str : "" };
					} else if (thisMylist.type === "normalList") {
						list[num] = { str : "&group_id=" };
					}
					list[num].type = thisMylist.type;

					// １つのリストが20~25Bなので、それに合わせてリスト連結数を決める。
					// 上限数に達したら、リストのカウントを１つ上げて続きを連結。
					for (var i=0, max = URLmax/20; i<max; i++){
						list[num].str += _list[mylistId].shift();
						if (_list[mylistId].length <= 0) {
							list[num].type = thisMylist.type;
							return;
						}
					}
					num++;
					concrete.bind(this)(_list, mylistId);
				}

				for (var mylistId in _list){
					concrete.bind(this)(_list, mylistId);
					num++;
				}

				return list;
			},

			copy : function( mylistId, callback ){
				manipulate.bind(this)( "copy", mylistId, callback );
			},

			move : function( mylistId, callback ){
				manipulate.bind(this)( "move", mylistId, callback );
			},

			// for mylist
			addMylist : function( argsObj, callback ){
				var p = checkExistence( argsObj, [
					"name", "description", "is_public",
					"default_sort", "icon_id"
				]);

				var param = (
					"&name="		+ p.name +
					"&description="	+ p.description +
					"&public="		+ p.is_public +
					"&default_sort="+ p.default_sort +
					"&icon_id="		+ p.icon_id
				);

				this.mylistGroup.add( param, callback );
			},

			exportJSON : function(){
				JSON.stringify(this.mylist);
			}
		}
	});

	// constructor
	function NewNicoAPI () {
		this.mylist = {};
		var pt = NewNicoAPI.prototype;

		// マイリスト等を直接操作するローレベルメソッドのうち、定型的なものをまとめて定義
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

		// その他ラッパーメソッド等を定義
		var _f = func2(this);
		for (var n in _f){
			pt[ n ] = _f[ n ];
		}
	}

	return NewNicoAPI;
}());

}(window));