import express from 'express';
import multer from 'multer';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const app = express();

const port = process.env.PORT || 3000;
const execPromise = promisify(exec);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });
let fileName = ""
app.use(express.json());


async function runPythonScript(image_path: string) {
  try {
    const { stdout, stderr } = await execPromise(`python app.py "uploads/${image_path}"`);
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    return stdout; 
  } catch (error) {
    console.error(`exec error: ${error}`);
    return `Exec error: ${error}`;
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    fileName = req.file.originalname
    res.json({
      message: 'File uploaded successfully', 
      filename: req.file.originalname 
    });
  } else {
    res.status(400).json({
      message: 'No file uploaded'
    });
  }
});

app.get('/result', async (req, res) => {
  if (!fileName) {
    return res.status(400).json({ message: 'No file has been uploaded yet' });
  }
  const result = await runPythonScript(fileName);
  const segments = result.split('\r\n');
  const extractedValue = segments[segments.length - 2]; 
  res.json({
    originalResult: result,
    result: extractedValue.trim() ,
    message: "lets us know if anything wrong",
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
