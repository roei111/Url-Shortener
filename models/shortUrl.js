const mongoose = require("mongoose");
const {createShortUrl} = require("../utils/utils");
const Schema = mongoose.Schema;

const ShortUrlSchema = new Schema({
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, default: createShortUrl },
  clicks: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("ShortUrl", ShortUrlSchema);
