import express from "express";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'; 
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000; 


const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')));


app.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://api.api-ninjas.com/v1/quotes", {
      headers: { "X-Api-Key": process.env.API},
    });

    const data = response.data[0]; // API returns array with one quote
    res.render("index.ejs", { content: data });
  } 
  catch (error) {
    console.error(error);
    res.render("index.ejs", {
      content: { quote: "Failed to load quote 😢", author: "Unknown" },
    });
  }
});

// Express route
app.get("/login", (req, res) => {
  res.render("login.ejs");
});


app.get("/weekly", (req, res) => res.render("weekly.ejs"));
app.get("/pomodoro", (req, res) => res.render("pomodoro.ejs"));
app.get("/notes", (req, res) => res.render("notes.ejs"));
app.get("/report", (req, res) => res.render("report.ejs"));

// to store tasks to json
app.use(express.json());

const filePath = path.join(process.cwd(), "tasks.json");

app.post('/save-summary', (req, res) => {
    const newSummary = req.body;

    let allData = [];
    if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath);
        allData = JSON.parse(raw);
    }

    const existingIndex = allData.findIndex(item => item.date === newSummary.date);
    if (existingIndex >= 0) {
        allData[existingIndex] = newSummary; // update
    } else {
        allData.push(newSummary); // add new
    }

    fs.writeFileSync(filePath, JSON.stringify(allData, null, 2));
    res.send({ success: true });
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
