# Entrega Final - Curso de Programación Backend I

Este proyecto consiste en el desarrollo del backend completo para una aplicación de **e-commerce**, construida sobre **Node.js**, **Express**, **MongoDB** y **Mongoose**. Incluye persistencia de datos profesional en la nube/local, motor de plantillas **Handlebars** con renderizado híbrido y comunicación bidireccional en tiempo real mediante **Socket.io**.

---

## 🛠️ Tecnologías Utilizadas

*   **Node.js**: Entorno de ejecución de JavaScript.
*   **Express**: Framework web para la construcción de la API REST y servidor de vistas.
*   **MongoDB & Mongoose**: Base de datos NoSQL y ODM para el modelado y la persistencia de datos.
*   **mongoose-paginate-v2**: Plugin para paginación profesional de consultas de productos.
*   **Express-Handlebars**: Motor de plantillas para vistas renderizadas del lado del servidor (SSR).
*   **Socket.io**: WebSockets para sincronización de catálogo en tiempo real.
*   **dotenv**: Gestión de variables de entorno de manera segura.

---

## 📂 Estructura del Proyecto

```text
├── src/
│   ├── config/
│   │   └── index.js                   # Configuración global y variables de entorno
│   ├── connectors/
│   │   └── mongo.connection.js        # Conexión a MongoDB y autosembrado de productos
│   ├── managers/
│   │   ├── CartManager.js             # Lógica de negocio para carritos
│   │   └── ProductManager.js          # Lógica de negocio para productos (paginación, filtros)
│   ├── models/
│   │   ├── cart.model.js              # Esquema de carritos con referencias ObjectId (Product)
│   │   └── product.model.js           # Esquema de productos con plugin de paginación
│   ├── public/
│   │   ├── css/styles.css             # Estilos CSS globales y responsive
│   │   └── js/
│   │       ├── cartClient.js          # Lógica cliente para interacción con el carrito
│   │       └── realtime.js            # Cliente Socket.io para actualización en tiempo real
│   ├── routes/
│   │   ├── carts.routes.js            # Endpoints de la API de carritos
│   │   ├── products.routes.js         # Endpoints de la API de productos
│   │   └── views.router.js            # Router exclusivo para renderizar vistas Handlebars
│   └── views/
│       ├── layouts/
│       │   └── main.handlebars        # Layout principal de la aplicación
│       ├── cart.handlebars            # Vista de un carrito específico con productos populados
│       ├── home.handlebars            # Vista de catálogo estático
│       ├── productDetail.handlebars   # Vista extendida de un producto seleccionado
│       ├── products.handlebars        # Vista de catálogo paginado con filtros y ordenamiento
│       └── realTimeProducts.handlebars# Vista interactiva con WebSockets
├── .env.example
├── package.json
├── README.md
└── server.js
```

---

## 🚀 Requisitos Previos e Instalación

### Requisitos
- **Node.js** (versión 18 o superior recomendada)
- **npm** o **yarn**
- Instancia de **MongoDB** (Local en `127.0.0.1:27017` o una cuenta en **MongoDB Atlas**).

### Pasos de Instalación
1. Clona o descarga este repositorio.
2. Abre una terminal en la carpeta raíz del proyecto.
3. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
4. Configura el archivo de variables de entorno `.env` en la raíz (puedes guiarte con `.env.example`):
   ```env
   PORT=8080
   MONGO_URI=mongodb://127.0.0.1:27017/coderhouse_ecommerce
   ```
   *(Para usar MongoDB Atlas, reemplaza `MONGO_URI` con la cadena de conexión correspondiente).*

---

## 💻 Modo de Ejecución

### Producción / Normal
```bash
npm start
```

### Desarrollo (Con recarga en caliente `--watch`)
```bash
npm run dev
```

El servidor iniciará en `http://localhost:8080`.

> **Nota:** La primera vez que el servidor se conecte a una base de datos vacía, **se sembrarán automáticamente 12 productos de prueba** para facilitar la visualización inmediata del catálogo.

---

## 🌐 Vistas Disponibles (Frontend)

*   `GET /` / `GET /products`: Catálogo interactivo de productos con **paginación visual** (Anterior / Siguiente), formulario de búsqueda/filtro por categoría o disponibilidad, y selector de ordenamiento por precio.
*   `GET /products/:pid`: Vista detallada del producto con descripción completa, stock, precio y botón para agregar unidades al carrito.
*   `GET /carts/:cid`: Vista específica del carrito de compras donde se listan únicamente los productos pertenecientes al carrito (desglosados mediante `populate`), con su subtotal por ítem y el total general.
*   `GET /realtimeproducts`: Panel interactivo sincronizado en tiempo real con WebSockets para agregar o eliminar productos instantáneamente.

---

## 📡 Referencia de la API REST

### 1. Productos (`/api/products`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| **GET** | `/api/products` | Devuelve los productos paginados (`limit`, `page`, `sort`, `query`). Respuesta estructurada con `payload`, `totalPages`, `prevLink`, `nextLink`, etc. |
| **GET** | `/api/products/:pid` | Obtiene el detalle completo de un producto por su `ObjectId`. |
| **POST** | `/api/products` | Crea un nuevo producto y notifica por WebSockets. |
| **PUT** | `/api/products/:pid` | Actualiza un producto existente por su ID. |
| **DELETE** | `/api/products/:pid` | Elimina un producto de la base de datos. |

#### Ejemplo de Respuesta `GET /api/products`:
```json
{
  "status": "success",
  "payload": [...],
  "totalPages": 2,
  "prevPage": null,
  "nextPage": 2,
  "page": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevLink": null,
  "nextLink": "/api/products?limit=10&page=2"
}
```

---

### 2. Carritos (`/api/carts`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| **POST** | `/api/carts` | Crea un nuevo carrito vacío en MongoDB. |
| **GET** | `/api/carts/:cid` | Devuelve el carrito desglosando la información de cada producto mediante `populate`. |
| **POST** | `/api/carts/:cid/product/:pid` | Agrega un producto al carrito o incrementa su cantidad. |
| **DELETE** | `/api/carts/:cid/products/:pid` | Elimina un producto específico del carrito. |
| **PUT** | `/api/carts/:cid` | Reemplaza la lista entera de productos por el arreglo enviado en el `req.body`. |
| **PUT** | `/api/carts/:cid/products/:pid` | Actualiza únicamente la cantidad del producto especificado (`{ "quantity": 5 }`). |
| **DELETE** | `/api/carts/:cid` | Vacía todos los productos del carrito. |

---

## 📝 Autor
Desarrollado para el curso de **Programación Backend I - CoderHouse**.
