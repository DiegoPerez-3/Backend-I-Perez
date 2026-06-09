import __joiner from "../utils/paths.js";
import fs from "fs/promises";
import checkFileExists from "../utils/checkFile.js";

const FILE_PATH = __joiner("products.json");

class ProductManager {
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

    async getProducts() {
        return await this._read();
    }

    async getProductById(id) {
        const products = await this._read();
        return products.find((p) => p.id === id);
    }

    async addProduct(product) {
        const products = await this._read();
        const newProduct = {
            id: `prod_${Date.now()}`,
            title: product.title,
            description: product.description,
            code: product.code,
            price: Number(product.price),
            status: product.status !== undefined ? Boolean(product.status) : true,
            stock: Number(product.stock),
            category: product.category,
            thumbnails: Array.isArray(product.thumbnails) ? product.thumbnails : []
        };
        products.push(newProduct);
        await this._write(products);
        return newProduct;
    }

    async updateProduct(id, updates) {
        const products = await this._read();
        const index = products.findIndex((p) => p.id === id);

        if (index === -1) return null;

        // Extraer id de los updates para asegurar que no se actualice
        const { id: _, ...restUpdates } = updates;

        const updatedProduct = {
            ...products[index],
            ...restUpdates,
            id // mantener el id original
        };

        // Convertir tipos si es necesario
        if (updatedProduct.price !== undefined) updatedProduct.price = Number(updatedProduct.price);
        if (updatedProduct.stock !== undefined) updatedProduct.stock = Number(updatedProduct.stock);
        if (updatedProduct.status !== undefined) updatedProduct.status = Boolean(updatedProduct.status);

        products[index] = updatedProduct;

        await this._write(products);
        return updatedProduct;
    }

    async deleteProduct(id) {
        const products = await this._read();
        const index = products.findIndex((p) => p.id === id);

        if (index === -1) return null;

        const deletedProduct = products.splice(index, 1);
        await this._write(products);
        return deletedProduct[0];
    }
}

export default ProductManager;
