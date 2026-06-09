import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const productRouter = Router();
const manager = new ProductManager();

// GET /api/products -> listar todos los productos (con soporte para limit)
productRouter.get("/", async (req, res) => {
    try {
        let products = await manager.getProducts();
        const { limit } = req.query;

        if (limit) {
            const limitNum = parseInt(limit, 10);
            if (!isNaN(limitNum) && limitNum > 0) {
                products = products.slice(0, limitNum);
            }
        }

        res.status(200).json({
            status: "success",
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

// GET /api/products/:pid -> obtener un producto por id
productRouter.get("/:pid", async (req, res) => {
    try {
        const product = await manager.getProductById(req.params.pid);

        if (!product) {
            return res.status(404).json({
                status: "error",
                message: "Product not found",
            });
        }

        res.status(200).json({
            status: "success",
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
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
                message: "All fields are required except thumbnails (title, description, code, price, stock, category)",
            });
        }

        const product = await manager.addProduct(req.body);

        res.status(201).json({
            status: "success",
            data: product,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message,
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
                message: "Product not found",
            });
        }

        res.status(200).json({
            status: "success",
            data: product,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message,
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
                message: "Product not found",
            });
        }

        res.status(200).json({
            status: "success",
            message: `Product with code ${deletedProduct.code} deleted successfully`,
            data: deletedProduct,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
});

export default productRouter;
