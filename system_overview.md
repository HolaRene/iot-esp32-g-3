# 🌐 Resumen del Sistema IoT Flexi

Este documento proporciona una visión general simple y clara de nuestro sistema de monitoreo IoT, diseñado para ser entendido por cualquier persona, independientemente de su conocimiento técnico.

## ¿Qué es este sistema?

Nuestro sistema es una plataforma web inteligente que permite monitorear y gestionar sensores en tiempo real. Imagina tener un "centro de control" donde puedes ver qué está pasando en diferentes lugares (como una oficina, una fábrica o un campo de cultivo) sin tener que estar allí físicamente.

El sistema recibe información de pequeños dispositivos electrónicos y te la muestra de forma bonita y fácil de entender en tu computadora o celular.

## 🏗️ ¿Cómo está construido? (Tecnología)

Para que todo esto funcione de manera rápida y segura, utilizamos tecnologías modernas:

### 1. El Cerebro (API) 🧠
Utilizamos una **API creada en Express con TypeScript**.
*   **¿Qué significa?**: Es el intermediario que recibe los datos de los sensores y los organiza. Es como un recepcionista muy eficiente que habla el idioma de las máquinas y el de los humanos.
*   **¿Por qué es bueno?**: TypeScript nos ayuda a que el código sea más seguro y tenga menos errores, garantizando que el sistema no se "caiga" fácilmente.

### 2. La Cara del Sistema (Frontend) 💻
La página web que tú ves está construida con **Next.js**.
*   Es una tecnología muy rápida que hace que navegar por el sistema se sienta fluido, como usar una aplicación en tu teléfono.

### 3. Los Ojos y Oídos (Dispositivos) 👁️
Utilizamos dispositivos **ESP32**.
*   Son pequeños chips muy potentes y económicos que se conectan a internet.
*   **Sensores de Seguridad y PIR**: Estos dispositivos están equipados con sensores de movimiento (PIR) y seguridad. Pueden detectar si alguien entra a una habitación, si se abre una puerta, o si hay movimiento donde no debería haberlo.

### 4. La Memoria (Base de Datos) 🗄️
Todos los datos se guardan en **Supabase**. Es nuestra "bóveda" segura en la nube donde se almacena todo el historial de lo que han detectado los sensores.

---

## 🛣️ Rutas Principales del Sistema

Para que los dispositivos "hablen" con nuestro sistema, utilizan caminos específicos llamados "rutas". Aquí están las más importantes:

### 1. Enviar Datos (`POST`)
*   **Ruta**: `/sensors/:id/data`
*   **Función**: Esta es la ruta que usan los dispositivos ESP32 para decir: *"¡Hey! Acabo de detectar algo"*. Por ejemplo, si un sensor de movimiento detecta a una persona, envía un mensaje a esta dirección con la información.

### 2. Consultar Estado (`GET`)
*   **Ruta**: `/sensors/:id`
*   **Función**: Esta ruta la usamos nosotros o el sistema para preguntar: *"¿Cómo estás, sensor?"*. Nos devuelve la información actual del dispositivo, como su nombre, si está activo o inactivo, y su configuración.

---

## ✨ Resumen
Tenemos un sistema robusto y moderno que combina hardware inteligente (**ESP32**) con software de última generación (**Express, TypeScript, Next.js**) para brindarte seguridad y control total sobre tus espacios.
