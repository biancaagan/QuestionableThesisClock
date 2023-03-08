/*

  This code is an updated version of the 
  device data dashboard for conndev.
  In this version, I have drawn up a calendar
  in the style of the Ring-a-Date by designer
  Giorgio Della Beffa (ringadate.it).

  The goal is to have a thesis activity ring
  (similar to the activity ring on an Apple watch,
  thanks for the idea Julia), around each day.

  by Bianca Gan 2/16/23

*/


// test.mosquitto.org uses no username and password:
// const broker = 'wss://test.mosquitto.org:8081';

// Shiftr.io
const broker = 'wss:public.cloud.shiftr.io';

// MQTT client:
let client;

// Connection options:
let options = {
  // Clean session
  clean: true,
  // Connect timeout in ms:
  connectTimeout: 10000,
  // Authentication
  clientId: 'mqttJsClient' + Math.random(1000000),
  username: 'public',
  password: 'public'
}

// Topic to subscribe to when you connect:
// let topic = 'bgan/gyro';  // mosquitto
let topic = 'conndev/bgan';
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

  // Canvas:
  var canvas = document.getElementById("myCanvas");
  var ctx = canvas.getContext("2d");

  // Table
  ctx.beginPath();
  ctx.fillStyle = "black";
  ctx.moveTo(250, 450);
  ctx.lineTo(750, 450);
  ctx.lineTo(950, 650);
  ctx.lineTo(50, 650);
  ctx.rect(50, 650, 900, 25);
  ctx.fill();
  ctx.closePath();

  // Light
  ctx.beginPath();
  ctx.fillStyle = "rgb(252, 231, 75, 50%)";
  ctx.moveTo(500, 200);
  ctx.lineTo(600, 250);
  ctx.lineTo(600, 600);
  ctx.lineTo(250, 600);
  ctx.lineTo(500, 200);
  ctx.fill();
  ctx.closePath();

  // Lamp
  ctx.beginPath();
  ctx.fillStyle = "black";
  ctx.arc(550, 250, 75, -5 * Math.PI / 6, -11 * Math.PI / 6);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.lineWidth = 15;
  ctx.moveTo(575, 225);
  ctx.lineTo(700, 160);
  ctx.moveTo(700, 160);
  ctx.lineTo(650, 550);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(695, 165, 15, 0, 2 * Math.PI);
  ctx.fill();
  
  // ctx.font = "25px Courier New";
  // ctx.fillStyle = "white";
  // ctx.fillText("yes", 425, 550);
  
}


// Handler for MQTT connect event:
function onConnect(){
  // Update localDiv text:
  localDiv.innerHTML = 'Connected to broker. Subscribing...';
  client.subscribe(topic, onSubscribe);
  // Can subscribe to multiple topics
}


// Handler for MQTT disconnect event:
function onDisconnect(){
  // Update localDiv text:
  localDiv.innerHTML = 'Disconnected from broker.';
}


// Handler for MQTT error event:
function onError(error){
  // Update localDiv text:
  localDiv.innerHTML = error;
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
  // Message is a buffer, convert to a string:
  let payloadStr = payload.toString();

  // Convert to JSON:
  let payloadJson = JSON.parse(payloadStr);

  // List out individual gyro values:
  let headingVal = payloadJson.heading;
  let pitchVal = payloadJson.pitch;
  let rollVal = payloadJson.roll;
  let result = '<br><b>Heading Value: </b>' + headingVal;
  result += '<br><b>Pitch Value: </b>' + pitchVal;
  result += '<br><b>Roll Value: </b>' + rollVal;
  
  var canvas = document.getElementById("calCanvas");
  var ctx = canvas.getContext("2d");


  let activityCol = "white";

  if(rollVal < 95 && rollVal > 85){
    activityCol = "#2B9720";  // Green
  } else if(rollVal > -95 && rollVal < -85){
    activityCol = "#BB0A21";  // Red
  } else{
    activityCol = "white";
  }

  ctx.beginPath();
  ctx.font = "bold 25px Courier New";
  ctx.fillStyle = activityCol;
  ctx.fillText("yes", 425, 550);


  remoteDiv.innerHTML = result;

}



// On page load, call the setup function:
document.addEventListener('DOMContentLoaded', setup);
// Run a loop every 2 seconds:
setInterval(loop, 3000);






