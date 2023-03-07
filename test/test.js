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

  ctx.beginPath();
  ctx.fillStyle = "yellow";
  ctx.moveTo(500, 250);
  ctx.lineTo(550, 250);
  ctx.lineTo(650, 500);
  ctx.lineTo(350, 500);
  ctx.lineTo(450, 250);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.fillStyle = "black";
  ctx.arc(500, 300, 150, Math.PI, 0);
  ctx.fill();
  ctx.closePath();
  
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
  // let result = '<br><b>Heading Value: </b>' + headingVal;
  // result += '<br><b>Pitch Value: </b>' + pitchVal;
  // result += '<br><b>Roll Value: </b>' + rollVal;
  
  // var canvas = document.getElementById("calCanvas");
  // var ctx = canvas.getContext("2d");

  // let activityCol = "white";

  // if(rollVal < 95 && rollVal > 85){
  //   activityCol = "#2B9720";  // Green
  // } else if(rollVal > -95 && rollVal < -85){
  //   activityCol = "#BB0A21";  // Red
  // } else{
  //   activityCol = "white";
  // }

}



// On page load, call the setup function:
document.addEventListener('DOMContentLoaded', setup);
// Run a loop every 2 seconds:
setInterval(loop, 3000);






