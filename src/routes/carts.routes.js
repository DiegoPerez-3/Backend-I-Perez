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
            message: "Carrito creado correctamente",
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

// GET /api/carts/:cid -> obtener un carrito completo con productos populados
cartRouter.get("/:cid", async (req, res) => {
    try {
        const cart = await manager.getCartById(req.params.cid);

        if (!cart) {
            return res.status(404).json({
                status: "error",
                message: "Carrito no encontrado"
            });
        }

        res.status(200).json({
            status: "success",
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

// POST /api/carts/:cid/product/:pid (o /products/:pid) -> agregar un producto al carrito
const addProductHandler = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const quantity = req.body?.quantity || 1;
        const cart = await manager.addProductToCart(cid, pid, quantity);

        res.status(200).json({
            status: "success",
            message: "Producto agregado al carrito correctamente",
            data: cart
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
};

cartRouter.post("/:cid/product/:pid", addProductHandler);
cartRouter.post("/:cid/products/:pid", addProductHandler);

// DELETE /api/carts/:cid/products/:pid (o /product/:pid) -> eliminar del carrito el producto seleccionado
const deleteProductHandler = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await manager.deleteProductFromCart(cid, pid);

        res.status(200).json({
            status: "success",
            message: "Producto eliminado del carrito correctamente",
            data: cart
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
};

cartRouter.delete("/:cid/products/:pid", deleteProductHandler);
cartRouter.delete("/:cid/product/:pid", deleteProductHandler);

// PUT /api/carts/:cid -> actualizar todos los productos del carrito con un arreglo de productos desde req.body
cartRouter.put("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        const productsArray = req.body;

        const cart = await manager.updateCartProducts(cid, productsArray);

        res.status(200).json({
            status: "success",
            message: "Carrito actualizado correctamente",
            data: cart
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
});

// PUT /api/carts/:cid/products/:pid (o /product/:pid) -> actualizar SÓLO la cantidad de ejemplares del producto
const updateQuantityHandler = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || isNaN(quantity) || quantity < 1) {
            return res.status(400).json({
                status: "error",
                message: "Debe proporcionar una cantidad válida (quantity >= 1)"
            });
        }

        const cart = await manager.updateProductQuantity(cid, pid, quantity);

        res.status(200).json({
            status: "success",
            message: "Cantidad del producto actualizada correctamente",
            data: cart
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
};

cartRouter.put("/:cid/products/:pid", updateQuantityHandler);
cartRouter.put("/:cid/product/:pid", updateQuantityHandler);

// DELETE /api/carts/:cid -> vaciar el carrito (eliminar todos los productos de su interior)
cartRouter.delete("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await manager.clearCart(cid);

        res.status(200).json({
            status: "success",
            message: "Carrito vaciado correctamente",
            data: cart
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
});

export default cartRouter;
