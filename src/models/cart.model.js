import mongoose from "mongoose";

// Esquema de Mongoose para el carrito de compras
const cartSchema = new mongoose.Schema(
    {
        products: [
            {
                _id: false, // Evitamos subdocumentos innecesarios con _id interno para cada item del arreglo
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                    min: [1, "La cantidad mínima debe ser 1"]
                }
            }
        ]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const CartModel = mongoose.model("Cart", cartSchema);

export default CartModel;
