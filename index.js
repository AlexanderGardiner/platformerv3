const express = require("express");
const cors = require("cors");
const fs = require("fs");
const levelFolder = "./levels/";
const bodyParser = require("body-parser");
const app = express();

// Enables JSON decoding
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sets port
const PORT = 3000;
app.use(cors());

// Sets an endpoint to get levels and upload levels
app.post("/", function (req, res) {
  console.log("Request Recieved: " + JSON.stringify(req.body));

  if (req.body.query == "levelnames") {
    try {
      let levelNames = [];
      fs.readdirSync(levelFolder).forEach((file) => {
        levelNames.push(file);
      });
      console.log("Returning Data: " + JSON.stringify({ levelNames }));
      res.header("Access-Control-Allow-Origin", "*");
      res.send({ levelNames });
    } catch (err) {
      console.log(err);
      res.send({ error: "There was an error" });
    }
  }

  if (req.body.query == "requestlevel") {
    try {
      console.log("Returning Level: " + req.body.levelname);
      res.header("Access-Control-Allow-Origin", "*");
      res.send(fs.readFileSync("./levels/" + req.body.levelname));
    } catch (err) {
      console.log(err);
      res.send({ error: "There was an error" });
    }
  }

  if (req.body.query == "uploadlevel") {
    try {
      if (!fs.existsSync("./levels/" + req.body.levelname)) {
        fs.writeFileSync(
          "./levels/" + req.body.levelname,
          JSON.stringify(req.body.leveldata)
        );
        console.log("File Written");
        res.header("Access-Control-Allow-Origin", "*");
        res.send({ text: "File Written" });
      } else {
        res.send({ test: "File Exists" });
      }
    } catch (err) {
      console.log(err);
      res.send({ error: "There was an error" });
    }
  }
});

// Endpoints to get a title page and a game page
app.use("/", express.static("TitleScreen"));
app.use("/game", express.static("GameScreen"));

// Sets app to listen
app.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", PORT);
});
