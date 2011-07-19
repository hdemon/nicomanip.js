"use strict";
/** 
 * @fileOverview ニコニコ動画が提供するAPIをラッピングし、フィルタリング、ソート、移動／コピー等の簡便な利用を可能にするライブラリです。
 * 
 * @author Masami Yonehara
 * @version 0.1
 *
 *	mylist: Object 						// マイリストオブジェクト
 *		5496960: Object 				// マイリストId
 *			create_time: 	1205048587	// マイリスト作成時（以下全てUNIX時間）
 *			default_sort: 	"0"			// マイリストソート順
 *			description: 	""			// 
 *			icon_id: 		"0"
 *			id: 			"5496960"
 *			name: 			"保管B"
 *			public: 		"0"
 *			sort_order: 	"16"
 *			type: 			"normalList"
 *			update_time: 	1302364463
 *			user_id: 		"5409203"
 *			elements: Object			// アイテムオブジェクト
 *				1192907034: Object		// アイテムID
 *					create_time: 	1216175282		// 動画作成時間
 *					deleted: 		"0"				// 削除済みか否か
 *					description: 	""				// ユーザによる動画説明文
 *					first_retrieve: 1192907034
 *					group_type: 	"default"		//
 *					item_id: 		"1192907034"	// アイテムID
 *					item_type: 		0				// アイテムの種類 動画：0 静画：５
 *					last_res_body: 	"ｗｗｗｗｗｗ アホすぎワロタｗｗｗ エナジーボンボン wwwww... "
 *					length_seconds: "78"			// 動画時間（秒）
 *					mylist_counter: "7"				// マイリスト数
 *					num_res: 		"205"			// コメント数
 *					posting_time: 	1285386290		// 投稿日時
 *					thumbnail_url: "http://tn-skr4.smilevideo.jp/smile?i=1326983"
 *					title: 			"テレポーテーションのやりかた。その2"	// タイトル
 *					update_time: 	1216175282
 *					video_id: 		"sm1326983"		// 動画ID
 *					view_counter: 	"8086"			// 閲覧数
 *					watch: 			0				
 *					watch_id: 		"sm1326983"
 *
 *
 *
 *
 */

