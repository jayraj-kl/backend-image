"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const execPromise = (0, util_1.promisify)(child_process_1.exec);
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage });
let fileName = "";
app.use(express_1.default.json());
function runPythonScript(image_path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { stdout, stderr } = yield execPromise(`python app.py "uploads/${image_path}"`);
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            return stdout;
        }
        catch (error) {
            console.error(`exec error: ${error}`);
            return `Exec error: ${error}`;
        }
    });
}
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'index.html'));
});
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        fileName = req.file.originalname;
        res.json({
            message: 'File uploaded successfully',
            filename: req.file.originalname
        });
    }
    else {
        res.status(400).json({
            message: 'No file uploaded'
        });
    }
});
app.get('/result', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!fileName) {
        return res.status(400).json({ message: 'No file has been uploaded yet' });
    }
    const result = yield runPythonScript(fileName);
    const segments = result.split('\r\n');
    const extractedValue = segments[segments.length - 2];
    res.json({
        originalResult: result,
        result: extractedValue.trim(),
        message: "lets us know if anything wrong",
    });
}));
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
