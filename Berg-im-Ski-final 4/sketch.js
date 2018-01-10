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
var ypos = 0;           //starting position
var dir = 0;            //increasing or decreasing mountain
var speed = 1;          //Speed of mountain growth
var alphaMa = 0;
var thresh = dynamicThreshold(); //store dynamic threshold
var yoff = 0;           //creating noise variables
var xoff = 0;           //creating noise variables
var coreHeight = 460;   //höhe des skis, bzw. des Kerns im Ski
var peak = coreHeight;  //peak: höhe der bergspitz, die wird sich im Verlauf verändern
//maximale Höhe des Berges
//je kleiner der Wert desto höher kann der Berg werden (da y=0 der obere fensterrand ist)
var maxPeak = 50;
var img;                //img preload
var dashImg;
var graphWidth;
var graphBorder = 50;
var pg;                 //graphics object in welches der Berg gezeichnet wird 
//var freeze = true;      //freeze bis start gedrückt
var duration = 5;
let timer = duration;          //timer von start bis freeze
var peakSumm = 0;    //Addition aller Peaks um Durchschnitt zu rechnen
var peakCounter = 0;    //Anzahl an Peaks in peakAverage um Durchschnitt zu rechnen
var peakAverage = 0;

var freezeState = 'freeze';
var dashboardState = 'dashboard';
var realtimeState = 'realtime';
var state = freezeState;

function preload() {
    img = loadImage('background.png');
    dashImg = loadImage('dashboard.png');
}

function setup() {
    console.log('setup');
    createCanvas(1024, 768);

    graphWidth = width - graphBorder - graphBorder;
    console.log('graphWidth', graphWidth);
    //erstellen eines graphic objects, in welches der Berg gezeichnet wird
    pg = createGraphics(1024, 768);
    //clear löscht den Hintegrund, bzw, gewährleistet einen transparenten Hintergrund
    pg.clear();

    frameRate(30);

    startButton = createButton('start');
    startButton.position(40, 700);
    startButton.mousePressed(startButtonPressed);
}

function draw() {
    if (state == freezeState) {
        drawFreezeState();
    }
    if (state == realtimeState) {
        drawRealtime();
    }
    else if (state == dashboardState) {
        drawDashboard();
    }
}


function drawFreezeState() {
    background(255);
    image(img, 0, 0);

    // die verschieden variabeln anzeigen
    fill(200);
    rect(40, 40, 200, 170);
    noStroke();
    fill(0);
}

function drawRealtime() {

    //hintergrund zeichnen
    background(255);
    image(img, 0, 0);

    var c = color(0, 255, 255, 150);

    var alphaMap = map(muse.getAlpha(), 0, 1, 0, 100); //mapped with relative alpha values  

    //Threshold
    var threshold = thresh.threshold(alphaMap);

    // die verschieden variabeln anzeigen
    fill(200);
    rect(40, 40, 200, 170);
    noStroke();
    fill(0);
    //text('Slider.value: ' + slider.value(), 50, 100);
    text('alphaMap: ' + alphaMap, 50, 120);
    text('threshold: ' + threshold, 50, 140);
    text("peakAverage: " + peakAverage, 50, 160);
    text("peaCounter: " + peakCounter, 50, 180);
    text("peakSumm: " + peakSumm, 50, 200);

    //if we do better than the threshold
    //move the mountain upwards 
    if (alphaMap > threshold) {
        dir = -speed;
    }
    //we do worse than the threshold
    //move the mountain downwards
    else if (alphaMap < threshold) {
        dir = speed;
    } else {
        dir = 0;
    }

    //in- or decrease mountainsize by speed and direction
    peak = peak + dir;

    //sicherstellen dass peak nicht oberhalb maxPeak liegt
    if (peak < maxPeak) {
        peak = maxPeak;
    }
    //sicherstellen das peak nicht unterhalb des skis ist
    //dies verhindert dass der Berg nach unten wächst.
    if (peak > coreHeight) {
        peak = coreHeight;
    }


    //Graphic offset
    //anstatt direkt in den canvas, wird der Berg jetzt in das graphics object gezeichnet.
    pg.push();

    //pg.translate(graphBorder, 200);
    pg.translate(graphBorder, -132);

    pg.stroke(0);
    pg.fill(c);
    pg.strokeWeight(0.1);

    pg.beginShape();

    //Graphic start
    pg.vertex(graphWidth, coreHeight);
    pg.vertex(0, coreHeight);

    for (var x = 0; x < graphWidth; x += 8) {
        if (x < 0.5 * graphWidth) {
            var theNoise = noise(xoff, yoff);

            //berechnen wie hoch das y maximal an dieser x-postion
            //sein könnte -> localMax
            var localMax = map(x, 0, 0.5 * graphWidth, coreHeight, peak);

            //aus localMax und noise werte die y postion berechnen
            var y = map(theNoise, 0, 1, coreHeight, localMax);
            pg.vertex(x, y);

            //coreHeight -= increaseLower;
        } else {
            var theNoise = noise(xoff, yoff);
            //berechnen wie hoch das y maximal an dieser x-postion
            //sein könnte -> localMax
            var localMax = map(x, 0.5 * graphWidth, graphWidth, peak, coreHeight);

            //aus localMax und noise werte die y postion berechnen
            var y = map(theNoise, 0, 1, coreHeight, localMax);

            pg.vertex(x, y);
        }
        xoff += 0.02; //Je kleiner desto glattere Oberfläche
        yoff += 0.02;

    }

    pg.endShape(CLOSE);

    pg.pop();

    image(pg, 0, 0);

    text(timer, width / 2, 700);

    //Timer till game freezes  
    if (frameCount % 30 == 0 && timer > 0) { // if the frameCount is divisible by 60, then a second has passed. it will stop at 0
        timer--;
    }

    if (timer == 0) {
        state = dashboardState;
    }

    //peakSumm + peak;
    peakSumm += peak;
    //peakCounter + 1;
    peakCounter += 1;
}


