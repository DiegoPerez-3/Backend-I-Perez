import { Router } from "express";
import CartManager from "../managers/CartManager.js";

const cartRouter = Router();
const manager = new CartManager();

// POST /api/carts -> crear un nuevo carrito
cartRouter.post("/", async (req, res) => {
    try {
        const cart = await manager.createCart();
        res.status(201).json({
            status: "success",
            message: "Cart created successfully",
            data: cart,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

// GET /api/carts/:cid -> obtener los productos de un carrito específico
cartRouter.get("/:cid", async (req, res) => {
    try {
        const cart = await manager.getCartById(req.params.cid);

        if (!cart) {
            return res.status(404).json({
                status: "error",
                message: "Cart not found",
            });
        }

        res.status(200).json({
            status: "success",
            data: cart.products,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

// POST /api/carts/:cid/product/:pid -> agregar un producto al carrito
cartRouter.post("/:cid/product/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await manager.addProductToCart(cid, pid);

        res.status(200).json({
            status: "success",
            message: "Product added to cart successfully",
            data: cart,
        });
    } catch (error) {
        res.status(404).json({
            status: "error",
            message: error.message,
        });
    }
});

export default cartRouter;
