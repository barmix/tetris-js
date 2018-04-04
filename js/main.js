//Глобальные переменные
var cols = 10, rows = 20; //Размеры стакана
var mainCanvas, nextCanvas; //Идентификаторы стакана и следующей фигуры html5
var fTbl, nTbl; //Идентификаторы стакана и следующей фигуры non-html5
var fieldArr = []; //Стакан
var fieldFull; //Конец игры
var interval; //id для игрового цикла
var thisShape; //Текущая фигура
var nextShape; //Следующая фигура
var shpX, shpY; //Позиция текущей фигуры
var lines = 0; //Убрано линий
var count = 0; //Счёт
var maxCount = 0; //Рекорд
var shapes = [ //Массив фигур
 [1,1,1,1], //I
 [2,2,2,0, //J
  0,0,2],
 [3,3,3,0, //L
  3],
 [4,4,0,0, //Z
  0,4,4],
 [0,5,5,0, //S
  5,5],
 [0,6,0,0, //T
  6,6,6 ],
 [7,7,0,0, //O
  7,7]

];
var colors = [ //Массив цветов
 'blue', 'yellow', 'orange', 'cyan', 'purple', 'red', 'lime',
];
var html5=typeof document.createElement('canvas').getContext === "function";//Если может создать такой элемент, то есть поддержка html5
//чтобы проверить работу в табличном варианте, замените в строке выше = на =!
function get(id){return document.getElementById(id)}//Просто get
function createField() {//Добавляем на страницу игровое поле и окно для следующей фигуры
 if(html5){
  get('main').innerHTML='<canvas id="maincanvas" width="300" height="600"></canvas>';
  get('next').innerHTML='<canvas id="nextcanvas" width="120" height="120"></canvas>';
  mainCanvas = get('maincanvas');
  nextCanvas = get('nextcanvas');
  get('header').innerHTML = get('header').innerHTML + ' on canvas <br> HTML5 supported';
 }else{
  get("main").innerHTML=["<table id=\"field\">","</table>"].join(new Array(rows+1).join(["<tr>", "</tr>"].join(new Array(cols+1).join("<td>&nbsp;</td>"))));
  get("next").innerHTML=["<table id=\"nextshape\">","</table>"].join(new Array(5).join(["<tr>", "</tr>"].join(new Array(5).join("<td>&nbsp;</td>"))));
  fTbl = get('field');
  nTbl = get('nextshape');
  get('header').innerHTML = get('header').innerHTML + ' on tables <br> HTML5 not supported';
 }
}

document.body.onkeydown = function(e) {//"Слушает" нажатия кнопок на странице
 var keys = { //Клавиши
  37: 'left',
  39: 'right', //Стрелки влево и вправо
  40: 'down',
  32: 'down', //Вниз - пробелом или стрелкой вниз
  38: 'rotate', //Вращение- стрелкой вверх
  27: 'escape' //Пауза по клавише Esc
 };
 //Если код клавиши допустимый, передаёт код в обработчик keyPress
 if (typeof(keys[e.keyCode])!='undefined') keyPress(keys[e.keyCode]);
}

function drawRect (x,y,cnv,ctx,c,r) { //рисует прямоугольник на канве cnv
 var w = cnv.width/c;
 var h = cnv.height/r;
 ctx.fillRect (w*x, h*y, w-1, h-1);
 ctx.strokeRect (w*x, h*y, w-1, h-1);
}

function render() { //Рисует поле и фигуры
 if(html5){//Рисуем на канве
 var mainCtx = mainCanvas.getContext ('2d'); 
 var nextCtx = nextCanvas.getContext ('2d');
//Рисует стакан
 mainCtx.clearRect( 0, 0, mainCanvas.width, mainCanvas.height );
 mainCtx.strokeStyle = 'black';
 for (var x=0; x<cols; x++) {
  for (var y = 0; y < rows; y++ ) {
   if (fieldArr[y][x]) {
    mainCtx.fillStyle = colors[fieldArr[y][x]-1];
    drawRect (x,y,mainCanvas,mainCtx,cols,rows);
   }
  }
 }
 //Рисует фигуру в стакане
 for (var y=0; y<4; y++) {
  for (var x=0; x<4; x++) {
   if (thisShape[y][x]) {
    mainCtx.fillStyle = colors[thisShape[y][x]-1];
    drawRect (shpX+x,shpY+y,mainCanvas,mainCtx,cols,rows);
   }
  }
 }
 //Рисует следующую фигуру
 nextCtx.clearRect( 0, 0, nextCanvas.width, nextCanvas.height );
 nextCtx.strokeStyle = 'black';
 for (var y=0; y<4; y++) {
  for (var x=0; x<4; x++) {
   if (nextShape[y][x]) {
    nextCtx.fillStyle = colors[nextShape[y][x]-1];
    drawRect (x,y,nextCanvas,nextCtx,4,4);
   }
  }
 }
 }else{//Рисуем в таблицах
// Рисует стакан
	for(var y=0; y<rows; y++){
		for(var x=0; x<cols; x++){
			cell = fTbl.rows[y].cells[x]; 
			cell.style.backgroundColor = "";
			cell.className="";
			if(fieldArr[y][x]){				
				cell.style.backgroundColor = colors[fieldArr[y][x]-1]; 
				cell.className="fill";
			}
		}
	};
// Рисует фигуру
	for(var y=0; y<4; y++){
		for(var x=0; x<4; x++){
			if(	y+shpY<rows
				&& x+shpX >= 0
				&& x+shpX <cols
				){
				cell = fTbl.rows[y+shpY].cells[x+shpX]; 
				if(thisShape[y][x]){				
				cell.style.backgroundColor = colors[thisShape[y][x]-1]; 
				cell.className="fill";
				}
			}
		}
	}
//Рисует следующую фигуру
	for(var y=0; y<4; y++){
		for(var x=0; x<4; x++){
			cell = nTbl.rows[y].cells[x]; 
			if(nextShape[y][x]){				
				cell.style.backgroundColor = colors[nextShape[y][x]-1]; 
				cell.className="fill";
			}else{
				cell.style.backgroundColor = ''; 
				cell.className='';
			}
		}
	}
 }
}

