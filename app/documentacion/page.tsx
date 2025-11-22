"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Check, Download, ExternalLink, Code2, Cpu, Zap } from "lucide-react"
import { useState } from "react"

export default function DocumentacionPage() {
    const [copied, setCopied] = useState("")

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(""), 2000)
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">📚 Documentación de Integración</h1>
                <p className="text-lg text-muted-foreground">
                    Aprende a conectar tus sensores ESP32, Arduino, Raspberry Pi y otros microcontroladores a la plataforma IoT.
                </p>
            </div>

            {/* Quick Start */}
            <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-2 border-blue-200 dark:border-blue-800">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-blue-600" />
                    Inicio Rápido
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
                        <h3 className="font-semibold mb-2">Crea tu Sensor</h3>
                        <p className="text-sm text-muted-foreground">Registra un nuevo sensor en la plataforma y obtén tu ID y API Key</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 mb-2">2</div>
                        <h3 className="font-semibold mb-2">Configura tu Código</h3>
                        <p className="text-sm text-muted-foreground">Copia el ejemplo para tu plataforma y actualiza las credenciales</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
                        <h3 className="font-semibold mb-2">¡Listo!</h3>
                        <p className="text-sm text-muted-foreground">Sube el código y observa tus datos en tiempo real</p>
                    </div>
                </div>
            </Card>

            {/* API Configuration */}
            <Card className="p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">🔑 Configuración de la API</h2>
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">URL de la API</label>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                                    api-iot-control.up.railway.app
                                </code>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard("api-iot-control.up.railway.app", "api-url")}
                                >
                                    {copied === "api-url" ? <Check size={16} /> : <Copy size={16} />}
                                </Button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Endpoint</label>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                                    /api/v1/esp32/data
                                </code>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard("/api/v1/esp32/data", "endpoint")}
                                >
                                    {copied === "endpoint" ? <Check size={16} /> : <Copy size={16} />}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                        <p className="text-sm">
                            <strong>⚠️ Importante:</strong> Obtén tu <code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">API Key</code> y{" "}
                            <code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">Sensor ID</code> desde la configuración de tu sensor en la plataforma.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Code Examples */}
            <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">💻 Ejemplos de Código</h2>

                <Tabs defaultValue="esp32-ambiental" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-6">
                        <TabsTrigger value="esp32-ambiental">ESP32 Ambiental</TabsTrigger>
                        <TabsTrigger value="esp32-energia">ESP32 Energía</TabsTrigger>
                        <TabsTrigger value="arduino">Arduino</TabsTrigger>
                        <TabsTrigger value="raspberry">Raspberry Pi</TabsTrigger>
                        <TabsTrigger value="json">Formato JSON</TabsTrigger>
                    </TabsList>

                    {/* ESP32 Ambiental */}
                    <TabsContent value="esp32-ambiental" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">ESP32 - Sensor Ambiental (DHT22)</h3>
                                <p className="text-sm text-muted-foreground">Temperatura, Humedad, Presión y Clima</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(esp32AmbientalCode, "esp32-amb")}
                            >
                                {copied === "esp32-amb" ? <Check size={16} /> : <Copy size={16} />}
                                <span className="ml-2">Copiar Código</span>
                            </Button>
                        </div>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                            <code>{esp32AmbientalCode}</code>
                        </pre>
                        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">📦 Librerías Necesarias</h4>
                            <ul className="text-sm space-y-1">
                                <li>• DHTesp (para sensor DHT22)</li>
                                <li>• WiFi (incluida en ESP32)</li>
                                <li>• WiFiClientSecure (para HTTPS)</li>
                                <li>• ArduinoJson (v6+)</li>
                            </ul>
                        </div>
                    </TabsContent>

                    {/* ESP32 Energía */}
                    <TabsContent value="esp32-energia" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">ESP32 - Sensor de Energía</h3>
                                <p className="text-sm text-muted-foreground">Voltaje, Corriente y Potencia</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(esp32EnergiaCode, "esp32-ene")}
                            >
                                {copied === "esp32-ene" ? <Check size={16} /> : <Copy size={16} />}
                                <span className="ml-2">Copiar Código</span>
                            </Button>
                        </div>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                            <code>{esp32EnergiaCode}</code>
                        </pre>
                    </TabsContent>

                    {/* Arduino */}
                    <TabsContent value="arduino" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Arduino con WiFi Shield</h3>
                                <p className="text-sm text-muted-foreground">Compatible con Arduino Uno + WiFi Shield o Arduino MKR WiFi</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(arduinoCode, "arduino")}
                            >
                                {copied === "arduino" ? <Check size={16} /> : <Copy size={16} />}
                                <span className="ml-2">Copiar Código</span>
                            </Button>
                        </div>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                            <code>{arduinoCode}</code>
                        </pre>
                    </TabsContent>

                    {/* Raspberry Pi */}
                    <TabsContent value="raspberry" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Raspberry Pi - Python</h3>
                                <p className="text-sm text-muted-foreground">Script Python para enviar datos desde Raspberry Pi</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(raspberryCode, "raspberry")}
                            >
                                {copied === "raspberry" ? <Check size={16} /> : <Copy size={16} />}
                                <span className="ml-2">Copiar Código</span>
                            </Button>
                        </div>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                            <code>{raspberryCode}</code>
                        </pre>
                        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">🐍 Instalación</h4>
                            <code className="text-sm bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                                pip install requests Adafruit-DHT
                            </code>
                        </div>
                    </TabsContent>

                    {/* JSON Format */}
                    <TabsContent value="json" className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Formato JSON de la API</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Estructura de datos que la API espera recibir
                            </p>
                        </div>
                        <div className="space-y-4">
                            {jsonExamples.map((example, idx) => (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge>{example.categoria}</Badge>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(example.json, `json-${idx}`)}
                                        >
                                            {copied === `json-${idx}` ? <Check size={14} /> : <Copy size={14} />}
                                        </Button>
                                    </div>
                                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                                        <code>{example.json}</code>
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </Card>

            {/* Troubleshooting */}
            <Card className="p-6 mt-8">
                <h2 className="text-2xl font-bold mb-4">🔧 Solución de Problemas</h2>
                <div className="space-y-4">
                    <div className="border-l-4 border-red-500 pl-4">
                        <h3 className="font-semibold">Error de conexión a la API</h3>
                        <p className="text-sm text-muted-foreground">Verifica que tu API Key y Sensor ID sean correctos. Asegúrate de que el sensor esté activo en la plataforma.</p>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-4">
                        <h3 className="font-semibold">Datos no aparecen en tiempo real</h3>
                        <p className="text-sm text-muted-foreground">Verifica que la categoría del sensor coincida con el tipo de datos que estás enviando.</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-semibold">Error de certificado SSL</h3>
                        <p className="text-sm text-muted-foreground">En ESP32, usa <code className="bg-muted px-1 rounded">client.setInsecure()</code> para desarrollo. En producción, usa certificados válidos.</p>
                    </div>
                </div>
            </Card>
        </div>
    )
}

