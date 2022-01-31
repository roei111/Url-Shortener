if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const { catchAsync } = require("./utils/utils");
const ShortUrl = require("./models/shortUrl");
const validUrl = require("valid-url");

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

const sessionConfig = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));

app.get(
  "/",
  catchAsync(async (req, res) => {
    console.log("req.session: ",req.session)
    //gets form validation error and prev input value from the session
    const formError = req.session.formError;
    const prevInputValue = req.session.prevInputValue;
    //Resets session variable  
    req.session.formError = null;
    req.session.prevInputValue = null;
 
    const allUrls = await ShortUrl.find({});
    if (!allUrls) {
      return res.render("404", { message: "Can't find any URL!" });
    }
    res.render("index", { allUrls, formErrorMessage: formError, prevInputValue });
  })
);

app.post(
  "/newUrl",
  catchAsync(async (req, res) => {
    const enteredUrl = req.body.originalUrl;
    //Validate, save the data in the session to access it in the route & redirect
    if (!enteredUrl) { //Check if the user entered any url
      req.session.formError = "This field is required!";
      return res.redirect("/");
    } else if (!validUrl.isUri(enteredUrl)) { //Check if the entered url is valid
      req.session.formError = "Invalid URL!";
      //Keep the entered url value to show it in the form (better ux) 
      req.session.prevInputValue = enteredUrl;
      return res.redirect("/");
    }

    const newUrl = new ShortUrl({ originalUrl: enteredUrl });
    await newUrl.save();
    res.redirect("/");
  })
);

app.get(
  "/:shortUrl",
  catchAsync(async (req, res) => {
    const shortUrl = req.params.shortUrl;
    const url = await ShortUrl.findOne({ shortUrl });
    if (!url) {
      return res.render("404", { message: "The URL is not found!" });
    }
    url.clicks++;
    await url.save();
    res.redirect(url.originalUrl);
  })
);

app.use((err, req, res, next) => {
  if (!err.message) err.message = "Something Went Wrong!";
  return res.render("404", err.message);
});

app.listen(process.env.PORT || 5000);
