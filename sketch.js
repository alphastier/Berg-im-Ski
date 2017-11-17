/*
______ _      _     _   _              _   _               _             
| ___ (_)    | |   | | (_)            | | | |             (_)            
| |_/ /_  ___| |__ | |_ _  __ _  ___  | | | | ___ _ __ ___ _  ___  _ __  
|    /| |/ __| '_ \| __| |/ _` |/ _ \ | | | |/ _ \ '__/ __| |/ _ \| '_ \ 
| |\ \| | (__| | | | |_| | (_| |  __/ \ \_/ /  __/ |  \__ \ | (_) | | | |
\_| \_|_|\___|_| |_|\__|_|\__, |\___|  \___/ \___|_|  |___/_|\___/|_| |_|
                           __/ |                                         
                          |___/                                          
*/

//var muse = musedata.connect('http://127.0.0.1:8081');
var muse = musedata.fake();
var ypos = 0;						//starting position
var dir = 0; 						//increasing or decreasing mountain
var speed = 0.1; 					//Speed of mountain growth



//creating noise variables
var yoff = 0;
var xoff = 0;
var coreHeight = 460;

//img preload
var img;
function preload() {
    img = loadImage('ski_1.png');
}

function setup() {
	createCanvas(1024,768);
}

function draw() {

image(img, 0, 0);

//Variables
var graphBorder = 112;				//distance to sides
var graphBot = coreHeight;			//distance below graphic
var graphWidth = width-graphBorder-graphBorder;
var c = color(0, 255, 255, 150);
var alpha_relative = muse.get("/muse/elements/alpha_relative");
var thresh = dynamicThreshold();	//store dynamic threshold
var threshold = thresh.threshold(alphaMap);
var increaseRise = ypos; 			//map this 0-14 0m-10'000m
var increaseLower = increaseRise + (increaseRise*0.02);
var alphaMap = 0;					//mapped with relative alpha values		

//Map
alphaMap = map(alpha_relative.mean,0,1,0,14);

//Threshold
var threshold = thresh.threshold(alphaMap);

//if we do better than the threshold
//move the circle upwards
if (alphaMap > threshold) {
	dir = -speed;
}
//we do worse than the threshold
//move the circle downwards
else if (alphaMap < threshold) {
	dir = speed;
} else {
  	dir = 0;
}

//in- or decrease mountainsize by speed and direction
ypos = ypos - dir;

//Graphic offset
push();
translate(graphBorder,200);
  
//Graphic settings
fill(c);
strokeWeight(0.1);
//stroke(0.1,10);
//noFill();
//noStroke();

beginShape();    
  
//Graphic start
vertex(graphWidth, graphBot);
vertex(0, graphBot);
	
for (var x = 0; x <= graphWidth; x += 8) {
//console.log("X =" + x,100,20);
	if(x < 0.5*graphWidth) {
   		var y = map(noise(xoff, yoff), 0, 1, coreHeight, graphBot);
   		vertex(x, y);
		coreHeight -=increaseLower;

    } else {
		var y = map(noise(xoff, yoff), 0, 1, coreHeight, graphBot);
      	vertex(x, y);
		coreHeight +=increaseRise;
	} 
    xoff += 0.02; //Je kleiner desto glattere Oberfläche
    yoff += 0.02; //Je höher desto nervöser (FPS)
	}
	
endShape(CLOSE);

pop();

//console
//textSize(25);
console.log("Coreheight =" + coreHeight,100,40);
console.log("ypos =" + ypos, 100,80);
console.log(alphaMap);

}