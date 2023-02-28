#include <WiFiNINA.h>     // for Uno Wifi , Nano 33 IoT
//#include <WiFi101.h>        // MKR1000
#include <ArduinoMqttClient.h>
#include <Wire.h>
#include "arduino_secrets.h"

#include "Arduino_LSM6DS3.h"
#include "MadgwickAHRS.h"

// Initialize WiFi connection:
WiFiSSLClient wifi;    // WiFi as SSL connection
// WiFiClient wifi;
MqttClient mqttClient(wifi);

// // MOSQUITTO - Details for MQTT client:
// char broker[] = "test.mosquitto.org";
// int port = 1883;
// char topic[] = "bgan/gyro";
// char clientID[] = "gyro-8764643";

// SHIFTR - Details for MQTT client:
char broker[] = "public.cloud.shiftr.io";
int port = 8883;
char topic[] = "conndev/bag5392";
String clientID = "thesis-clock-234978";

// Last time the client sent a message, in ms:
long lastTimeSent = 0;
// Message sending interval:
int interval = 2000;     // every minute

Madgwick filter;
const float sensorRate = 104.00;

float roll = 0.0;
float pitch = 0.0;
float heading = 0.0;

// LEDs
const int wifiLED = 2;    // LED status for wifi connection
int wifiState = LOW;
const int mqttLED = 3;    // LED status for mqtt connection
int mqttState = LOW;
const int msgLED = 9;    // LED status for when a msg is sent
int msgState = LOW;


void setup() {
  Serial.begin(9600);

  pinMode(wifiLED, OUTPUT);
  pinMode(mqttLED, OUTPUT);
  pinMode(msgLED, OUTPUT);

  if(!Serial) delay(3000);

  // Initialize WiFi, if not connected:
  while(WiFi.status() != WL_CONNECTED){
    wifiState = LOW;
    Serial.print("Connecting to ");
    Serial.println(SECRET_SSID);
    WiFi.begin(SECRET_SSID, SECRET_PASS);
    delay(2000);
  }

  // Print IP address once connected:
  Serial.print("Connected. My IP addresss: ");
  // LED for wifi connection:
  wifiState = HIGH;
  digitalWrite(wifiLED, wifiState);
  Serial.println(WiFi.localIP());

  // Set the credentials for the MQTT client:
  mqttClient.setId(clientID);
  // If needed, login to the broke with a username and password:
  mqttClient.setUsernamePassword(SECRET_MQTT_USER, SECRET_MQTT_PASS);

  // Try to connect to the MQTT broker once you're connected to Wifi:
  while(!connectToBroker()){
    mqttState = LOW;
    Serial.println("Attempting to connect to broker...");
    delay(1000);
  }
  // LED for mqtt connection:
  mqttState = HIGH;
  digitalWrite(mqttLED, mqttState);
  Serial.println("Connected to broker.");

  if(!IMU.begin()){
    Serial.println("Failed to initialize IMU.");
    while(true);
  }

  filter.begin(sensorRate);
}

void loop() {
  // If disconnected from wifi, reconnect:
  if(WiFi.status() != WL_CONNECTED){
    connectToNetwork();
    // Skip rest of loop until connected:
    return;
  }
  
  // If not connected to the broker, try to connect:
  if(!mqttClient.connected()){
    Serial.println("Reconnecting...");
    connectToBroker();
  }

  float xAcc, yAcc, zAcc;
  float xGyro, yGyro, zGyro;

  if(IMU.accelerationAvailable() && IMU.gyroscopeAvailable()){
    IMU.readAcceleration(xAcc, yAcc, zAcc);
    IMU.readGyroscope(xGyro, yGyro, zGyro);

    filter.updateIMU(xGyro, yGyro, zGyro, xAcc, yAcc, zAcc);

    roll = filter.getRoll();
    pitch = filter.getPitch();
    heading = filter.getYaw();

    // Serial.print(heading);
    // Serial.print(", ");
    // Serial.print(pitch);
    // Serial.print(", ");
    // Serial.println(roll);
  }

  // Once every interval, send a message:
  if(millis() - lastTimeSent > interval){
    msgState = LOW;
    digitalWrite(msgLED, msgState);
    // Format message as JSON string:
    String msg = "{\"heading\": val1, \"pitch\": val2, \"roll\": val3}";
    //String msg = "{\"gyro\": [{\"heading\": val1, \"pitch\": val2, \"roll\": val3}]}";

    // Replace msg with values:
    msg.replace("val1", String(heading));
    msg.replace("val2", String(pitch));
    msg.replace("val3", String(roll));
  
    // Start a new message on the topic:
    mqttClient.beginMessage(topic);
    // Add the value:
    mqttClient.println(msg);
    msgState = HIGH;
    digitalWrite(msgLED, msgState);
    // Send the message:
    mqttClient.endMessage();

    msgState = LOW;
    digitalWrite(msgLED, msgState);
    //
    Serial.println(msg);

    // Take notet of the time you make your request:
    lastTimeSent = millis();

  }
}

boolean connectToBroker(){
  // If the MQTT client is not connected:
  if(!mqttClient.connect(broker, port)){
    // Print out the error message:
    Serial.print("MQTT connection failed. Error no: ");
    Serial.println(mqttClient.connectError());
    // Return that you're not connected:
    return false;
  }
  mqttClient.subscribe(topic);
  // Once you're connected, you return that you're connected:
  return true;
}

void connectToNetwork(){
  // Try to connect to network:
  while(WiFi.status() != WL_CONNECTED){
    wifiState = LOW;
    Serial.print("Connecting to ");
    Serial.println(SECRET_SSID);
    WiFi.begin(SECRET_SSID, SECRET_PASS);
    delay(1000);
  }

  // Print IP address once connected:
  Serial.print("Connected. My IP address: ");
  Serial.println(WiFi.localIP());

  // LED for wifi connection:
  wifiState = HIGH;
  digitalWrite(wifiLED, wifiState);

  }