import mongoose from "mongoose";
import config from "../config/index.js";
import ProductModel from "../models/product.model.js";

// Datos de productos iniciales para sembrar la base de datos si está vacía
const initialProducts = [
    {
        title: "Laptop Gamer Asus ROG",
        description: "Intel i7, 16GB RAM, SSD 512GB, RTX 3060",
        code: "LAP-001",
        price: 1250.00,
        status: true,
        stock: 15,
        category: "Electrónica"
    },
    {
        title: "Teclado Mecánico RGB",
        description: "Switches blue táctiles con retroiluminación RGB",
        code: "TEC-001",
        price: 85.00,
        status: true,
        stock: 30,
        category: "Periféricos"
    },
    {
        title: "Mouse Inalámbrico Pro",
        description: "Sensor óptico 16000 DPI con batería recargable",
        code: "MOU-001",
        price: 45.00,
        status: true,
        stock: 50,
        category: "Periféricos"
    },
    {
        title: "Monitor Gamer 144Hz",
        description: "Pantalla IPS 24 pulgadas Full HD 1ms",
        code: "MON-001",
        price: 280.00,
        status: true,
        stock: 10,
        category: "Electrónica"
    },
    {
        title: "Auriculares Bluetooth ANC",
        description: "Cancelación de ruido activa y sonido de alta fidelidad",
        code: "AUR-001",
        price: 120.00,
        status: true,
        stock: 25,
        category: "Audio"
    },
    {
        title: "Silla Gamer Ergonómica",
        description: "Respaldar reclinable con almohadillas lumbar y cervical",
        code: "SIL-001",
        price: 210.00,
        status: true,
        stock: 8,
        category: "Muebles"
    },
    {
        title: "Disco SSD NVMe 1TB",
        description: "Velocidad de lectura de hasta 3500 MB/s",
        code: "SSD-001",
        price: 95.00,
        status: true,
        stock: 40,
        category: "Componentes"
    },
    {
        title: "Memoria RAM 16GB DDR4",
        description: "Módulo 3200MHz óptimo para gaming",
        code: "RAM-001",
        price: 65.00,
        status: true,
        stock: 35,
        category: "Componentes"
    },
    {
        title: "Webcam Full HD 1080p",
        description: "Micrófono estéreo integrado y enfoque automático",
        code: "WEB-001",
        price: 55.00,
        status: true,
        stock: 20,
        category: "Periféricos"
    },
    {
        title: "Micrófono Condensador USB",
        description: "Patrón polar cardioide ideal para streaming y podcast",
        code: "MIC-001",
        price: 75.00,
        status: true,
        stock: 18,
        category: "Audio"
    },
    {
        title: "Tablet 10 Pulgadas",
        description: "Pantalla HD, 64GB de almacenamiento y batería de 6000mAh",
        code: "TAB-001",
        price: 190.00,
        status: true,
        stock: 12,
        category: "Electrónica"
    },
    {
        title: "Smartwatch Deportivo",
        description: "Monitor de ritmo cardíaco, GPS e impermeabilidad IP68",
        code: "SMA-001",
        price: 110.00,
        status: true,
        stock: 22,
        category: "Electrónica"
    }
];

// Función asíncrona para conectar a la base de datos de MongoDB
const connectMongo = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log("Conexión exitosa a MongoDB");

        // Autosembrado inicial si la base de datos está vacía
        const count = await ProductModel.countDocuments();
        if (count === 0) {
            await ProductModel.insertMany(initialProducts);
            console.log("Base de datos sembrada con productos de muestra iniciales.");
        }
    } catch (error) {
        console.error("Error al conectar con MongoDB:", error.message);
    }
};

export default connectMongo;
