# Primera Entrega - Curso de Programación Backend I: Desarrollo Avanzado de Backend

Este proyecto consiste en el desarrollo de un servidor basado en **Node.js** y **Express** para la gestión de productos y carritos de compras de un e-commerce. Los datos se persisten localmente utilizando archivos de texto en formato JSON.

---

## Estructura del Proyecto

La arquitectura del proyecto sigue el patrón de diseño y estructura recomendada por la cátedra:

```text
├── data/
│   ├── carts.json
│   └── products.json
├── src/
│   ├── managers/
│   │   ├── CartManager.js
│   │   └── ProductManager.js
│   ├── routes/
│   │   ├── carts.routes.js
│   │   └── products.routes.js
│   ├── utils/
│   │   ├── checkFile.js
│   │   └── paths.js
│   └── app.js
├── .gitignore
├── package.json
├── README.md
└── server.js
```

---

## Requisitos Previos

- **Node.js** (versión 14 o superior recomendada)
- **npm** (versión 6 o superior recomendada)

---

## Instalación

1. Clona este repositorio o descarga los archivos.
2. Abre una terminal en la raíz del proyecto.
3. Instala las dependencias necesarias ejecutando:

```bash
npm install
```

*(Nota para Windows: Si tienes problemas de políticas de ejecución al ejecutar comandos de npm en PowerShell, puedes usar `cmd /c npm install`)*.

---

## Ejecución

El servidor escucha por defecto en el puerto **8080**.

### Modo Producción
Para iniciar el servidor en modo normal:
```bash
npm start
```

### Modo Desarrollo
Para iniciar el servidor con recarga automática en cambios (utilizando el flag `--watch` de Node.js):
```bash
npm run dev
```

---

## Endpoints del Servidor

### 1. Gestión de Productos (`/api/products`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| **GET** | `/api/products` | Lista todos los productos. Soporta el query parameter `?limit=N` para limitar los resultados. |
| **GET** | `/api/products/:pid` | Obtiene el detalle del producto con el ID especificado. |
| **POST** | `/api/products` | Crea un nuevo producto (el `id` se autogenera). |
| **PUT** | `/api/products/:pid` | Actualiza un producto existente por sus campos enviados en el body (sin alterar el `id`). |
| **DELETE** | `/api/products/:pid` | Elimina el producto con el ID especificado. |

#### Formato para Crear/Actualizar Producto (POST / PUT)
```json
{
  "title": "Teclado Mecánico RGB",
  "description": "Teclado con switches red y retroiluminación configurable",
  "code": "KB-301",
  "price": 95.00,
  "status": true,
  "stock": 20,
  "category": "accesorios",
  "thumbnails": [
    "https://ejemplo.com/teclado1.jpg"
  ]
}
```

---

### 2. Gestión de Carritos (`/api/carts`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| **POST** | `/api/carts` | Crea un nuevo carrito vacío (el `id` se autogenera). |
| **GET** | `/api/carts/:cid` | Retorna el listado de productos pertenecientes al carrito con el ID especificado. |
| **POST** | `/api/carts/:cid/product/:pid` | Agrega un producto a un carrito específico (agrega de a 1 unidad. Si ya existe, incrementa la cantidad). |

#### Formato del Objeto de Retorno para los Productos en Carritos
```json
[
  {
    "product": "prod_1717900000000",
    "quantity": 3
  }
]
```

---

## Pruebas de Funcionamiento

Puedes probar todos los endpoints utilizando clientes HTTP como **Postman**, **Insomnia** o la extensión **Thunder Client** en VS Code. No se requiere ninguna interfaz gráfica.
