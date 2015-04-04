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

var data = [];


// アニメーション判定フラグ
var isAnimated = false;


// 元の表示サイズを保持しておく
margin.original = clone(margin);
size.original = clone(size);

// 縦横比率と現在の倍率を保持しておく
size.scale = 1;
size.aspect = size.width / size.height;


// SVG、縦横軸などの設定
var win = d3.select(window);
var svg = d3.select("#chart");
var g = svg.append("g");
var x = d3.time.scale();
var y = d3.scale.linear();

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom")
  .tickFormat(d3.time.format("%d"));

var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");

var line = d3.svg.line()
  .x(function(d){ return x(d.date); })
  .y(function(d){ return y(d.value); })
  .interpolate("basis");


// 描画
function render(){
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
      .text("気温");

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
  if( isAnimated ){
    g.selectAll("path.line")
      .datum(data)
      .attr("d", line);
  }
}


// アニメーションを実行
function animate(){

  // アニメーション用のダミーデータ
  var dummy = [];
  data.forEach(function(d, i){
    dummy[i] = clone(d);
    dummy[i].value = 0;
  });

  g.selectAll("path.line")
    .datum(dummy)
    .attr("d", line)
    .transition()
    .delay(500)
    .duration(1000)
    .ease("back-out")
    .attr("d", line(data))
    .each("end", function(){
      isAnimated = true;
      update();
    });
}


// オブジェクトのコピーを作成する簡易ヘルパー
function clone(obj){
  var copy = {};
  for( var key in obj ){
    if( obj.hasOwnProperty(key) ) copy[key] = obj[key];
  }
  return copy;
}


// 東京の2週間分の天気予報をデータとして使用する
// http://openweathermap.org/api
d3.json("http://api.openweathermap.org/data/2.5/forecast/daily?q=Tokyo,jp&mode=json&cnt=14", function(error, results){

  // データ形式を整える
  data = results.list;
  data.forEach(function(d){
    d.date = new Date(d.dt * 1000); //UNIX - Date object
    d.value = Math.round(d.temp.day - 273.15); //平均気温をケルビン係数を摂氏に 
  });

  // 初期化
  render();
  update();
  animate();
  win.on("resize", update);
});