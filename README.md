# nicomanip.js

##概要
　ニコニコ動画APIを操作し、動画／静画情報の取得、抽出、ソート、コピー／移動等を可能にするChrome Extension用ライブラリです。

##基本的な使い方

###準備
manifest.jsonの"permissions"で

"http://www.nicovideo.jp/*" 

"http://ext.nicovideo.jp/*"

への接続を許可した上で、backgroundもしくはcontent script内でnicomanip.jsを読み込み、コンストラクタよりマイリストオブジェクトを作成した後、reloadメソッドで動画情報を読み込んだ上で、各メソッドを実行して下さい。

###具体例
~~~~
// マイリスオブジェクトを作成し、	
var mylist = new MyNico;

// reloadメソッドでマイリス中の全動画情報を読み、
// コールバック内に目的の処理を記述する。	
mylist.reload(function(mylist){

	mylist
		.filter({ // 全マイリスから再生時間5分以上のものを抽出し、
			length_seconds: {
				min : 300
			}
		}) 
		.filter({ // そこからさらに、再生回数1000～2000の動画を抽出
			view_counter : {
				min : 1000,
				max : 2000
			}
		}) 
		.sort({
			condition :	[ // そこからさらに、再生回数を昇順にソートする。
				{
					name : "view_counter",
					ascend : true
				}
			],
			low : 10 // ソートしたものの内、上位10件を抽出する。
		})
		.copy(123456789);　// 抽出したものを、マイリスID:123456789へコピーする。
}
~~~~

##もっと詳しい情報

http://hdemon.github.com/nicomanip.js/index.html

こちらを御覧下さい。