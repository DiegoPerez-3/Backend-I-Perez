import express from "express";
import productRouter from "./routes/products.routes.js";
import cartRouter from "./routes/carts.routes.js";

const app = express();
const BASE_ROUTE = "/api";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

// ruta base de products
app.use(`${BASE_ROUTE}/products`, productRouter);

// ruta base de carritos
app.use(`${BASE_ROUTE}/carts`, cartRouter);

export default app;
