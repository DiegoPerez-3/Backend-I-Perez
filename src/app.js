import express from "express";
import http from "http";
import { Server } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

// Importación de routers
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

// Middlewares para procesar JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración del motor de plantillas Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Configuración de la carpeta pública para archivos estáticos (JS, CSS)
app.use(express.static(path.join(__dirname, "public")));

// Compartimos la instancia de Socket.io en el app para usarla en los routers de la API HTTP
app.set("io", io);

// Health check para verificar el estado de la app
app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

// Rutas de la API de backend
app.use(`${BASE_ROUTE}/products`, productRouter);
app.use(`${BASE_ROUTE}/carts`, cartRouter);

// Rutas para las vistas del frontend
app.use("/", viewsRouter);

// Configuración de eventos de WebSockets
io.on("connection", async (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    // Enviamos los productos iniciales al cliente que se acaba de conectar
    try {
        const products = await productManager.getProducts();
        socket.emit("products_initial", products);
    } catch (error) {
        console.error("Error al enviar productos iniciales por socket:", error.message);
    }

    // Escuchamos cuando un cliente quiere agregar un nuevo producto por Websockets
    socket.on("add_product", async (productData) => {
        try {
            await productManager.addProduct(productData);
            // Obtenemos la lista actualizada y se la emitimos a todos los clientes conectados
            const updatedProducts = await productManager.getProducts();
            io.emit("products_updated", updatedProducts);
        } catch (error) {
            console.error("Error al agregar producto desde Websocket:", error.message);
            socket.emit("error_message", error.message);
        }
    });

    // Escuchamos cuando un cliente quiere eliminar un producto por Websockets
    socket.on("delete_product", async (productId) => {
        try {
            await productManager.deleteProduct(productId);
            // Obtenemos la lista actualizada y se la emitimos a todos los clientes conectados
            const updatedProducts = await productManager.getProducts();
            io.emit("products_updated", updatedProducts);
        } catch (error) {
            console.error("Error al eliminar producto desde Websocket:", error.message);
            socket.emit("error_message", error.message);
        }
    });

    socket.on("disconnect", () => {
        console.log(`Cliente desconectado: ${socket.id}`);
    });
});

// Exportamos el servidor HTTP configurado con Socket.io
export default httpServer;

