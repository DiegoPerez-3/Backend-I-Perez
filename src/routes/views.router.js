import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";
import CartManager from "../managers/CartManager.js";

const viewsRouter = Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

// GET / -> Redireccionar al catálogo principal de productos
viewsRouter.get("/", (req, res) => {
    res.redirect("/products");
});

// GET /products -> renderizar la vista de productos con paginación visual y filtros
viewsRouter.get("/products", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        // Solicitamos los productos paginados al manager usando baseUrl /products
        const result = await productManager.getProducts({
            limit,
            page,
            sort,
            query,
            baseUrl: "/products"
        });

        res.render("products", {
            title: "Catálogo de Productos - CoderStore",
            products: result.payload,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.prevLink,
            nextLink: result.nextLink,
            limit,
            sort: sort || "",
            query: query || ""
        });
    } catch (error) {
        console.error("Error al renderizar vista /products:", error.message);
        res.status(500).render("products", {
            title: "Catálogo de Productos - CoderStore",
            products: [],
            error: "No se pudieron cargar los productos."
        });
    }
});

// GET /products/:pid -> vista de detalle de un producto seleccionado
viewsRouter.get("/products/:pid", async (req, res) => {
    try {
        const product = await productManager.getProductById(req.params.pid);

        if (!product) {
            return res.status(404).render("products", {
                title: "Producto No Encontrado",
                products: [],
                error: "El producto solicitado no existe."
            });
        }

        res.render("productDetail", {
            title: `${product.title} - Detalles`,
            product
        });
    } catch (error) {
        console.error("Error al cargar detalle de producto:", error.message);
        res.status(500).render("products", {
            title: "Error",
            products: [],
            error: "Ocurrió un error al intentar obtener la información del producto."
        });
    }
});

// GET /carts/:cid -> vista para visualizar un carrito específico con productos populados
viewsRouter.get("/carts/:cid", async (req, res) => {
    try {
        const cart = await cartManager.getCartById(req.params.cid);

        if (!cart) {
            return res.status(404).render("cart", {
                title: "Carrito No Encontrado",
                cart: null,
                error: "El carrito especificado no existe."
            });
        }

        // Mapeamos los ítems calculando el subtotal individual y el total general
        let totalGeneral = 0;
        const formattedProducts = cart.products.map((item) => {
            const product = item.product || {};
            const price = product.price || 0;
            const subtotal = price * item.quantity;
            totalGeneral += subtotal;

            return {
                _id: product._id,
                title: product.title || "Producto no disponible",
                description: product.description || "",
                code: product.code || "-",
                category: product.category || "-",
                price: price,
                quantity: item.quantity,
                subtotal: subtotal.toFixed(2)
            };
        });

        res.render("cart", {
            title: `Carrito ${cart._id}`,
            cartId: cart._id,
            products: formattedProducts,
            totalGeneral: totalGeneral.toFixed(2),
            hasProducts: formattedProducts.length > 0
        });
    } catch (error) {
        console.error("Error al renderizar vista del carrito:", error.message);
        res.status(500).render("cart", {
            title: "Error en Carrito",
            cart: null,
            error: "No se pudieron obtener los datos del carrito."
        });
    }
});

// GET /realtimeproducts -> vista en tiempo real vía WebSockets
viewsRouter.get("/realtimeproducts", async (req, res) => {
    try {
        const result = await productManager.getProducts({ limit: 100 });
        res.render("realTimeProducts", {
            title: "Productos en Tiempo Real - WebSockets",
            products: result.payload
        });
    } catch (error) {
        console.error("Error al renderizar realTimeProducts:", error.message);
        res.status(500).render("realTimeProducts", {
            title: "Productos en Tiempo Real",
            products: [],
            error: "Error al cargar productos en tiempo real."
        });
    }
});

export default viewsRouter;
