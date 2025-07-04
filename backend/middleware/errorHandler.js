import multer from "multer";

const errorHandler = (err, req, res, next) => {
  if (
    err instanceof multer.MulterError &&
    err.code === "LIMIT_UNEXPECTED_FILE"
  ) {
    return res
      .status(400)
      .json({ message: "More than one file has been uploaded." });
  }
  // ...other error handling...
  next(err);
};

export default errorHandler;
