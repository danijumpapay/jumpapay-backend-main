import multer from "multer";
import path from "path";
import fs from "fs";

const uploadFolder = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const blockedExtensions = [
  ".php", ".php3", ".php4", ".php5", ".phtml", ".phar", // PHP scripts
  ".exe", ".sh", ".bat", ".cmd", ".com", ".scr", ".msi", // Executables / scripts
  ".sql", ".sqlite", ".db", ".bak", // Database dumps
  ".js", ".jsp", ".asp", ".aspx", ".cgi", // Server scripts
  ".html", ".htm" // HTML files (could contain malicious JS)
];

// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     cb(null, uploadFolder);
//   },
//   filename: (_req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });

// export const upload = multer({
//   storage,
//   limits: { fileSize: 20 * 1024 * 1024 },
//   fileFilter: (_req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (blockedExtensions.includes(ext)) {
//       return cb(new Error(`Files of type ${ext} are not allowed`));
//     }
//     cb(null, true);
//   }
// });

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (blockedExtensions.includes(ext)) {
      return cb(new Error(`Files of type ${ext} are not allowed`));
    }
    cb(null, true);
  }
});