(function(window){

var MyNico;
/**
 * マイリスト管理モジュール
 * @constructor
 */
MyNico = (function(){
	
	/**
	 * コンストラクタが、APIに直接アクセスするローレベルメソッドを一括定義するために使うクラス。
 	 * @constructor
 	 * @param {Object} obj
	 * @param {String} obj.param httpリクエストに用いるパラメータ。
	 * @param obj.callback 完了時コールバックのハンドル
	 * @param {Object} defParam そのローレベルメソッドに固有のパラメータで、定数として提供される。
	 * @param {String} defParam.method get / post
	 * @param {String} defParam.api リクエスト先APIのURL 
	 */
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

	/**
	 * ディープコピーを行うメソッド。
	 * @param {Object} parent コピー元オブジェクト
	 * @param {Object} child コピー先オブジェクト
	 */
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

	/**
	 * xmlHttpRequest関数
 	 * @function
 	 * @param {String} method post or get
	 * @param {String} url APIのURL
 	 * @param {String} param APIに渡すパラメータ文字列。
	 * @param {Object} callback レスポンス取得成功時コールバックのハンドル。
	 */
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

	/**
	 * マイリストオブジェクトはマイリストIDを親としているが、この関数はマイリストオブジェクトから、アイテムIDを親とするマイリストIDのリストを作る。
 	 * @param {Object} thisMylist マイリストオブジェクト
	 * @returns {Object} list
	 * @returns {Array} list[itemId] そのアイテムIDを持つアイテムを含むマイリストIDを、配列として持つ。
	 */
	function createItemList(thisMylist){
		var list = [];
		for (var mylistId in thismylist){
			var _mylist = thismylist[mylistId];
			for (var itemId in _mylist.elements){
				if (typeof list[itemId] === "undefined") list[itemId] = [];
				else list[itemId].push( mylistId );
			}
		}
		return list;
	}

	/**
	 * copyとmoveの共通処理を担当するメソッド。
 	 * @param {String} method post or get
	 * @param {Number} mylistId マイリストID
	 * @param {Object} callback レスポンス取得成功時コールバックのハンドル。
	 */
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

	/**
	 * 未実装
	 * @memberOf MyNico.prototype
	 */
	function checkExistence( argsObj, strArray ){
		var param = {};
		strArray.forEach(function(e, i){
			param[e] = (typeof argsObj[e] === "undefined" ? "" : argsObj[e]);
		});
		return param;
	}

	/**
	 * 再帰方式クイックソートメソッド
 	 * @param {Array} array ソート対象
	 * @param {Number} start 左側探索開始位置
	 * @param {Number} end 右側探索開始位置
 	 * @returns {Array} ソート結果
	 */
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

	/**
	 * 再帰方式マージソートメソッド
 	 * @param {Array} array ソート対象
 	 * @returns {Array} ソート結果
	 */
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

	/**
	 * 文字列を文字コードに変換する関数。
	 * @param {String} str 対象文字列
	 * @returns {Number} 全文字列の文字コードを連結した数値
	 */
	function charCode(str){
		var code = "";
		for(var i=0, l=str.length; i<l; i++){
			code += String(str.charCodeAt(i));
		}		
		return code-0;
	}
	
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

	/**
	 * コンストラクタ外で関数定義するための即時関数
	 * 実際はthisのプロトタイプに配置される。
	 * @param self =this in constructor
	 * @returns {Object} メソッド群
	 */
	func2 = (function(self){
		return (
		/** @lends MyNico.prototype **/
		{
			/**
			 * マイリストページに埋め込まれたトークンを取得する
			 * @memberOf MyNico.prototype
			 * @param callback 完了時コールバックのハンドル
			 */
			getToken : function( callback ){
				xhr( "post", url.getToken, "", function( result ){
					callback(
						result
							.match(/NicoAPI\.token.+/)[0]
							.match(/[0-9a-z\-]{8,}/)[0]
					);
				});
			},
				
			/**
			 * 全マイリスト情報と、マイリストに含まれる全動画／静画情報をAPIより取得し、this.mylistへコピーする。
			 * @memberOf MyNico.prototype
			 * @param _callback 完了時コールバックのハンドル
			 */
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

			/**
			 * APIよりマイリスト情報を取得する。とりあえずマイリスと一般マイリスの差を埋めるためのラッパー
			 * @memberOf MyNico.prototype
			 * @param {Number} mylistId 取得するマイリストのID
			 * @param _callback 完了時コールバックのハンドル
			 */
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
			 
			
			/**
			 * 全マイリス・動画情報を取得する。直接にはgetMylistGroupがその役割を担うが、reload内で、マイリストIDを親、itemIDを子とする連想配列に組み直す。			 
			 * @memberOf MyNico.prototype
			 * @param _callback 完了時コールバックのハンドル。コールバック関数には、読み込んだマイリストオブジェクトを第１引数に渡す。
			 */
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
				
			/**
			 * 現在のマイリストオブジェクトから、与えられた条件に該当する要素のみを抽出する。
			 * マイリストオブジェクトの構造およびプロトタイプは変化せず、抽出されたものに対してチェーンメソッドを適用できる。		 
			 * @memberOf MyNico.prototype
 			 * @param {Object} argsObj.* ニコニコ動画APIのパラメータに基づく、フィルタリング対象のプロパティ 
 			 * @param {Number} argsObj.*.max 上記パラメータのフィルタリング上限値 
 			 * @param {Number} argsObj.*.min フィルタリング下限値
 			 * max minは同時に指定可能。
 			 * @example
 			 * var mylist = new MyNico;
 			 * mylist
 			 *   .filter({
			 *     length_seconds: {
			 *       min : 300
			 *     }
			 *   })
 			 *   .filter({
			 *     view_counter: {
			 *       max : 1000
			 *     }
			 *   })
			 *   .copy(123456789);
			 *
			 * 1. 動画時間が5分以上のものを抽出。
			 * 2. 抽出結果から、さらに閲覧数が1000以下のものを抽出。
			 * 3. それをID:123456789のマイリストへコピーする。
			 */	
			filter : function( argsObj ){
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

					for (var param in argsObj){
						counter++;
						if ( // max minを指定された条件の場合、
							argsObj[param].hasOwnProperty('max')
							|| argsObj[param].hasOwnProperty('min')
						){
							argsObj[param].max = argsObj[param].max || 999999999;
							argsObj[param].min = argsObj[param].min || 0;
							if (
								argsObj[param].max > element[param]-0
								&& argsObj[param].min < element[param]-0
							) correspond++;
						// equalな条件の場合。
						} else if (element[param] === argsObj[param]) correspond++;
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

			/**
			 * 重複するアイテムを探し、リストを返す。		 
			 * @memberOf MyNico.prototype
 			 * @param {Number} itemId 重複検索するアイテムID 
			 * @returns {Object} list
			 * @returns {Array} list[itemId] 重複するアイテムを含むマイリストIDを、アイテムIDを親とした配列として返す。
			 */
			findOverlap : function( itemId ){
				var _list = createItemList(this.mylist),
					list = {};

				for (var _itemId in list){
					if (_list[_itemId].length > 1) list[_itemId] = _list[_itemId];
				}
				return list;
			},

			/**
			 * 与えられたプロパティ名に基づくソートを行う。		 
			 * max、minのいずれか、もしくは両方を指定した場合、ソート結果からこれらの条件に従って抽出されたマイリストオブジェクトを返す。
			 * これらのパラメータを指定しない場合、マイリストID、アイテムID、ソート対象の値を要素とするオブジェクトの配列を返す。
			 * @memberOf MyNico.prototype
 			 * @param {Object[]} argsObj.condition ソート条件オブジェクトを格納する配列。添字の小さい条件から適用される。 
 			 * @param {String} argsObj.condition.name ニコニコ動画APIのパラメータに基づく、ソート対象のプロパティ名 
 			 * @param {Boolean} argsObj.condition.ascend 昇順ならばtrue、降順ならばfalse 
 			 * @param {Number} argsObj.max 上記パラメータのフィルタリング上限値 
 			 * @param {Number} argsObj.min フィルタリング下限値
 			 * @returns {Object} max,minの指定を行うことで、MyNico.mylistと同構造のオブジェクトを返し、チェーンメソッドを可能にする。
 			 * @returns {Array} max,minのいずれも設定しない場合、マイリストID、アイテムID、ソート対象の値を要素とするオブジェクトの配列を返す。
 			 * @example
 			 * var mylist = new MyNico;
 			 * mylist
 			 *   .sort({
			 *     condition : [
			 *       {
			 *         name : "view_counter",
			 *         ascend : true
			 *       }					
			 *     ],
			 *     min : 10
			 *   })
			 *   .copy(123456789);
			 *
			 * 全動画／静画の内、閲覧数トップ10のみを含むオブジェクトを返し、
			 *     それをID:123456789のマイリストへコピーする。
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

			/**
			 * APIに渡す"id_list"形式のパラメータを作る。APIが、コピー／移動先となるマイリストIDを１つずつしか受け付けないため、
			 * マイリストID毎に分割する処理を行う。また、とりあえずマイリストとの分離、文字列の長さを一定間隔に分割する等の
			 * 処理も行う。		 
			 * @memberOf MyNico.prototype
			 * @returns {String[]} list "id_list"形式の文字列を含む配列。序列はマイリストIDとアイテムIDの若さに従う。
			 */
			createIdList : function(){
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

			/**
			 * 与えられたマイリストオブジェクトに含まれるアイテムを、指定されたマイリストへコピーするメソッド。
			 * チェーンメソッド形式で、filter、sortと組み合わせることが可能。		 
			 * @memberOf MyNico.prototype
			 * @param {Number} mylistId コピー先のマイリストID
			 * @param callback 完了時コールバックのハンドル 
			 */
			copy : function( mylistId, callback ){
				manipulate.bind(this)( "copy", mylistId, callback );
			},

			/**
			 * 与えられたマイリストオブジェクトに含まれるアイテムを、指定されたマイリストへ移動するメソッド。
			 * チェーンメソッド形式で、filter、sortと組み合わせることが可能。		 
			 * @memberOf MyNico.prototype
			 * @param {Number} mylistId 移動先のマイリストID
			 * @param callback 完了時コールバックのハンドル 
			 */
			move : function( mylistId, callback ){
				manipulate.bind(this)( "move", mylistId, callback );
			},

			/**
			 * 未実装
			 * マイリストを新規に追加するメソッド。 	 
			 * @memberOf MyNico.prototype
			 */
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
				
			/**
			 * 未実装
			 * バックアップ用メソッド。マイリストオブジェクトをJSON化し、File APIを使って間接的にダウンロード可能にする。
			 * @memberOf MyNico.prototype
			 */
			exportJSON : function(){
				JSON.stringify(this.mylist);
			}
		})
	});

	/**
	 * モジュールパターンの内部コンストラクタ。こちらが実質的な処理を行う。
	 * @constructor 
	 */
	function NewNicoAPI () {
		/** 
		 * @memberOf MyNico
		 * @type {Object} mylist マイリストオブジェクト 
		 */
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

window.MyNico = MyNico;

}(window));