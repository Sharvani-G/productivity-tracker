import express from "express";
import bodyParser from "body-parser";
import path from 'path';
import { fileURLToPath } from 'url'; 

const app = express();
const PORT = 3000; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('views', path.join(__dirname, 'views')); 

app.get('/', (req, res) => {
  res.render('partials.ejs');  // Renders index.ejs
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