function generateShape () { //Сгенерировать следующую фигуру
 var id = Math.floor (Math.random()*shapes.length);
 var tmpShape = shapes[id];
 var newShape = [];
 for (var y=0; y<4; y++) {
  newShape[y] = [];
  for (var x=0; x<4; x++) {
   var i = 4*y+x;
   if (typeof(tmpShape[i])!='undefined') newShape[y][x] = tmpShape[i];
   }
 }
 return newShape;
}

function rotate(thisShape) { //Вращение текущей фигуры thisShape против часовой стрелки
 var newShape = [];
 for (var y=0; y<4; y++) {
  newShape[y] = [];
  for (var x=0; x<4; x++) newShape[y][x]=thisShape[3-x][y]; //Очень просто, да?
 }
 return newShape;
}

function keyPress( key ) { //Обработчик нажатий клавиш
 switch ( key ) {
  case 'escape':    
   window.alert ('paused');
  break;
  case 'left':
   if (valid(-1)) --shpX;
  break;
  case 'right':
   if (valid(1)) ++shpX;
  break;
  case 'down':
   if (valid(0,1)) ++shpY;
  break;
  case 'rotate':
   var rotated = rotate(thisShape);
   if (valid(0,0,rotated)) thisShape = rotated;
  break;
 }
};
function fixShape(){
 for (var y=0; y<4; y++) {
  for (var x=0; x<4; x++) {
   if (thisShape[y][x])fieldArr[y+shpY][x+shpX] = thisShape[y][x];
  }
 }
}

function valid (dX,dY,newShape) { //Проверка допустимости итоговой позиции фигуры thisShape
 newShape = newShape || thisShape; 
 dX = dX || 0; // Первые 3 строки - тест на наличие в вызове функции параметров: 
 dY = dY || 0; // если слева false, то используем второе значение, которое справа от ||
 dX = shpX + dX;
 dY = shpY + dY;
 for (var y=0; y<4; y++) {
  for (var x=0; x<4; x++) {
   if (newShape[y][x]) {
    if (
		typeof(fieldArr[y+dY])=='undefined' 
		|| typeof(fieldArr[y+dY][x+dX])=='undefined'
		|| fieldArr[y+dY][x+dX]
		|| x+dX<0 
		|| y+dY>=rows 
		|| x+dX>=cols
		){
     if (dY==1) fieldFull=true; //Конец игры, если текущая фигура - на верхней линии
	 return false;
    }
   }
  }
 }
 return true;
}

function playGame() { //Контроль падения фигуры, создание новой и очистка линии
 if (valid(0,1)) shpY++;
 else {
  fixShape();
  var cleared = clearLines();
  if (cleared) countPlus(cleared);
  if (fieldFull) {
   newGame();
   return false;
  }
  newShape();
 }
}

function countPlus (lines0) { //Подсчёт очков
 lines += lines0; 
 var bonus = [0, 100, 300, 700, 1500];
 count += bonus[lines0];
 if (count > maxCount) maxCount = count;
 get('tetriscount').innerHTML = 
  "Lines: "+lines+"<br>Count: "+count+"<br>Record: "+maxCount;
}

function clearLines() { //Проверить, есть ли заполненные линии и очистить их
 var cleared = 0;
 for (var y=rows-1; y>-1; y--) {
  var rowFilled = true;
  for (var x=0; x<cols; x++) {
   if (fieldArr[y][x]==0) {
    rowFilled = false;
    break;
   }
  }
  if (rowFilled) { //Очистить линию
   cleared++;
   for (var yy=y; yy>0; yy--) {
    for (var x=0; x<cols; x++) {
     fieldArr[yy][x]=fieldArr[yy-1][x];
    }
   }
   y++;
  }
 }
 return cleared;
}

function newShape() { //Создать новую фигурку 4x4 в массиве thisShape
 thisShape=(typeof(nextShape)!='undefined')?nextShape:generateShape();
 nextShape = generateShape();
 shpX = Math.floor((cols-4)/2); shpY = 0; //Начальная позиция новой фигуры
}

function initField() { //Очистить стакан
 for (var y=0; y<rows; ++y) {
  fieldArr[y] = [];
  for (var x=0; x<cols; x++) fieldArr[y][x] = 0;
 }
}

function newGame() { //Новая игра
clearInterval (interval);//Обновляем интервал для каждой новой игры
initField();
newShape();
fieldFull = false; lines = 0; count = 0; countPlus (0); 
interval = setInterval (playGame,300); //скорость игры, мс
}

function main(){
 createField();
 newGame();
 setInterval(render,50);
}
main();