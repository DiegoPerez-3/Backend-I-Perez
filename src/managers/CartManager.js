import CartModel from "../models/cart.model.js";
import ProductModel from "../models/product.model.js";

class CartManager {
    // Crear un nuevo carrito vacío
    async createCart() {
        const newCart = await CartModel.create({ products: [] });
        return newCart;
    }

    // Obtener un carrito por ID con la información de los productos poblada (populate)
    async getCartById(id) {
        return await CartModel.findById(id).populate("products.product").lean();
    }

    // Agregar un producto al carrito o incrementar su cantidad
    async addProductToCart(cartId, productId, quantity = 1) {
        // Verificar que el producto exista en la base de datos
        const productExists = await ProductModel.findById(productId);
        if (!productExists) {
            throw new Error("El producto no existe");
        }

        const cart = await CartModel.findById(cartId);
        if (!cart) {
            throw new Error("El carrito no existe");
        }

        // Buscar si el producto ya está en el arreglo del carrito
        const itemIndex = cart.products.findIndex(
            (p) => p.product.toString() === productId
        );

        if (itemIndex !== -1) {
            cart.products[itemIndex].quantity += Number(quantity);
        } else {
            cart.products.push({ product: productId, quantity: Number(quantity) });
        }

        await cart.save();
        return await CartModel.findById(cartId).populate("products.product").lean();
    }

    // Eliminar un producto específico del carrito
    async deleteProductFromCart(cartId, productId) {
        const cart = await CartModel.findById(cartId);
        if (!cart) {
            throw new Error("El carrito no existe");
        }

        cart.products = cart.products.filter(
            (p) => p.product.toString() !== productId
        );

        await cart.save();
        return await CartModel.findById(cartId).populate("products.product").lean();
    }

    // Actualizar todos los productos del carrito con un arreglo nuevo de productos
    async updateCartProducts(cartId, newProductsArray) {
        const cart = await CartModel.findById(cartId);
        if (!cart) {
            throw new Error("El carrito no existe");
        }

        if (!Array.isArray(newProductsArray)) {
            throw new Error("El formato del cuerpo debe ser un arreglo de productos");
        }

        cart.products = newProductsArray.map((item) => ({
            product: item.product,
            quantity: Number(item.quantity) || 1
        }));

        await cart.save();
        return await CartModel.findById(cartId).populate("products.product").lean();
    }

    // Actualizar únicamente la cantidad de un producto dentro del carrito
    async updateProductQuantity(cartId, productId, newQuantity) {
        const cart = await CartModel.findById(cartId);
        if (!cart) {
            throw new Error("El carrito no existe");
        }

        const item = cart.products.find(
            (p) => p.product.toString() === productId
        );

        if (!item) {
            throw new Error("El producto no se encuentra en el carrito");
        }

        item.quantity = Number(newQuantity);
        await cart.save();
        return await CartModel.findById(cartId).populate("products.product").lean();
    }

    // Vaciar completamente los productos de un carrito
    async clearCart(cartId) {
        const cart = await CartModel.findById(cartId);
        if (!cart) {
            throw new Error("El carrito no existe");
        }

        cart.products = [];
        await cart.save();
        return await CartModel.findById(cartId).populate("products.product").lean();
    }
}

export default CartManager;
