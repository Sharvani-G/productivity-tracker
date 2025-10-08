import express from "express";
import path from 'path';
import { fileURLToPath } from 'url'; 

const app = express();
const PORT = 3000; 


const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.render('index');  
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
