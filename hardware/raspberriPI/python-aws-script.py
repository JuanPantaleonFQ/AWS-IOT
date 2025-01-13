import serial
import time
import json
from datetime import datetime
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

# AWS IoT MQTT client configuration
myMQTTClient = AWSIoTMQTTClient("iotconsole-e6d4c225-2112-400f-8b0f-7936ba8f38e6")
myMQTTClient.configureEndpoint("a3cxdpguroquo1-ats.iot.eu-north-1.amazonaws.com", 8883)
myMQTTClient.configureCredentials(
    "/home/pi/AWS-IOT/AWSCertificates/keys/AmazonRootCA1.pem", 
    "/home/pi/AWS-IOT/AWSCertificates/keys/private.pem.key", 
    "/home/pi/AWS-IOT/AWSCertificates/keys/certificate.pem.crt"
)

myMQTTClient.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
myMQTTClient.configureDrainingFrequency(2)  # Draining: 2 Hz
myMQTTClient.configureConnectDisconnectTimeout(10)  # 10 sec
myMQTTClient.configureMQTTOperationTimeout(5)  # 5 sec

# Conectar a AWS IoT Core
print('Initiating Realtime Data Transfer From Raspberry Pi...')
if myMQTTClient.connect():
    print("Conection true")
    

# Inicializar la comunicación serial con Arduino
ser = serial.Serial('/dev/ttyACM0', 115200, timeout=1.0)
time.sleep(3)
ser.reset_input_buffer()
print("Serial responded.")

try:
    while True:
        time.sleep(0.05)
        if ser.in_waiting > 0:
            temperature = ser.readline().decode('utf-8').rstrip()
            humidity = ser.readline().decode('utf-8').rstrip()
            motion = ser.readline().decode('utf-8').rstrip()
            analog_sensor = ser.readline().decode('utf-8').rstrip()

            # Imprimir los valores crudos para depuración
            # print(f"Temperature: {temperature}, Humidity: {humidity}, Motion: {motion}, Analog Sensor: {analog_sensor}")
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Formatear los datos como payload JSON
            data = {
                "timestamp": current_time,
                "temperature": int(temperature),
                "humidity": int(humidity),
                "motion": motion.lower() == "true",
                "lux": int(analog_sensor)          
            }
           

            # Publicar los datos en AWS IoT Core
            payload = json.dumps(data)
            print(f"Publishing: {payload}")
            #result = myMQTTClient.publish(topic="home/sensor_data", QoS=0, payload=payload)
            myMQTTClient.publish(topic="home/sensor_data", QoS=0, payload=payload)            
               
except KeyboardInterrupt:
    print("Closing serial communication.")
    ser.close()
    myMQTTClient.disconnect()


