import "dotenv/config";

// Configuración global de la aplicación y variables de entorno
const config = {
    mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/coderhouse_ecommerce",
    port: process.env.PORT || 8080,
};

export default config;
