import multer from "multer";

// Multer is a Node.js middleware used to handle multi-part/form data, mainly for uploads in web apps.

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // folder where files will be stored
  },
  filename: function (req, file, cb) {

    cb(null, file.originalname);
  }
});

// this tells multer to use that storage configuration
export const upload = multer({ storage,});

