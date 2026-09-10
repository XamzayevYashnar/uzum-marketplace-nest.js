import fs from "node:fs/promises";
import path from "node:path";

export async function uploadFile(file: any) {
    if (!file || file.size === 0) {
        throw new Error("No file Upload");
    }

    const fileName = Date.now() + "_" + file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");

    const uploadDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadDir, fileName);

    try {
        await fs.mkdir(uploadDir, { recursive: true });

        await fs.writeFile(filePath, file.buffer);

        return {
            success: true,
            url: `uploads/${fileName}`, 
        };
    } catch (error) {
        console.error("File Write error:", error);
        return { success: false, error: "Failed to save file." }  
    }
}
