if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const ShortUrl = require("./models/shortUrl");
const { catchAsync, ExpressError } = require("./utils/utils");

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
  const allUrls = await ShortUrl.find({});
  if (!allUrls) {
    // res.status(500);
    throw new ExpressError("Can't find any URL",500);
  }
  res.render("index", { allUrls });
});

app.post("/newUrl", async (req, res) => {
  const newUrl = new ShortUrl({ originalUrl: req.body.originalUrl });
  await newUrl.save();
  res.redirect("/");
});

app.get(
  "/:shortUrl",
  catchAsync(async (req, res) => {
    console.log("inside the params");
    const shortUrl = req.params.shortUrl;
    const url = await ShortUrl.findOne({ shortUrl });
    if (!url) {
      console.log("no url!!!");
      // res.status(404);
      throw new ExpressError("The URL is not found",404);
    } else {
      console.log("url: ", url);
      url.clicks++;
      await url.save();
      res.redirect(url.originalUrl);
    }
  })
);

app.use((err, req, res, next) => {
  console.log("err status code: ", err.statusCode);
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something Went Wrong!";
  console.log("status: ", statusCode);
  console.log("err message: ", err.message);
  res.status(statusCode).send(err.message);
});

app.listen(process.env.PORT || 5000);