// ==================== CÓDIGO DE EJEMPLO ESP32 AMBIENTAL ====================
const esp32AmbientalCode = `#include "DHTesp.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// ==================== CONFIGURACIÓN WiFi ====================
const char* ssid = "TU_RED_WIFI";
const char* password = "TU_CONTRASEÑA";

// ==================== CONFIGURACIÓN API ====================
String API_HOST = "api-iot-control.up.railway.app";
String API_KEY = "tu-api-key-aqui";  // Obtén esto de la configuración del sensor
String SENSOR_ID = "tu-sensor-id-aqui";  // UUID del sensor

// ==================== HARDWARE ====================
const int DHT_PIN = 15;
DHTesp dhtSensor;
WiFiClientSecure client;

void setup() {
  Serial.begin(115200);
  dhtSensor.setup(DHT_PIN, DHTesp::DHT22);
  
  // Conectar WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\n✅ WiFi Conectado!");
  
  client.setInsecure();  // Para desarrollo
}

void loop() {
  TempAndHumidity data = dhtSensor.getTempAndHumidity();
  
  if (!isnan(data.temperature) && !isnan(data.humidity)) {
    enviarDatos(data.temperature, data.humidity);
  }
  
  delay(5000);  // Enviar cada 5 segundos
}

void enviarDatos(float temp, float hum) {
  if (!client.connect(API_HOST.c_str(), 443)) {
    Serial.println("❌ Error de conexión");
    return;
  }

  // Crear JSON
  StaticJsonDocument<256> doc;
  doc["sensor_id"] = SENSOR_ID;
  doc["categoria"] = "ambiental";
  
  JsonObject data = doc.createNestedObject("data");
  data["temperatura"] = temp;
  data["humedad"] = hum;
  data["presion"] = 1013.25;  // Valor de ejemplo
  data["clima"] = "soleado";
  
  String jsonData;
  serializeJson(doc, jsonData);
  
  // Enviar petición HTTP POST
  client.println("POST /api/v1/esp32/data HTTP/1.1");
  client.println("Host: " + API_HOST);
  client.println("x-api-key: " + API_KEY);
  client.println("Content-Type: application/json");
  client.print("Content-Length: ");
  client.println(jsonData.length());
  client.println();
  client.println(jsonData);
  
  // Leer respuesta
  while (client.connected()) {
    String line = client.readStringUntil('\\n');
    if (line == "\\r") break;
  }
  
  String response = client.readString();
  if (response.indexOf("\\"status\\":\\"ok\\"") > 0) {
    Serial.println("✅ Datos enviados");
  }
  
  client.stop();
}`;

