import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// Esquema de Mongoose para la colección de productos
const productSchema = new mongoose.Schema(
    {
        title: { type: String, required: [true, "El título es obligatorio"] },
        description: { type: String, required: [true, "La descripción es obligatoria"] },
        code: { type: String, required: [true, "El código es obligatorio"], unique: true },
        price: {
            type: Number,
            required: [true, "El precio es obligatorio"],
            min: [0, "El precio debe ser mayor o igual a 0"]
        },
        status: { type: Boolean, default: true },
        stock: {
            type: Number,
            required: [true, "El stock es obligatorio"],
            min: [0, "El stock debe ser mayor o igual a 0"]
        },
        category: { type: String, required: [true, "La categoría es obligatoria"] },
        thumbnails: { type: [String], default: [] }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Aplicamos el plugin de paginación de Mongoose
productSchema.plugin(mongoosePaginate);

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;
