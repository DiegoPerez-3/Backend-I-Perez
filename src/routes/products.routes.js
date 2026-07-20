import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const productRouter = Router();
const manager = new ProductManager();

// GET /api/products -> listar productos con paginación, filtros y ordenamiento
productRouter.get("/", async (req, res) => {
    try {
        const { limit, page, sort, query } = req.query;
        
        // Generamos la URL base dinámica para construir prevLink y nextLink
        const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

        const result = await manager.getProducts({ limit, page, sort, query, baseUrl });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

// GET /api/products/:pid -> obtener un producto por su ID
productRouter.get("/:pid", async (req, res) => {
    try {
        const product = await manager.getProductById(req.params.pid);

        if (!product) {
            return res.status(404).json({
                status: "error",
                message: "Producto no encontrado"
            });
        }

        res.status(200).json({
            status: "success",
            data: product
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

// POST /api/products -> crear un nuevo producto
productRouter.post("/", async (req, res) => {
    try {
        const { title, description, code, price, stock, category } = req.body;

        // Validaciones básicas de campos obligatorios
        if (!title || !description || !code || price === undefined || stock === undefined || !category) {
            return res.status(400).json({
                status: "error",
                message: "Todos los campos son obligatorios excepto thumbnails (title, description, code, price, stock, category)"
            });
        }

        const product = await manager.addProduct(req.body);

        // Notificamos la actualización vía WebSockets si io está disponible
        const io = req.app.get("io");
        if (io) {
            const productsResult = await manager.getProducts({ limit: 100 });
            io.emit("products_updated", productsResult.payload);
        }

        res.status(201).json({
            status: "success",
            data: product
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
});

// PUT /api/products/:pid -> actualizar un producto existente
productRouter.put("/:pid", async (req, res) => {
    try {
        const product = await manager.updateProduct(req.params.pid, req.body);

        if (!product) {
            return res.status(404).json({
                status: "error",
                message: "Producto no encontrado"
            });
        }

        // Notificamos la actualización vía WebSockets
        const io = req.app.get("io");
        if (io) {
            const productsResult = await manager.getProducts({ limit: 100 });
            io.emit("products_updated", productsResult.payload);
        }

        res.status(200).json({
            status: "success",
            data: product
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
});

// DELETE /api/products/:pid -> eliminar un producto
productRouter.delete("/:pid", async (req, res) => {
    try {
        const deletedProduct = await manager.deleteProduct(req.params.pid);

        if (!deletedProduct) {
            return res.status(404).json({
                status: "error",
                message: "Producto no encontrado"
            });
        }

        // Notificamos la actualización vía WebSockets
        const io = req.app.get("io");
        if (io) {
            const productsResult = await manager.getProducts({ limit: 100 });
            io.emit("products_updated", productsResult.payload);
        }

        res.status(200).json({
            status: "success",
            message: `Producto con código ${deletedProduct.code} eliminado correctamente`,
            data: deletedProduct
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
});

export default productRouter;
