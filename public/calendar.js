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
let topic = 'conndev/bag5392';
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
  var canvas = document.getElementById("calCanvas");
  var ctx = canvas.getContext("2d");

  ctx.beginPath();
  ctx.roundRect(0, 0, canvas.width, canvas.height, 40);
  ctx.strokeStyle = "#D0E0E3";
  ctx.fillStyle = "#D0E0E3";
  ctx.stroke();
  ctx.fill();
  // ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "bold 25px Courier New";
  ctx.textAlign = "center";
  ctx.fillStyle = "black";

  // ------------------ Months ------------------
  ctx.fillText("Jan", 100, 55);
  ctx.fillText("Feb", 200, 55);
  ctx.fillText("Mar", 300, 55);
  ctx.fillText("Apr", 400, 55);
  ctx.fillText("May", 500, 55);
  ctx.fillText("Jun", 600, 55);

  ctx.fillText("Jul", 100, 145);
  ctx.fillText("Aug", 200, 145);
  ctx.fillText("Sep", 300, 145);
  ctx.fillText("Oct", 400, 145);
  ctx.fillText("Nov", 500, 145);
  ctx.fillText("Dec", 600, 145);

  // ------------------ Numbers ------------------

  ctx.font = "bold 36px Courier New";
  ctx.fillText("1", 100, 245);
  ctx.fillText("2", 200, 245);
  ctx.fillText("3", 300, 245);
  ctx.fillText("4", 400, 245);
  ctx.fillText("5", 500, 245);
  ctx.fillText("6", 600, 245);
  ctx.fillText("7", 700, 245);

  ctx.fillText("8", 100, 345);
  ctx.fillText("9", 200, 345);
  ctx.fillText("10", 300, 345);
  ctx.fillText("11", 400, 345);
  ctx.fillText("12", 500, 345);
  ctx.fillText("13", 600, 345);
  ctx.fillText("14", 700, 345);

  ctx.fillText("15", 100, 445);
  ctx.fillText("16", 200, 445);
  ctx.fillText("17", 300, 445);
  ctx.fillText("18", 400, 445);
  ctx.fillText("19", 500, 445);
  ctx.fillText("20", 600, 445);
  ctx.fillText("21", 700, 445);

  ctx.fillText("22", 100, 545);
  ctx.fillText("23", 200, 545);
  ctx.fillText("24", 300, 545);
  ctx.fillText("25", 400, 545);
  ctx.fillText("26", 500, 545);
  ctx.fillText("27", 600, 545);
  ctx.fillText("28", 700, 545);

  ctx.fillText("29", 100, 645);
  ctx.fillText("30", 200, 645);
  ctx.fillText("31", 300, 645);

  // ------------------ Months Circle ------------------

  switch(new Date().getMonth()){
    case 0:
      monthX = 100;
      monthY = 50;
      break;
    case 1:
      monthX = 200;
      monthY = 50;
      break;
    case 2:
      monthX = 300;
      monthY = 50;
      break;
    case 3:
      monthX = 400;
      monthY = 50;
      break;
    case 4:
      monthX = 500;
      monthY = 50;
      break;
    case 5:
      monthX = 600;
      monthY = 50;
      break;
    case 6:
      monthX = 100;
      monthY = 140;
      break;
    case 7:
      monthX = 200;
      monthY = 140;
      break;
    case 8:
      monthX = 300;
      monthY = 140;
      break;
    case 9:
      monthX = 400;
      monthY = 140;
      break;
    case 10:
      monthX = 500;
      monthY = 140;
      break;
    case 11:
      monthX = 600;
      monthY = 140;
      break;
  }


  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(monthX, monthY, 40, 0, 2 * Math.PI);
  ctx.strokeStyle = "#2C4251"
  ctx.stroke();


  // ------------------ Days ------------------
  ctx.font = "bold 25px Courier New";
  ctx.fillText("Sun", 100, 740);
  ctx.fillText("Mon", 200, 740);
  ctx.fillText("Tues", 300, 740);
  ctx.fillText("Wed", 400, 740);
  ctx.fillText("Thur", 500, 740);
  ctx.fillText("Fri", 600, 740);
  ctx.fillText("Sat", 700, 740);


  // ------------------ Days Circle ------------------
  let dayNameX;

  switch(new Date().getDay()){
    case 0:
      dayNameX = 100;
      break;
    case 1:
      dayNameX = 200;
      break;
    case 2:
      dayNameX = 300;
      break;
    case 3:
      dayNameX = 400;
      break;
    case 4:
      dayNameX = 500;
      break;
    case 5:
      dayNameX = 600;
      break;
    case 6:
      dayNameX = 700;
      break;
  }
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(dayNameX, 735, 40, 0, 2 * Math.PI);
  ctx.strokeStyle = "#2C4251";
  ctx.stroke();

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
  
  // Circle color determination:
  // ------------------ Circle Activity Ring ------------------
  var canvas = document.getElementById("calCanvas");
  var ctx = canvas.getContext("2d");

  let activityCol = "white";

  if(rollVal < 95 && rollVal > 85){
    activityCol = "#2B9720";  // Green
  }
  if(rollVal > -95 && rollVal < -85){
    activityCol = "#BB0A21";  // Red
  }

  let dayX;
  let dayY;

  switch(new Date().getDate()){
    case 1:
      dayX = 100;
      dayY = 235;
      break;
    case 2:
      dayX = 200;
      dayY = 235;
      break;
    case 3:
      dayX = 300;
      dayY = 235;
      break;
    case 4:
      dayX = 400;
      dayY = 235;
      break;
    case 5:
      dayX = 500;
      dayY = 235;
      break;
    case 6:
      dayX = 600;
      dayY = 235;
      break;
    case 7:
      dayX = 700;
      dayY = 235;
      break;
    case 8:
      dayX = 100;
      dayY = 335;
      break;
    case 9:
      dayX = 200;
      dayY = 335;
      break;
    case 10:
      dayX = 300;
      dayY = 335;
      break;
    case 11:
      dayX = 400;
      dayY = 335;
      break;
    case 12:
      dayX = 500;
      dayY = 335;
      break;
    case 13:
      dayX = 600;
      dayY = 335;
      break;
    case 14:
      dayX = 700;
      dayY = 335;
      break;
    case 15:
      dayX = 100;
      dayY = 435;
      break;
    case 16:
      dayX = 200;
      dayY = 435;
      break;
    case 17:
      dayX = 300;
      dayY = 435;
      break;
    case 18:
      dayX = 400;
      dayY = 435;
      break;
    case 19:
      dayX = 500;
      dayY = 435;
      break;
    case 20:
      dayX = 600;
      dayY = 435;
      break;
    case 21:
      dayX = 700;
      dayY = 435;
      break;
    case 22:
      dayX = 100;
      dayY = 535;
      break;
    case 23:
      dayX = 200;
      dayY = 535;
      break;
    case 24:
      dayX = 300;
      dayY = 535;
      break;
    case 25:
      dayX = 400;
      dayY = 535;
      break;
    case 26:
      dayX = 500;
      dayY = 535;
      break;
    case 27:
      dayX = 600;
      dayY = 535;
      break;
    case 28:
      dayX = 700;
      dayY = 535;
      break;
    case 29:
      dayX = 100;
      dayY = 635;
      break;
    case 30:
      dayX = 200;
      dayY = 635;
      break;
    case 31:
      dayX = 300;
      dayY = 635;
      break;
  }

  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(dayX, dayY, 40, 0, 2 * Math.PI);
  ctx.strokeStyle = activityCol;
  ctx.stroke();


  // // 1
  // ctx.beginPath();
  // ctx.strokeStyle = activityCol;
  // ctx.arc(100, 240, 40, -Math.PI/2, -Math.PI/3);
  // ctx.stroke();
  // // 2
  // ctx.beginPath();
  // ctx.strokeStyle = "green";
  // ctx.arc(100, 240, 40, -Math.PI/3, -Math.PI/6);
  // ctx.stroke();


  // remoteDiv.innerHTML = result;

}



// On page load, call the setup function:
document.addEventListener('DOMContentLoaded', setup);
// Run a loop every 2 seconds:
setInterval(loop, 3000);






