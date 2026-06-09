import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const __joiner = (file) => path.join(__dirname, "..", "..", "data", file);

export default __joiner;
