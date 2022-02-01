const express = require("express");
const router = express.Router();
const { catchAsync } = require("../utils/utils");
const ShortUrl = require("../models/shortUrl");
const validUrl = require("valid-url");

//Get all URLs
router.get(
  "/",
  catchAsync(async (req, res) => {
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
    res.render("index", {
      allUrls,
      formErrorMessage: formError,
      prevInputValue,
    });
  })
);

//Add new URL
router.post(
  "/newUrl",
  catchAsync(async (req, res) => {
    const enteredUrl = req.body.originalUrl;
    //Validate, save the data in the session to access it in the route & redirect
    if (!enteredUrl) {
      //Check if the user entered any url
      req.session.formError = "This field is required!";
      return res.redirect("/");
    } else if (!validUrl.isUri(enteredUrl)) {
      //Check if the entered url is valid
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

//Redirect to short URL
router.get(
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


module.exports = router;