// ==================== CÓDIGO ESP32 ENERGÍA ====================
const esp32EnergiaCode = `#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

const char* ssid = "TU_RED_WIFI";
const char* password = "TU_CONTRASEÑA";

String API_HOST = "api-iot-control.up.railway.app";
String API_KEY = "tu-api-key-aqui";
String SENSOR_ID = "tu-sensor-id-aqui";

// Pines para sensor de corriente y voltaje
const int VOLTAGE_PIN = 34;
const int CURRENT_PIN = 35;

WiFiClientSecure client;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  client.setInsecure();
}

void loop() {
  // Leer valores analógicos y convertir
  float voltaje = analogRead(VOLTAGE_PIN) * (220.0 / 4095.0);
  float corriente = analogRead(CURRENT_PIN) * (10.0 / 4095.0);
  float potencia = voltaje * corriente;
  
  enviarDatos(voltaje, corriente, potencia);
  delay(5000);
}

void enviarDatos(float v, float i, float p) {
  if (!client.connect(API_HOST.c_str(), 443)) return;
  
  StaticJsonDocument<256> doc;
  doc["sensor_id"] = SENSOR_ID;
  doc["categoria"] = "energia";
  
  JsonObject data = doc.createNestedObject("data");
  data["voltaje"] = v;
  data["corriente"] = i;
  data["potencia"] = p;
  
  String jsonData;
  serializeJson(doc, jsonData);
  
  client.println("POST /api/v1/esp32/data HTTP/1.1");
  client.println("Host: " + API_HOST);
  client.println("x-api-key: " + API_KEY);
  client.println("Content-Type: application/json");
  client.print("Content-Length: ");
  client.println(jsonData.length());
  client.println();
  client.println(jsonData);
  
  client.stop();
}`;

