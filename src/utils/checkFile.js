import { access, constants } from "fs/promises";

async function checkFileExists(filePath) {
    try {
        await access(filePath, constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

export default checkFileExists;
