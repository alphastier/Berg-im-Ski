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
var ypos = 0; //starting position
var dir = 0; //increasing or decreasing mountain
var speed = 1; //Speed of mountain growth

var thresh = dynamicThreshold(500); //store dynamic threshold

//creating noise variables
var yoff = 0;
var xoff = 0;
var coreHeight = 460;
var peak = coreHeight;
var maxPeak = 50;

var slider;

//img preload
var img;

function preload() {
    img = loadImage('ski_1.png');
    slider = createSlider(0.001, 0.5, 0, 0);
    slider.position(50, 50);
}

function setup() {
    createCanvas(1024, 768);

    frameRate(30);
}

function draw() {

    if (frameCount < 10) {
        background(255);
    }
    background(255);

    image(img, 0, 0);

    //Variables
    var graphBorder = 112; //distance to sides
   // var graphBot = coreHeight; //distance below graphic
    var graphWidth = width - graphBorder - graphBorder;
    var c = color(0, 255, 255, 150);
    var alpha_relative = muse.get("/muse/elements/alpha_relative");

    var threshold = thresh.threshold(alphaMap);
    //var increaseRise = ypos; //map this 0-14 0m-10'000m
   // var increaseLower = increaseRise + (increaseRise * 0.02);
    var alphaMap = 0; //mapped with relative alpha values		

   // console.log(slider.value());

    //Map
    alphaMap = map(slider.value(), 0, 0.5, 0, 100); //map(alpha_relative.mean,0,1,0,14);



    //Threshold
    var threshold = thresh.threshold(alphaMap);

    fill(200);
    rect(40, 40, 200, 150);
    noStroke();
    fill(0);
    text('Slider.value: ' + slider.value(), 50, 100);
    text('alphaMap: ' + alphaMap, 50, 120);
    text('threshold: ' + threshold, 50, 140);

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
    peak = peak + dir;

    if(peak<maxPeak){
    	peak = maxPeak;
    }
    if(peak>coreHeight){
    	peak = coreHeight;
    }

    //Graphic offset
    push();
    translate(graphBorder, 200);

    //Graphic settings
    fill(c);
    strokeWeight(1);
    //stroke(0.1,10);
    //noFill();
    //noStroke();

   
    stroke(0);
    fill(200);
    strokeWeight(2);


    stroke(255,0,0);
    line(0,coreHeight,width,coreHeight);
    stroke(0,255,0);
    line(0,maxPeak,width,maxPeak);
    stroke(0,0,255);
    line(0,peak,width,peak);

    stroke(0);

 

    beginShape();

    //Graphic start
    vertex(graphWidth, coreHeight);
    vertex(0, coreHeight);

    for (var x = 0; x <= graphWidth; x += 8) {

        //console.log("X =" + x,100,20);
        if (x < 0.5 * graphWidth) {
        	//var theNoise = noise(xoff+0.1*x, yoff);
        	var theNoise = noise(xoff, yoff);
        	//console.log('noise a: ' + theNoise);
        	var localMax = map(x,0,0.5*graphWidth,coreHeight,peak);
            var y = map(theNoise, 0, 1, coreHeight, localMax);

            vertex(x, y);
            //coreHeight -= increaseLower;

        } else {
        	//var theNoise = noise(xoff+0.1*x, yoff);
        	var theNoise = noise(xoff, yoff);
        	//console.log('noise b: ' + theNoise);
        	var localMax = map(x,0.5*graphWidth,graphWidth,peak,coreHeight);
            var y = map(theNoise, 0, 1, coreHeight, localMax);
            vertex(x, y);
            //coreHeight += increaseRise;
        }

        if(coreHeight<0){
        	//coreHeight = 0;
        }
        xoff += 0.02; //Je kleiner desto glattere Oberfläche
        yoff += 0.02; //Je höher desto nervöser (FPS)
    }

    endShape(CLOSE);

    pop();

    //console
    //textSize(25);
    // console.log("Coreheight =" + coreHeight,100,40);
    // console.log("ypos =" + ypos, 100,80);
    // console.log(alphaMap);

}