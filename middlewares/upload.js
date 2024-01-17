import multer from "multer";
import path from "path";



const tempDir = path.resolve("temp");

const storage = multer.diskStorage({
    destination: tempDir,
    filename: (req, file, callback)=> {
        const uniquePreffix = Date.now();
        const filename = `${uniquePreffix}_${file.originalname}`;
        callback(null, filename);
    }
});


const upload = multer({
    storage,
   
})

export default upload;