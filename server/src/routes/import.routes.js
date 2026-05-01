const express = require("express");
const multer = require("multer");
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/import.controller");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      /\.csv$/i.test(file.originalname)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

const router = express.Router();
router.use(requireAuth);

router.post("/csv", upload.single("file"), ctrl.importCsv);
router.get("/csv", ctrl.exportCsv);
router.get("/template", ctrl.template);

module.exports = router;