// ==================== CÓDIGO ARDUINO ====================
const arduinoCode = `#include <WiFi101.h>  // Para Arduino MKR WiFi
#include <ArduinoJson.h>

char ssid[] = "TU_RED_WIFI";
char pass[] = "TU_CONTRASEÑA";

String API_HOST = "api-iot-control.up.railway.app";
String API_KEY = "tu-api-key-aqui";
String SENSOR_ID = "tu-sensor-id-aqui";

WiFiSSLClient client;

void setup() {
  Serial.begin(9600);
  
  // Conectar WiFi
  while (WiFi.begin(ssid, pass) != WL_CONNECTED) {
    delay(1000);
  }
  Serial.println("WiFi conectado");
}

void loop() {
  // Leer sensor (ejemplo con sensor analógico)
  int sensorValue = analogRead(A0);
  float temperatura = sensorValue * (100.0 / 1023.0);
  
  enviarDatos(temperatura);
  delay(10000);
}

void enviarDatos(float temp) {
  if (client.connect(API_HOST.c_str(), 443)) {
    StaticJsonDocument<256> doc;
    doc["sensor_id"] = SENSOR_ID;
    doc["categoria"] = "ambiental";
    
    JsonObject data = doc.createNestedObject("data");
    data["temperatura"] = temp;
    data["humedad"] = 50.0;
    data["presion"] = 1013.25;
    data["clima"] = "normal";
    
    String jsonData;
    serializeJson(doc, jsonData);
    
    client.println("POST /api/v1/esp32/data HTTP/1.1");
    client.println("Host: " + API_HOST);
    client.println("x-api-key: " + API_KEY);
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(jsonData.length());
    client.println();
    client.println(jsonData);
    
    client.stop();
  }
}`;

// ==================== CÓDIGO RASPBERRY PI ====================
const raspberryCode = `#!/usr/bin/env python3
import requests
import time
import Adafruit_DHT

# Configuración
API_HOST = "https://api-iot-control.up.railway.app"
API_KEY = "tu-api-key-aqui"
SENSOR_ID = "tu-sensor-id-aqui"

# Configuración del sensor DHT22
DHT_SENSOR = Adafruit_DHT.DHT22
DHT_PIN = 4  # GPIO 4

def enviar_datos(temperatura, humedad):
    url = f"{API_HOST}/api/v1/esp32/data"
    headers = {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
    }
    
    payload = {
        "sensor_id": SENSOR_ID,
        "categoria": "ambiental",
        "data": {
            "temperatura": temperatura,
            "humedad": humedad,
            "presion": 1013.25,
            "clima": "soleado"
        }
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            print("✅ Datos enviados correctamente")
        else:
            print(f"❌ Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Error de conexión: {e}")

def main():
    print("🚀 Iniciando sensor IoT en Raspberry Pi...")
    
    while True:
        # Leer sensor
        humedad, temperatura = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN)
        
        if humedad is not None and temperatura is not None:
            print(f"🌡️ Temp: {temperatura:.1f}°C | 💧 Hum: {humedad:.1f}%")
            enviar_datos(temperatura, humedad)
        else:
            print("❌ Error leyendo sensor")
        
        time.sleep(5)  # Esperar 5 segundos

if __name__ == "__main__":
    main()`;

// ==================== EJEMPLOS JSON ====================
const jsonExamples = [
    {
        categoria: "Ambiental",
        json: `{
  "sensor_id": "uuid-del-sensor",
  "categoria": "ambiental",
  "data": {
    "temperatura": 25.5,
    "humedad": 60.0,
    "presion": 1013.25,
    "clima": "soleado"
  }
}`
    },
    {
        categoria: "Calidad de Aire",
        json: `{
  "sensor_id": "uuid-del-sensor",
  "categoria": "calidad_aire",
  "data": {
    "co2": 450.0,
    "pm25": 12.5,
    "voc": 150.0
  }
}`
    },
    {
        categoria: "Energía",
        json: `{
  "sensor_id": "uuid-del-sensor",
  "categoria": "energia",
  "data": {
    "voltaje": 220.0,
    "corriente": 5.2,
    "potencia": 1144.0
  }
}`
    },
    {
        categoria: "Industrial",
        json: `{
  "sensor_id": "uuid-del-sensor",
  "categoria": "industrial",
  "data": {
    "vibracion": 3.5,
    "ruido": 75.0,
    "inclinacion": 2.1,
    "consumo": 850.0
  }
}`
    },
    {
        categoria: "Suelo",
        json: `{
  "sensor_id": "uuid-del-sensor",
  "categoria": "suelo",
  "data": {
    "humedad_suelo": 65.0,
    "ph": 6.8
  }
}`
    },
    {
        categoria: "Personalizado",
        json: `{
  "sensor_id": "uuid-del-sensor",
  "categoria": "personalizado",
  "data": {
    "datos": {
      "campo1": 123.45,
      "campo2": "valor",
      "campo3": true
    }
  }
}`
    }
]
