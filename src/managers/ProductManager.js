import ProductModel from "../models/product.model.js";

class ProductManager {
    // Obtener productos con filtros, ordenamiento y paginación según requerimientos
    async getProducts({ limit = 10, page = 1, sort, query, baseUrl = "/api/products" } = {}) {
        // Conversión de tipos para limit y page
        const parsedLimit = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;
        const parsedPage = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;

        // Armado del filtro (query por categoría o disponibilidad)
        const filter = {};
        if (query) {
            if (query === "true" || query === "false") {
                filter.status = query === "true";
            } else if (query.toLowerCase() === "available" || query.toLowerCase() === "disponible") {
                filter.status = true;
                filter.stock = { $gt: 0 };
            } else {
                // Filtro case-insensitive por categoría
                filter.category = { $regex: query, $options: "i" };
            }
        }

        // Opciones de paginación
        const options = {
            limit: parsedLimit,
            page: parsedPage,
            lean: true
        };

        // Ordenamiento por precio (asc / desc)
        if (sort === "asc" || sort === "desc") {
            options.sort = { price: sort === "asc" ? 1 : -1 };
        }

        // Ejecución de la paginación con el plugin de Mongoose
        const result = await ProductModel.paginate(filter, options);

        // Construcción de query string base para mantener los parámetros en los links prev/next
        const queryParams = new URLSearchParams();
        queryParams.set("limit", parsedLimit);
        if (sort) queryParams.set("sort", sort);
        if (query) queryParams.set("query", query);

        const prevQueryParams = new URLSearchParams(queryParams);
        prevQueryParams.set("page", result.prevPage);

        const nextQueryParams = new URLSearchParams(queryParams);
        nextQueryParams.set("page", result.nextPage);

        // Retornamos la estructura exacta de respuesta exigida en la consigna
        return {
            status: "success",
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `${baseUrl}?${prevQueryParams.toString()}` : null,
            nextLink: result.hasNextPage ? `${baseUrl}?${nextQueryParams.toString()}` : null
        };
    }

    // Obtener un producto específico por ID
    async getProductById(id) {
        return await ProductModel.findById(id).lean();
    }

    // Agregar un nuevo producto a la base de datos
    async addProduct(productData) {
        const newProduct = new ProductModel({
            title: productData.title,
            description: productData.description,
            code: productData.code,
            price: Number(productData.price),
            status: productData.status !== undefined ? Boolean(productData.status) : true,
            stock: Number(productData.stock),
            category: productData.category,
            thumbnails: Array.isArray(productData.thumbnails) ? productData.thumbnails : []
        });

        return await newProduct.save();
    }

    // Actualizar un producto existente
    async updateProduct(id, updates) {
        // Excluimos la modificación del id original
        const { id: _, _id, ...restUpdates } = updates;

        if (restUpdates.price !== undefined) restUpdates.price = Number(restUpdates.price);
        if (restUpdates.stock !== undefined) restUpdates.stock = Number(restUpdates.stock);
        if (restUpdates.status !== undefined) restUpdates.status = Boolean(restUpdates.status);

        return await ProductModel.findByIdAndUpdate(id, restUpdates, { new: true, runValidators: true }).lean();
    }

    // Eliminar un producto
    async deleteProduct(id) {
        return await ProductModel.findByIdAndDelete(id).lean();
    }
}

export default ProductManager;
