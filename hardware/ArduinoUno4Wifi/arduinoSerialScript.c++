// Include the DHT11 library for interfacing with the sensor.
#include <DHT11.h>

// Create an instance of the DHT11 class.
DHT11 dht11(3);  // Assuming DHT11 is connected to digital pin 3

// Motion sensor and analog sensor pin definitions
int motionPin = 2;        // Pin connected to PIR motion sensor (D2)
int analogSensorPin = A0; // Pin connected to the analog sensor light (A0)

// Variables to store cumulative sensor data for averaging
int totalTemperature = 0;
int totalHumidity = 0;
int totalAnalogSensorValue = 0;
int motionCount = 0;

// Number of readings per cycle
const int readingsPerCycle = 3;

void setup() {
    // Initialize serial communication for debugging and reading sensor values.
    Serial.begin(115200);
    
    // Initialize the motion sensor pin as input
    pinMode(motionPin, INPUT);
}

void loop() {
    // Reset cumulative variables at the start of each cycle
    totalTemperature = 0;
    totalHumidity = 0;
    totalAnalogSensorValue = 0;
    motionCount = 0;

    for (int i = 0; i < readingsPerCycle; i++) {
        int temperature = 0;
        int humidity = 0;
        int result = dht11.readTemperatureHumidity(temperature, humidity);
        int motionState = digitalRead(motionPin);
        int analogSensorValue = analogRead(analogSensorPin);

        // If reading was successful, accumulate the values
        if (result == 0) {
            totalTemperature += temperature;
            totalHumidity += humidity;
            totalAnalogSensorValue += analogSensorValue;
            if (motionState == HIGH) {
                motionCount++;
            }
        } else {
            Serial.println(DHT11::getErrorString(result));
        }

        delay(20000);  // Wait 20 seconds between readings
    }

    // Calculate averages
    int averageTemperature = totalTemperature / readingsPerCycle;
    int averageHumidity = totalHumidity / readingsPerCycle;
    int averageAnalogSensorValue = totalAnalogSensorValue / readingsPerCycle;
    bool motionDetected = (motionCount >= 2 );  // Motion detected if any readings had motion

    // Send the averaged data in JSON-like format
    
    Serial.println(averageTemperature);   
    Serial.println(averageHumidity);  
    Serial.println(motionDetected ? "true" : "false");    
    Serial.println(averageAnalogSensorValue);


    delay(60000 - (readingsPerCycle * 20000));  // Wait the remaining time in the minute
   
}
