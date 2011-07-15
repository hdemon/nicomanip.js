var hdNice = hdNice || {};
hdNice.Core = (function(){
	function NewCore (){
		this.init();
	}
	
	NewCore.prototype = (function(){
		return {
			// マイリスト一覧とその中の動画リストを取得し、データベースに入れるまでの処理を行う。
			init : function( callback ) {
				/*
				chrome.extension.onConnect.addListener(function(port){
					self.port	= port;
					port.onMessage.addListener(function(msg){
						console.log(msg);
					});
				});*/
				console.log(HdNicoAPI);
//				var	api = new NicoAPI;
			/*
				api.getToken(function( result ){
					console.log( result );
				});	
				*/
				api.mylistGroup.list({
					callback : function( result ){
						console.log( result );
					}
				});

			}
		}
	}());
	
	return NewCore;
}());