function drawDashboard() {

    background(255);
    image(dashImg, 0, 0);
    peakAverage = peakSumm / peakCounter;
    var mountainImg = createMountain(coreHeight, peakAverage);
    image(mountainImg, 0, 0);

    noLoop();
}

function createMountain(base, h) {
    var graphics = createGraphics(1024, 768);
    graphics.clear();
    //graphics.background(255);

    var c = color(0, 255, 255, 150);

    graphics.push();

    //pg.translate(graphBorder, 200);
    graphics.translate(graphBorder, -132);

    graphics.stroke(0);
    graphics.fill(c);
    graphics.strokeWeight(0.1);

    graphics.beginShape();

    //Graphic start
    graphics.vertex(graphWidth, base);
    graphics.vertex(0, base);

    for (var x = 0; x < graphWidth; x += 8) {
        if (x < 0.5 * graphWidth) {
            var theNoise = noise(xoff, yoff);

            //berechnen wie hoch das y maximal an dieser x-postion
            //sein könnte -> localMax
            var localMax = map(x, 0, 0.5 * graphWidth, base, h);

            //aus localMax und noise werte die y postion berechnen
            var y = map(theNoise, 0, 1, base, localMax);
            graphics.vertex(x, y);

            //coreHeight -= increaseLower;
        } else {
            var theNoise = noise(xoff, yoff);
            //berechnen wie hoch das y maximal an dieser x-postion
            //sein könnte -> localMax
            var localMax = map(x, 0.5 * graphWidth, graphWidth, h, base);

            //aus localMax und noise werte die y postion berechnen
            var y = map(theNoise, 0, 1, base, localMax);

            graphics.vertex(x, y);
        }
        xoff += 0.02; //Je kleiner desto glattere Oberfläche
        yoff += 0.02;

    }

    graphics.endShape(CLOSE);

    graphics.pop();

    return graphics;
}


function resetValues() {
    timer = duration;
    peakAverage = 0;
    peakCounter = 0;
    peakSumm = 0;
    ypos = 0;
    dir = 0;
    speed = 1;
    alphaMa = 0;
    peak = coreHeight;
    maxPeak = 50;
    thresh = dynamicThreshold();
    pg = createGraphics(1024, 768);
    //clear löscht den Hintegrund, bzw, gewährleistet einen transparenten Hintergrund
    pg.clear();
}

function startButtonPressed() {
    console.log('startButtonPressed');
    if (state == freezeState) {
        state = realtimeState;
    }
    else if (state == realtimeState) {
        //do nothing, state will be changed by timer
    }
    else if (state == dashboardState) {
        state = freezeState;
        resetValues();
        loop();
    }
    console.log('state: ' + state);
}