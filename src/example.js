(function(){

// 使用例

	
// マイリスオブジェクトを作成。	
var mylist = new MyNico;

// APIよりマイリス中の全動画情報を読み込む。
mylist.reload(function(mylist){
	
	console.log(mylist);

	// 動画時間が5分以上のものを抽出。	
	var result = mylist
		.filter({
			length_seconds: {
				min : 300
			}
		})
		.filter({ // 抽出結果から、さらに閲覧数が1000以下のものを抽出。
			view_counter : {
				max : 1000
			}
		});
		
	console.log(result);


	// 閲覧数8000以上10000未満の動画を抽出し、
	var result = mylist
		.filter({
			view_counter : {
				max : 10000,
				min : 8000
			}
		})
		.sort({ // その中から、閲覧数５～１０位の動画のみを抽出する。
			condition : [
				{
					name : "view_counter",
					ascend : true
				}					
			],
			high : 5,
			low : 10
		});

	console.log(result);

	// high lowの両方を省略すると、mylistId、itemId、ソートした値をプロパティに持つオブジェクトを、
	// ソート順に含む配列が得られる。
	var result = mylist
		.filter({
			view_counter : {
				max : 10000,
				min : 8000
			}
		})
		.sort({
			condition : [
				{
					name : "view_counter",
					ascend : true
				}					
			]
		});

	console.log(result);


	var result = mylist
		.sort({ // マイリス中の前動画をタイトル順にソートし、
			condition : [
				{
					name : "title",
					ascend : true
				}					
			],
			low : 10
		}) // 先頭から10個を、任意のマイリストへコピーする。
		//.copy(your mylistId);
		
	console.log(result);


});

}());
