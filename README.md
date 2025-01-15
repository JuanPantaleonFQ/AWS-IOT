
#  AWS IoT Solution for sleep quality tracking

**Welcome to the Sleep Quality Monitoring System project!** This innovative solution leverages the power of the Internet of Things (IoT) to track, analyze, and improve sleep quality by gathering real-time data from various sensors. By monitoring key factors such as temperature, humidity, motion, and light, this system offers valuable insights into how your environment can affect your sleep.







# Installation

To get started with the project, follow these steps:

### Prerequisites:
* Node.js (for server-side code)
* AWS Account with IoT Core setup (follow the next link for the [AWS policies](https://docs.aws.amazon.com/iot/latest/developerguide/example-iot-policies.html))
 * Watch this instalation video ->  [AWS tutorial setup](https://www.youtube.com/watch?v=kPLafcrng-c))
* Raspberry Pi or Arduino for sensor data collection

### Installation Steps:
- **Hardware**: Raspberry Pi, Arduino (with sensors), sensors (DHT22, PIR, LDR, TMP36, Oxygen Saturation sensor).
- **Software**: Node.js, Python, Arduino IDE, AWS account (with IoT Core, IAM, Lambda, SQS, RDS services configured).
- **Libraries**: AWS SDK for Node.js, MQTT library, Adafruit DHT sensor library for Arduino, AWS IoT SDK for Python.




### Clone the repository:
   ```bash
   git clone https://github.com/JuanPantaleonFQ/AWS-IOT
   ``` 
## Step 1: Sensor Setup

### 1.1 Sensor Wiring and Connections

### Connection Guide
- **Temperature and Humidity Sensor (DHT22)**  
  Data pin to GPIO 4 (Pin 7)  
  Power (VCC) to 3.3V (Pin 1)  
  Ground (GND) to Pin 6

- **Light Sensor (Photoresistor with ADC)**  
  Connect ADC module output (DO) to GPIO 17 (Pin 11)  
  VCC to 3.3V (Pin 1)  
  GND to Pin 9

- **Motion Sensor (PIR)**  
  Signal pin to GPIO 27 (Pin 13)  
  VCC to 5V (Pin 2)  
  GND to Pin 14



- **DHT22 (Temperature & Humidity Sensor)**: Connect the VCC and GND pins to the Raspberry Pi's 3.3V and GND pins. The data pin should be connected to one of the GPIO pins.
- **PIR Motion Sensor**: Connect the VCC and GND pins to the Raspberry Pi's 5V and GND pins. The signal pin goes to a GPIO pin on the Raspberry Pi.
- **LDR (Light Dependent Resistor)**: Connect the LDR to the Raspberry Pi with a voltage divider circuit for accurate readings.
- **TMP36 (Temperature Sensor)**: Connect this sensor to the Raspberry Pi's analog-to-digital converter (ADC), or use a GPIO pin with an external ADC.
- **Oxygen Saturation Sensor (Optional)**: This sensor can be connected to the Raspberry Pi through a simple GPIO pin interface.

### 1.2 Arduino code

After connecting the sensors, upload the **`arduinoSerialScript.c++`** code to the Arduino. The script will handle reading the data from the sensors and send it to the Raspberry Pi via serial communication.

### Step 2: Raspberry Pi Setup

This guide covers setting up your Raspberry Pi for sensor data collection, integration with AWS IoT Core, and running the necessary Python scripts to monitor sleep quality.



## 2. Arduino Setup

Upload the Arduino code to read and transmit sensor data. Use `arduinoSerialScript.c++` provided in the repository.

---



### Python and Library Installation

Update the system and install Python with necessary libraries.

```bash
sudo apt update
sudo apt install python3 python3-pip
sudo pip3 install AWSIoTPythonSDK paho-mqtt

```

## Tech Stack

**Client:** HTML, CSS, JavaScript

[![My Skills](https://skillicons.dev/icons?i=html,css,js)](https://skillicons.dev)

**Server:** Node.js, Express.js, AWS IoT Core, MQTT

[![My Skills](https://skillicons.dev/icons?i=nodejs,dynamodb,express,mysql,aws-ec2,mqtt)](https://skillicons.dev)

**Deployment:** AWS EC2, AWS RDS, AWS Lambda, AWS SQS

[![My Skills](https://skillicons.dev/icons?i=bash,aws,webpack)](https://skillicons.dev)


## Authors

- [@JuanPantaleonFq](https://www.github.com/JuanPantaleonFq)


## Feedback

If you have any feedback, please reach out to me at [linkedin](https://www.linkedin.com/in/juan-pantale%C3%B3n-femen%C3%ADa-quevedo-18a5a8198/ ) or send me an email juanfemeniaquevedo@gmail.com

