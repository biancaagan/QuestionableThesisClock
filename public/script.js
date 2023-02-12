/*

    Code worked off of Tom Igoe's MQTTjs Client Example
    https://github.com/tigoe/mqtt-examples/blob/main/browser-clients/mqttjs/MqttJsClientSimple/script.js

    Gyroscope data is sent over wifi from an Arduino to the MQTT broker,
    this code reads the pitch value and translates that into the color
    of the lines being drawn. 

    This project is for my Questionable Thesis Clock, its physical form
    will be a block that is two sided with either "Thesis?" and "Thesis!"

    The orientation of the block (whether the '?' or the '!' is 
    facing upwards) determines if I am working on my thesis project.

    Visually, it draws different colored lines in a web browser. 
    More green is more time spent on my thesis.
    More red is less time spent on my thesis.
    And blue is questionable, as it is drawn when the pitch value is 
    outside of the specified range (i.e. when flipping the block over).

    It is not an accurate clock.


    by Bianca Gan 2/12/23

*/
// test.mosquitto.org uses no username and password:
const broker = 'wss://test.mosquitto.org:8081';

// MQTT client:
let client;

// Connection options:
let options = {
    // Clean session
    clean: true,
    // Connect timeout in ms:
    connectTimeout: 10000,
    // Authentication
    clientId: 'mqttJsClient',
}

// Topic to subscribe to when you connect:
let topic = 'bgan/gyro';
// Divs to show messages:
let localDiv, remoteDiv, headingVar;
// Whether the client should be publishing or not:
let publishing = true;

function setup(){
    // Put the divs in variables for ease of use:
    localDiv = document.getElementById('local');
    remoteDiv = document.getElementById('remote');
    headingVar = document.getElementById('hVal');
    
    // Set text of localDiv:
    localDiv.innerHTML = 'trying to connect';
    // Attempt to connect:
    client = mqtt.connect(broker, options);
    // Set listeners:
    client.on('connect', onConnect);
    client.on('close', onDisconnect);
    client.on('message', onMessage);
    client.on('error', onError);
}

// Handler for MQTT connect event:
function onConnect(){
    // Update localDiv text:
    localDiv.innerHTML = 'Connected to broker. Subscribing...'
    client.subscribe(topic, onSubscribe);
}

// Handler for MQTT disconnect event:
function onDisconnect(){
    // Update localDiv text:
    localDiv.innterHTML = 'Disconnected from broker.'
}

// Handler for MQTT error event:
function onError(error){
    // Update localDiv text:
    localDiv.innterHTML = error;
}

// Handler for MQTT subscribe event:
function onSubscribe(response, error){
    if(!error){
        // Update localDiv text:
        localDiv.innerHTML = 'Subscribed to broker.';
    } else{
        // Update localDiv text with the error:
        localDiv.innerHTML = error;
    }
}

// Handler for MQTT message received event:
function onMessage(topic, payload, packet){
    // let result;

    // Message is a buffer, convert to a string:
    let payloadStr = payload.toString();

    // Convert to JSON:
    let payloadJson = JSON.parse(payloadStr);

    // result += '<br>';

    // List out individual gyro values:
    let headingVal = payloadJson.heading;
    let pitchVal = payloadJson.pitch;
    let rollVal = payloadJson.roll;
    // result += '<br>Heading Value: ' + headingVal;
    // result += '<br>Pitch Value: ' + pitchVal;
    // result += '<br>Roll Value: ' + rollVal;

    // Line color determination:
    let lineCol = "blue";
    if(rollVal < 95 && rollVal > 85){
        lineCol = "green";
    }
    if(rollVal > -95 && rollVal < -85){
        lineCol = "red";
    }

    // Canvas
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.moveTo(Math.floor(Math.random() * 1000), Math.floor(Math.random() * 500));
    ctx.lineTo(Math.floor(Math.random() * 1000), Math.floor(Math.random() * 500));
    ctx.lineWidth = 5;
    ctx.strokeStyle = lineCol;
    ctx.stroke();
   
    // remoteDiv.innerHTML = result;
}


// On page load, call the setup function:
document.addEventListener('DOMContentLoaded', setup);
// Run a loop every 2 seconds:
setInterval(loop, 5000);









