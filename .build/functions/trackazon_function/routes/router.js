const express = require("express");
const router = express.Router();
const {
  getTrackDetails,
  postTrackDetails,
  updateExpectedPrices,
  deleteTrack,
  getTrackDetailsById,
  enableTracking,
  disableTracking,
  getAllTrackDetails,
  postTrackDetailsDirectly,
  deleteAllTracks,
  getProductDetailsByUrl,
  updateTrackPricesPeriodically,
} = require("../service/track.service");
const { checkUser } = require("../middleware/checkUser");
const { createUser, checkAuth } = require("../service/authenticate.service");
const { findUserByEmail } = require("../queries/auth.queries.js");

// GET - ROOT TEST
router.get("/", (req, res) => {
  res.send("Tracker runnning successfully");
});

// POST - ROOT TEST
router.post("/", (req, res) => {
  console.log(req.headers);
  console.log(req.body);
  console.log(req.params);
  res.send("Tracker runnning successfully");
});

// GET ALL
router.get("/track-details", (req, res) => {
  getAllTrackDetails(req, res);
});

// GET ALL BY EMAIL
router.get("/track-details/:email", (req, res) => {
  getAllTrackDetails(req, res);
});

// GET BY EMAIL AND PAGE
router.get("/track-details/:email/:page", (req, res) => {
  getTrackDetails(req, res);
});

// GET BY ID
router.get("/track-detail-by-id/:id", (req, res) => {
  console.log("GETTING BY ID");
  getTrackDetailsById(req, res);
});

// authenticate
router.post("/login", (req, res) => {
  // body -> email, token, userId
  createUser(req, res);
});

// authenticate
router.get("/chech-auth/:email", (req, res) => {
  // params -> email
  checkAuth(req, res);
});

// POST
router.post("/addtrack", checkUser, (req, res) => {
  // console.log(req.body); // email, url, price, id
  postTrackDetails(req, res);
});

// POST
router.post("/addtrack-direct", checkUser, (req, res) => {
  // console.log(req.body); // email, url, price, id
  postTrackDetailsDirectly(req, res);
});

// UPDATE
router.put("/update-price/:id/:price", (req, res) => {
  updateExpectedPrices(req, res);
});

// UPDATE - ENABLE TRACKING
router.put("/enable-tracking/:id", (req, res) => {
  enableTracking(req, res);
});

// UPDATE - DISABLE TRACKING
router.put("/disable-tracking/:id", (req, res) => {
  disableTracking(req, res);
});

// DELETE
router.delete("/delete/:id", (req, res) => {
  deleteTrack(req, res);
});

// DELETE
router.delete("/delete-by-email/:email", (req, res) => {
  deleteAllTracks(req, res);
});

// GET PRODUCT DETAILS BY URL
router.post("/get-by-url", (req, res) => {
  getProductDetailsByUrl(req, res);
});

// TO RUN CRON JOB
router.get("/run-cron-job", async (req, res) => {
  try {
    await updateTrackPricesPeriodically(res);
  } catch (error) {
    res.send(error);
  }
});

router.get("/testing", async (req, res) => {
  await findUserByEmail(req, "thalha@gamil.com");
  res.send("RESULT")
});

module.exports = router;
