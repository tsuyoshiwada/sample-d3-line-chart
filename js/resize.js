// 表示サイズを設定
var margin = {
  top   : 40,
  right : 40,
  bottom: 40,
  left  : 40
};

var size = {
  width : 800,
  height: 400
};


// 元の表示サイズを保持しておく
margin.original = clone(margin);
size.original = clone(size);

// 縦横比率と現在の倍率を保持しておく
size.scale = 1;
size.aspect = size.width / size.height;


// 表示するデータ
var data = [
  {date: "2015-01-01", value:20},
  {date: "2015-02-01", value:70},
  {date: "2015-03-01", value:100},
  {date: "2015-04-01", value:10},
  {date: "2015-05-01", value:69},
  {date: "2015-06-01", value:5},
  {date: "2015-07-01", value:75},
  {date: "2015-08-01", value:80},
  {date: "2015-09-01", value:55},
  {date: "2015-10-01", value:50},
  {date: "2015-11-01", value:32},
  {date: "2015-12-01", value:90}
];


// 時間のフォーマット
var parseDate = d3.time.format("%Y-%m-%d").parse;


// SVG、縦横軸などの設定
var win = d3.select(window);
var svg = d3.select("#chart");
var g = svg.append("g");
var x = d3.time.scale();
var y = d3.scale.linear();

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom")
  .tickFormat(d3.time.format("%m"));

var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");

var line = d3.svg.line()
  .x(function(d){ return x(d.date); })
  .y(function(d){ return y(d.value); });


// 描画
function render(){
  data.forEach(function(d){
    d.date = parseDate(d.date);
    d.value = +d.value;
  });

  x.domain(d3.extent(data, function(d){ return d.date; }));
  y.domain(d3.extent(data, function(d){ return d.value; }));

  g.append("g")
    .attr("class", "x axis");

  g.append("g")
    .attr("class", "y axis")
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".7em")
      .style("text-anchor", "end")
      .text("値の単位");

  g.append("path")
    .attr("class", "line");
}


// グラフサイズの更新
function update(){

  // SVGのサイズを取得
  size.width = parseInt(svg.style("width"));
  size.height = size.width / size.aspect;

  // 現在の倍率を元に余白の量も更新
  // 最小値がそれぞれ30pxになるように調整しておく
  size.scale = size.width / size.original.width;
  margin.top    = Math.max(30, margin.original.top * size.scale);
  margin.right  = Math.max(30, margin.original.right * size.scale);
  margin.bottom = Math.max(30, margin.original.bottom * size.scale);
  margin.left   = Math.max(30, margin.original.left * size.scale);

  // <svg>のサイズを更新
  svg
    .attr("width", size.width)
    .attr("height", size.height);

  // 縦横の最大幅を新しいサイズに合わせる
  x.range([0, size.width - margin.left - margin.right]);
  y.range([size.height - margin.top - margin.bottom, 0]);

  // 中心位置を揃える
  g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // 横軸の位置
  g.selectAll("g.x")
    .attr("transform", "translate(0, " + ( size.height - margin.top - margin.bottom ) + ")")
    .call(xAxis);

  // 縦軸の位置
  g.selectAll("g.y")
    .call(yAxis);

  // 折れ線の位置
  g.selectAll("path.line")
    .datum(data)
    .attr("d", line);
}


// オブジェクトのコピーを作成する簡易ヘルパー
function clone(obj){
  var copy = {};
  for( var attr in obj ){
    if( obj.hasOwnProperty(attr) ) copy[attr] = obj[attr];
  }
  return copy;
}


// 初期化
render();
update();
win.on("resize", update);

