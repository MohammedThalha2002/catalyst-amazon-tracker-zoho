const cronJob = require("./cronjob.service");
const scrape = require("./scrape.service");
var catalyst = require("zcatalyst-sdk-node");

// DONE & CHECKED
const postTrackDetails = async (req, res) => {
  let url = req.body.url;
  let email = req.body.email;
  let exp_price = req.body.exp_price;
  await scrape(url, email, exp_price, req, res);
};

// DONE & CHECKED
const postTrackDetailsDirectly = async (req, res) => {
  const data = req.body;
  console.log(data);
  data.title = data.title.trim().replace(/[|/&;$%@"<>()+,]/g, "");
  data.features = data.features.replace(/\\"/g, '"');
  data.features = JSON.parse(data.features);
  data.features[0] = data.features[0].replace("//", "").substring(0,95) + "...";
  data.features[1] = data.features[1].replace("//", "").substring(0,95) + "...";
  try {
    var app = catalyst.initialize(req);
    let zcql = app.zcql();

    let query = `
    INSERT INTO Track (url, title, features, img_url, inStock, rating, exp_price, curr_price, email)
    VALUES ('${data.url}', '${data.title}', '${JSON.stringify(data.features)}', '${data.imgUrl}', ${data.inStock}, ${data.rating}, ${data.exp_price}, ${data.curr_price}, '${data.email}')`;

    await zcql.executeZCQLQuery(query);
    //
    res
      .status(200)
      .json({ msg: "Tracking data uploaded successfully", status: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      msg: "Failed to upload the tracking data",
      error: error,
      status: "failed",
    });
  }
};

// DONE & CHECKED
const getTrackDetails = async (req, res) => {
  const email = req.params?.email;
  const page = parseInt(req.params?.page) || 1;
  const limit = 2;
  const offset = ((page-1)*limit)+1

  const dataQuery = email
    ? `SELECT * FROM Track WHERE email = '${email}' LIMIT ${limit} OFFSET ${offset};`
    : `SELECT * FROM Track LIMIT ${limit} OFFSET ${offset};`;
  const countQuery = email ? `SELECT COUNT(ROWID) FROM Track WHERE email = '${email}';` : `SELECT COUNT(ROWID) FROM Track;`;

  var app = catalyst.initialize(req);
  let zcql = app.zcql();

  try {
    let dataRes = await zcql.executeZCQLQuery(dataQuery);
    const countResults = await zcql.executeZCQLQuery(countQuery);
    //
    const totalCount = countResults[0].Track.ROWID;
    console.log(totalCount);
    const hasNextPage = (page * limit) < totalCount;
    const hasPrevPage = page > 1;

    const meta = {
      page : page,
      hasPrevPage : hasPrevPage,
      hasNextPage : hasNextPage,
    }
    // alter dataRes
    dataRes = dataRes.map(item => item.Track)
    dataRes.forEach(item => delete item.Track);

    res.status(200).json({
      status: "success",
      docs: dataRes,
      meta : meta
    });
  } catch (error) {
    res.status(400).json({
      msg: "Failed to fetch the tracking data",
      error: error,
      status: "failed",
    });
  }
};

// DONE & CHECKED
const getAllTrackDetails = async (req, res) => {
  const email = req.params?.email;
  const limit = 10;

  var app = catalyst.initialize(req);
  let zcql = app.zcql();


  const dataQuery = email
    ? `SELECT * FROM Track WHERE email = '${email}' LIMIT ${limit};`
    : `SELECT * FROM Track;`;

    try {
      let dataRes = await zcql.executeZCQLQuery(dataQuery);
  
      // alter dataRes
      dataRes = dataRes.map(item => item.Track)
      dataRes.forEach(item => delete item.Track);
  
      res.status(200).json({
        status: "success",
        docs: dataRes
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        msg: "Failed to fetch the tracking data",
        error: error,
        status: "failed",
      });
    }
};

// DONE & CHECKED
const getTrackDetailsById = async (req, res) => {
  const id = req.params?.id;

  var app = catalyst.initialize(req);
  let zcql = app.zcql();

  const dataQuery = `SELECT * FROM Track WHERE ROWID = '${id}';`

  try {
    let dataRes = await zcql.executeZCQLQuery(dataQuery);
     // alter dataRes
     dataRes = dataRes.map(item => item.Track)
     dataRes.forEach(item => delete item.Track);
 
     res.status(200).json({
       status: "success",
       docs: dataRes
     });

  } catch (error) {
    res.status(400).json({
      msg: "Failed to fetch the tracking data",
      error: error,
    });
  }
};

// DONE & CHECKED
const updateExpectedPrices = async (req, res) => {
  const id = req.params?.id;
  const exp_price = parseInt(req.params?.price);

  var app = catalyst.initialize(req);
  let zcql = app.zcql();

  const updateQuery = `
      UPDATE Track
      SET exp_price = ${exp_price}
      WHERE ROWID = '${id}';
    `;

  try {
    await zcql.executeZCQLQuery(updateQuery);
    console.log(exp_price, "updated successfully");
    res
      .status(200)
      .json({ msg: "Price updated successfully", status: "success" });
  } catch (error) {
    res.status(400).json({
      msg: "Failed to update the price",
      error: error,
      staus: "failed",
    });
  }
};

// DONE & CHECKED
const enableTracking = async (req, res) => {
  const id = req.params?.id;

  var app = catalyst.initialize(req);
  let zcql = app.zcql();

  const updateQuery = `
      UPDATE Track
      SET track_enabled = true
      WHERE ROWID = '${id}';
    `;

  try {
    await zcql.executeZCQLQuery(updateQuery);
    res
      .status(200)
      .json({ msg: "Track enabled successfully", status: "success" });
  } catch (error) {
    res.status(400).json({
      msg: "Failed to update the tracking data",
      error: error,
      staus: "failed",
    });
  }
};

// DONE & CHECKED
const disableTracking = async (req, res) => {
  const id = req.params?.id;
  var app = catalyst.initialize(req);
  let zcql = app.zcql();

  const updateQuery = `
      UPDATE Track
      SET track_enabled = false
      WHERE ROWID = '${id}';
    `;

  try {
    await zcql.executeZCQLQuery(updateQuery);
    res
      .status(200)
      .json({ msg: "Track disabled successfully", status: "success" });
  } catch (error) {
    res.status(400).json({
      msg: "Failed to update the tracking data",
      error: error,
      staus: "failed",
    });
  }
};

// DONE & CHECKED
const deleteTrack = async (req, res) => {
  const id = req.params?.id;
  var app = catalyst.initialize(req);
  let zcql = app.zcql();

  const deleteQuery = `
      DELETE FROM Track
      WHERE ROWID = '${id}';
    `;

  try {
    await zcql.executeZCQLQuery(deleteQuery);
    console.log("Deleted successfully");
    res
      .status(200)
      .json({ msg: "Product Deleted successfully", status: "success" });
  } catch (error) {
    res.status(400).json({
      msg: "Failed to delete the tracking data",
      error: error,
      staus: "failed",
    });
  }
};

// DONE & CHECKED
const deleteAllTracks = async (req, res) => {
  const email = req.params?.email;

  var app = catalyst.initialize(req);
  let zcql = app.zcql();

  const deleteQuery = `
      DELETE FROM Track
      WHERE email = '${email}';
    `;

  try {
    await zcql.executeZCQLQuery(deleteQuery);
    console.log("Deleted successfully");
    res
      .status(200)
      .json({ msg: "Products Deleted successfully", status: "success" });
  } catch (error) {
    res.status(400).json({
      msg: "Failed to delete the tracking data",
      error: error,
      staus: "failed",
    });
  }
};

// DONE & CHECKED
const getProductDetailsByUrl = async (req,res) => {
  let url = req.body.url;
  let email = "";
  let exp_price = 1;
  await scrape(url, email, exp_price, req, res);
}

const updateTrackPricesPeriodically = async(req, res) => {
  var app = catalyst.initialize(req);
  let zcql = app.zcql();

  const dataQuery = `SELECT * FROM Track;`;
  try {
    let dataRes = await zcql.executeZCQLQuery(dataQuery);

    // alter dataRes
    dataRes = dataRes.map(item => item.Track)
    dataRes.forEach(item => delete item.Track);
    
    await cronJob(dataRes, zcql);
    res.send("Scraped");
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  postTrackDetails,
  getTrackDetails,
  updateExpectedPrices,
  deleteTrack,
  getTrackDetailsById,
  enableTracking,
  disableTracking,
  getAllTrackDetails,
  postTrackDetailsDirectly,
  deleteAllTracks,
  getProductDetailsByUrl,
  updateTrackPricesPeriodically
};
