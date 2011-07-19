# nicomanip.js

##概要
　ニコニコ動画APIを操作し、動画／静画情報の取得、抽出、ソート、コピー／移動等を可能にするChrome Extension用ライブラリです。

##使い方

###準備と基本概念
- manifest.jsonの"permissions"で

"http://www.nicovideo.jp/*" 

"http://ext.nicovideo.jp/*"

への接続を許可する。
- backgroundもしくはcontent script内でnicomanip.jsを読み込む
- MyNicoモジュールよりマイリストオブジェクトを作成
- reloadメソッドで動画情報を読み込む

以上で準備は完了です。以降のアクションは、
+ 抽出フェーズ：   filterとsortをメソッドチェーンでつなげ、目的の動画を抽出する。
+ 操作フェーズ：   抽出されたものに対して、copyやmoveによってマイリスト操作を行う。
という２つのフェーズに分けられます。

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
		.filter({ // さらに、その中から再生回数1000～2000の動画を抽出
			view_counter : {
				min : 1000,
				max : 2000
			}
		}) 
		.sort({
			condition :	[ // 抽出結果を昇順の再生回数でソートし、
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