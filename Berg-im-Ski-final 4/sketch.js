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
var graphWidth;
var graphBorder = 50;
var pg;                 //graphics object in welches der Berg gezeichnet wird 
var freeze = true;      //freeze bis start gedrückt
let timer = 5;          //timer von start bis freeze
var peakSumm = 0;    //Addition aller Peaks um Durchschnitt zu rechnen
var peakCounter = 0;    //Anzahl an Peaks in peakAverage um Durchschnitt zu rechnen
var peakAverage = peakSumm / peakCounter;

function startGame() {
    //mit var wird eine neue lokale Variabel erstellt, die globale freeze Variabel wird nicht tangiert. 
    //um die globale freeze Variabel zu ändern musst du 'var' weglassen. 
    //var freeze = false;
    freeze = false;
    console.log(freeze);
}

function freezeGame() {
    //mit var wird eine neue lokale Variabel erstellt, die globale freeze Variabel wird nicht tangiert. 
    //um die globale freeze Variabel zu ändern musst du 'var' weglassen. 
    //var freeze = true;
    freeze = true;
    console.log(freeze);
    text("Dein Berg war durchschnittlich ", peakAverage, "m hoch.")
}

function preload() {
    img = loadImage('background.png');
}

function dashboard() {
    img = loadImage('dashboard.png');
    image(img, 0, 0);
    freeze=true;
}

function setup() {
    console.log('setup');
    createCanvas(1024, 768);

    graphWidth = width - graphBorder - graphBorder;
    console.log('graphWidth',graphWidth);
    //erstellen eines graphic objects, in welches der Berg gezeichnet wird
    pg = createGraphics(width, height);
    //clear löscht den Hintegrund, bzw, gewährleistet einen transparenten Hintergrund
    pg.clear();

    //festlegen der alpha werte via slider
    //dann kann man die werte manuell anpassen und
    //beobachten wie der Berg reagiert. 
    slider = createSlider(0.001, 0.5, 0, 0);
    slider.position(50, 50);

    frameRate(30);
    //image(img, 0, 0);

    /*
    freezeButton = createButton('freeze');
    freezeButton.position(200, 200);
    freezeButton.mousePressed(freezeGame); */
}

function draw() {

    //hintergrund zeichnen
    background(255);
    image(img, 0, 0);

    //Variables
    //viele der variabeln die du hier 
    //definiert hast, kann man oben, vor der setup funktion, definieren
    var c = color(0, 255, 255, 150);
    //var alpha_relative = muse.get("/muse/elements/alpha_relative");

    //Map
    //damit man besser verfolgen kann wie der berg auf die daten funktioniert
    //habe ich einen slider integriert mit dem du fiktive 
    //alpha werte setzen kannst und direkt verfolgen kannst
    //wie der berg sein verhalten anpasst. 

    //mappe hier das alpha einfach in einen bereich 0-100, 
    //damit die direkt als prozent lesen kann. 
    //ist aber nicht unbedigt nötig.
    //var alphaMap = map(slider.value(), 0, 1, 0, 100); //map(alpha_relative.mean,0,1,0,14);
    //var alphaMap = map(alpha_relative.mean,0,1,0,100); //mapped with relative alpha values

    startButton = createButton('start');
    startButton.position(40, 700);
    startButton.mousePressed(startGame);

    var alphaMap = map(muse.getAlpha(), 0, 1, 0, 100); //mapped with relative alpha values  

    //Threshold
    var threshold = thresh.threshold(alphaMap);

    // die verschieden variabeln anzeigen
    fill(200);
    rect(40, 40, 200, 170);
    noStroke();
    fill(0);
    text('Slider.value: ' + slider.value(), 50, 100);
    text('alphaMap: ' + alphaMap, 50, 120);
    text('threshold: ' + threshold, 50, 140);
    text("peakAverage: "+peakAverage, 50, 160);
    text("peaCounter: "+peakCounter, 50, 180);
    text("peakSumm: "+peakSumm, 50, 200);

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
    if (freeze == false) {

        //Graphic offset
        //anstatt direkt in den canvas, wird der Berg jetzt in das graphics object gezeichnet.
        pg.push();

        //pg.translate(graphBorder, 200);
        pg.translate(graphBorder, -132);

        //höhenlinie für coreHeight
        //stroke('grey');
        //line(20,peak,width-20,peak);

        //linien zeichne für coreHeight, peak, und maxpeak
        //damit man sehen kann wie das system funktioniert
        /* stroke('red');
         line(0,coreHeight,width,coreHeight);
         stroke('green');
         line(0,maxPeak,width,maxPeak);
         stroke('blue');
         line(0,peak,width,peak); */

        //Graphic settings

        //stroke(0.1,10);
        //noFill();
        //noStroke();

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

    }

    //das graphics object am schluss als bild über die szene zeichnen 
    /*if (freeze = false) {
        image(pg,0,0);
    } */

    image(pg, 0, 0);

    text(timer, width/2, 700);

     //Timer till game freezes  
    if (freeze == false) {
        if (frameCount % 30 == 0 && timer > 0) { // if the frameCount is divisible by 60, then a second has passed. it will stop at 0
        timer --;
        }
    }
    if (timer == 0) {
        dashboard();
        console.log("it works");
    }

    peakSumm + peak;
    peakCounter + 1;

    /* fill('red');
    noStroke();
    ellipse(width/2,height/2,200,200); */

    //console
    //textSize(25);
    // console.log("Coreheight =" + coreHeight,100,40);
    // console.log("ypos =" + ypos, 100,80);
    // console.log(alphaMap);

}