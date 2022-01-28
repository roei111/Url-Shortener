if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortUrl");

const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  console.log("inside the /")
  const allUrls = await ShortUrl.find({});
  res.render("index", { allUrls });
});

app.post("/newUrl", async (req, res) => {
  const newUrl = new ShortUrl({ originalUrl: req.body.originalUrl });
  await newUrl.save();
  res.redirect("/");
});

app.get("/:shortUrl", async (req, res) => {
  console.log("inside the params")
  const shortUrl = req.params.shortUrl;
  const url = await ShortUrl.findOne({ shortUrl });
  console.log("url: ",url)
  url.clicks++;
  await url.save();
  res.redirect(url.originalUrl);
});

app.listen(process.env.PORT || 5000);
