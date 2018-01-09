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
//max peak wird mit einer grünen linie dargestellt zur illustration
var maxPeak = 50;
var img;                //img preload
var graphWidth; 
var graphBorder = 50;
var pg;                 //graphics object in welches der Berg gezeichnet wird 
var freeze = true;      //freeze bis start gedrückt

function startGame() {
    var freeze = false;
    console.log(freeze);
}

function freezeGame() {
    var freeze = true;
    console.log(freeze);
}

function preload() {
   img = loadImage('interface_1.png');
}

function setup() {
    console.log('setup');
    createCanvas(1024, 768);

    graphWidth = width - graphBorder - graphBorder;
    //erstellen eines graphic objects, in welches der Berg gezeichnet wird
    pg = createGraphics(graphWidth,height);
    //clear löscht den Hintegrund, bzw, gewährleistet einen transparenten Hintergrund
    pg.clear();

    //festlegen der alpha werte via slider
    //dann kann man die werte manuell anpassen und
    //beobachten wie der Berg reagiert. 
    slider = createSlider(0.001, 0.5, 0, 0);
    slider.position(50, 50);

    

    frameRate(30);
    //image(img, 0, 0);

    startButton = createButton('start');
    startButton.position(40, 200);
    startButton.mousePressed(startGame);

    freezeButton = createButton('freeze');
    freezeButton.position(200, 200);
    freezeButton.mousePressed(freezeGame);   
}

function draw() {

    console.log('draw');
	//damit man besser sieht wie der berg auf die 
	//daten reagiert, habe ich einen background
	//eingefügt, denn kannst du dann wieder 
	//rausnehmen
    background(255);

    //hintergrund zeichnen
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
    
    var alphaMap = map(muse.getAlpha(),0,1,0,100); //mapped with relative alpha values  

    //Threshold
    var threshold = thresh.threshold(alphaMap);

    // die verschieden variabeln anzeigen
    fill(200);
    rect(40, 40, 200, 150);
    noStroke();
    fill(0);
    text('Slider.value: ' + slider.value(), 50, 100);
    text('alphaMap: ' + alphaMap, 50, 120);
    text('threshold: ' + threshold, 50, 140); 

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
    if(peak<maxPeak){
    	peak = maxPeak;
    }
    //sicherstellen das peak nicht unterhalb des skis ist
    //dies verhindert dass der Berg nach unten wächst.
    if(peak>coreHeight){
    	peak = coreHeight;
    }

    //Graphic offset
    //anstatt direkt in den canvas, wird der Berg jetzt in das graphics object gezeichnet.
        pg.push();

    //pg.translate(graphBorder, 200);
    pg.translate(graphBorder,-132);

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

    for (var x = 0; x <= graphWidth; x += 8) {
        if (x < 0.5 * graphWidth) {
        	var theNoise = noise(xoff, yoff);

        	//berechnen wie hoch das y maximal an dieser x-postion
        	//sein könnte -> localMax
        	var localMax = map(x,0,0.5*graphWidth,coreHeight,peak);

        	//aus localMax und noise werte die y postion berechnen
            var y = map(theNoise, 0, 1, coreHeight, localMax);
            pg.vertex(x, y);

            //coreHeight -= increaseLower;
        } else {
        	var theNoise = noise(xoff, yoff);
        	//berechnen wie hoch das y maximal an dieser x-postion
        	//sein könnte -> localMax
        	var localMax = map(x,0.5*graphWidth, graphWidth, peak, coreHeight);

        	//aus localMax und noise werte die y postion berechnen
            var y = map(theNoise, 0, 1, coreHeight, localMax);
            pg.vertex(x, y);
            //coreHeight += increaseRise;
        }
        // if(coreHeight<0){
        // 	//coreHeight = 0;
        // }
        xoff += 0.02; //Je kleiner desto glattere Oberfläche
        yoff += 0.02;
    }

    pg.endShape(CLOSE);

    pg.pop();

    //das graphics object am schluss als bild über die szene zeichnen 
    /*if (freeze = false) {
        image(pg,0,0);
    } */

    image(pg,0,0);
    //console
    //textSize(25);
    // console.log("Coreheight =" + coreHeight,100,40);
    // console.log("ypos =" + ypos, 100,80);
    // console.log(alphaMap);

}