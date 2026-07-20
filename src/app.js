import express from "express";
import http from "http";
import { Server } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

// Importación de la conexión a MongoDB y routers
import connectMongo from "./connectors/mongo.connection.js";
import productRouter from "./routes/products.routes.js";
import cartRouter from "./routes/carts.routes.js";
import viewsRouter from "./routes/views.router.js";
import ProductManager from "./managers/ProductManager.js";

// Obtener __dirname en entorno de módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

const productManager = new ProductManager();
const BASE_ROUTE = "/api";

// Conectar a la base de datos de MongoDB
connectMongo();

// Middlewares para procesar JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración del motor de plantillas Handlebars con helpers personalizados
app.engine(
    "handlebars",
    engine({
        helpers: {
            // Helper para comparar valores en plantillas (ej: selectores en filtros)
            eq: (a, b) => String(a) === String(b)
        }
    })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Configuración de la carpeta pública para archivos estáticos (JS, CSS)
app.use(express.static(path.join(__dirname, "public")));

// Compartimos la instancia de Socket.io en la app para emitir desde los routers de la API
app.set("io", io);

// Health check para verificar el estado de la app
app.get("/health", (req, res) => {
    res.json({ status: "OK", database: "MongoDB Connected" });
});

// Rutas de la API de backend
app.use(`${BASE_ROUTE}/products`, productRouter);
app.use(`${BASE_ROUTE}/carts`, cartRouter);

// Rutas para las vistas del frontend
app.use("/", viewsRouter);

// Configuración de eventos de WebSockets
io.on("connection", async (socket) => {
    console.log(`Cliente conectado a WebSocket: ${socket.id}`);

    // Enviamos los productos iniciales al cliente conectado
    try {
        const result = await productManager.getProducts({ limit: 100 });
        socket.emit("products_initial", result.payload);
    } catch (error) {
        console.error("Error al enviar productos iniciales por socket:", error.message);
    }

    // Escuchamos cuando un cliente crea un producto desde Websockets
    socket.on("add_product", async (productData) => {
        try {
            await productManager.addProduct(productData);
            const updatedResult = await productManager.getProducts({ limit: 100 });
            io.emit("products_updated", updatedResult.payload);
        } catch (error) {
            console.error("Error al agregar producto desde Websocket:", error.message);
            socket.emit("error_message", error.message);
        }
    });

    // Escuchamos cuando un cliente elimina un producto desde Websockets
    socket.on("delete_product", async (productId) => {
        try {
            await productManager.deleteProduct(productId);
            const updatedResult = await productManager.getProducts({ limit: 100 });
            io.emit("products_updated", updatedResult.payload);
        } catch (error) {
            console.error("Error al eliminar producto desde Websocket:", error.message);
            socket.emit("error_message", error.message);
        }
    });

    socket.on("disconnect", () => {
        console.log(`Cliente desconectado de WebSocket: ${socket.id}`);
    });
});

export default httpServer;
