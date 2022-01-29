const shortId = require("shortid");

//generate 9 characters id from shorid, and slice it to 7 characters
const createShortUrl = () => {
  return shortId.generate().slice(0, 7);
};

const catchAsync = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};

module.exports.createShortUrl = createShortUrl;
module.exports.catchAsync = catchAsync;


