const shortId = require("shortid");

//generate 9 characters id from shorid, and slice it to 7 characters
const createShortUrl = () => {
  return shortId.generate().slice(0, 7);
};


const catchAsync = (func) => {
  console.log("inside the catch")
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};

class ExpressError extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}

module.exports.ExpressError =ExpressError;
module.exports.createShortUrl = createShortUrl;
module.exports.catchAsync = catchAsync;


