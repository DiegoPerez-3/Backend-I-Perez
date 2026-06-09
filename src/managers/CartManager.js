import __joiner from "../utils/paths.js";
import fs from "fs/promises";
import checkFileExists from "../utils/checkFile.js";
import ProductManager from "./ProductManager.js";

const FILE_PATH = __joiner("carts.json");
const productManager = new ProductManager();

class CartManager {
    async _read() {
        const exists = await checkFileExists(FILE_PATH);
        if (!exists) return [];
        try {
            const data = await fs.readFile(FILE_PATH, "utf-8");
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    async _write(data) {
        await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
    }

    async createCart() {
        const carts = await this._read();
        
        // Autogeneración de ID numérico secuencial seguro
        const newId = carts.length > 0 ? Math.max(...carts.map((c) => Number(c.id))) + 1 : 1;
        const newCart = { id: newId, products: [] };

        carts.push(newCart);
        await this._write(carts);
        return newCart;
    }

    async getCartById(id) {
        const carts = await this._read();
        return carts.find((cart) => cart.id === Number(id));
    }

    async addProductToCart(cartId, productId) {
        // Verificar que el producto exista antes de agregarlo al carrito
        const productExists = await productManager.getProductById(productId);
        if (!productExists) {
            throw new Error("Product not found");
        }

        const carts = await this._read();
        const cart = carts.find((cart) => cart.id === Number(cartId));

        if (!cart) {
            throw new Error("Cart not found");
        }

        const item = cart.products.find((p) => p.product === productId);

        if (item) {
            item.quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }

        await this._write(carts);
        return cart;
    }
}

export default CartManager;
