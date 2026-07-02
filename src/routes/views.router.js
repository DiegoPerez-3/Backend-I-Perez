import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const viewsRouter = Router();
const manager = new ProductManager();

// GET / -> renderiza la vista de inicio (home.handlebars) con la lista de productos
viewsRouter.get("/", async (req, res) => {
    try {
        const products = await manager.getProducts();
        res.render("home", {
            title: "Catálogo de Productos - CoderHouse",
            products: products
        });
    } catch (error) {
        console.error("Error al renderizar home:", error.message);
        res.status(500).render("home", {
            title: "Catálogo de Productos - CoderHouse",
            products: [],
            error: "No se pudieron cargar los productos."
        });
    }
});

// GET /realtimeproducts -> renderiza la vista en tiempo real (realTimeProducts.handlebars)
viewsRouter.get("/realtimeproducts", async (req, res) => {
    try {
        const products = await manager.getProducts();
        res.render("realTimeProducts", {
            title: "Productos en Tiempo Real - Sockets",
            products: products
        });
    } catch (error) {
        console.error("Error al renderizar realTimeProducts:", error.message);
        res.status(500).render("realTimeProducts", {
            title: "Productos en Tiempo Real - Sockets",
            products: [],
            error: "No se pudieron cargar los productos en tiempo real."
        });
    }
});

export default viewsRouter;
