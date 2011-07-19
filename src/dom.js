//jQuery.noConflict();
//var j$ = jQuery;
(function($){

var MylistPage	= function(){
	this.addLMlist();
};
MylistPage.prototype = {

	addLMlist : function(){
	console.log($("#myNavMylist"));
	console.log($("#myNavMylist > *"));
		$("#myNavMylist>dl").append(
			"<dd " +
			"class=\"localMylist\"" + ">" +
					"<a href=\"" +
					"#" +
					"\"" + ">" +
						"local" +
					"</a>" +
			"</dd>"
		);

	}
};


var MoviePage	= function(){
    this.addButton(this);
};
MoviePage.prototype = {

	addButton : function(self){
		var _self	= this,
			img_lMButton = chrome.extension.getURL("localMylistButton.png"),
			j_WATCHHEADER_table_tbody_upperTr_td_div0 = $("#WATCHHEADER>table>tbody>tr:eq(0)>td>div:eq(0)");

		$("#WATCHHEADER > table > tbody > tr:eq(0) > td:eq(0) > div").append(
			"<div" +
			" id=\"localMylist_bookmark\"" +
			" style=\"cursor:pointer;\"" +
			" target=\"_blank\"" + ">" +
				"<img src=\"" + img_lMButton + "\">" +
			"</div>"
		);

		$("#localMylist_bookmark").click(function(){ sendMovieInfo() });

		j_WATCHHEADER_table_tbody_upperTr_td_div0.css({
			height:	j_WATCHHEADER_table_tbody_upperTr_td_div0.height() + 40 
		});
	},

    sendMovieInfo : function(){
    //	self._if.sendMessage(_self.getMovieInfo());
        chrome.extension.sendRequest({video_id: urlString[4]}, function(response) {
            console.log(urlString[4]);
            console.log("response:" + response);

        });
    },

	getMovieInfo : function() {
		var	obj	= { content : {} },
			i,
			h	= $("script"),
			s;
		
	//	console.log($("html").html());
	//	console.log($("script"));
/*
		for (i = 0, l = h.length; i < l; ++i){
			s	= $("script:eq("+i+")").html();
			if ( s.match(/var Video = {/) ) { console.log(i);break; }
		}

		s.match(/v:\s+'[0-9a-z]+/)[0].match(//);

		item_id
		item_type			= 0,
		deleted				= 
		first_retrieve
		group_type
		length_seconds		= s.match(/^\slength:\s+[0-9]+/)[0].match(/[0-9]+/)[0]
		thumbnail_url		= s.match(/^\sthumbnail:\s+\'[^\n^\'^\,]+/)[0].match(/\'[^\n^\']+/)[0].slice(1);
		title
		update_time
//		video_id			= s.match(/v:\s+\'[0-9a-z]+/)[0].match(/[0-9a-z]{3,}/)[0];
		watch_id		
		watch
		poster_description	= s.match(/^\sdescription:\s+\'[^\n]+/)[0].match(/\'[^\n^\']+/)[0].slice(1);		
		last_res_body		= s.match(/^\slength:\s+[0-9]+/)[0].match(/[0-9]+/)[0]			
		mylist_counter		= s.match(/^\smylistCount:\s+[0-9]+/)[0].match(/[0-9]+/)[0]			
		view_counter		= s.match(/^\sviewCount:\s+[0-9]+/)[0].match(/[0-9]+/)[0]			
		num_res				= s.match(/^\slength:\s+[0-9]+/)[0].match(/[0-9]+/)[0]
*/
		obj.content.item_type	= 0;
		obj.content.item_id		= $("input[name='thread_id']").attr("value")-0;
//		obj.tag			= $("meta[name='keywords']").attr("content").split(",");
		obj.content.video_id	= window.location.href.split("/")[4];
		
		obj.message				= 'lmButton_clicked';

		return	obj;
	}
};

var urlString	= window.location.href.split("/"),
    type        = urlString[3];

if (type === "watch"){
	var dom	= new MoviePage();
} else if (type === "my"){
	var dom	= new MylistPage();
};

console.log(type);
console.log(dom);



}($));
