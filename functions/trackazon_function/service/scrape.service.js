const cheerio = require("cheerio");
const { default: axios } = require("axios");
var catalyst = require("zcatalyst-sdk-node");

const scrape = async (url, email, exp_price, req, res) => {
  try {
    await getHTML(url).then(async (html) => {
      const $ = cheerio.load(html);
      let curr_price = $(".a-price-whole").text();
      curr_price = curr_price.replace(/,/g, "");
      curr_price = parseInt(curr_price);
      if (exp_price > curr_price) {
        res.status(400).json({
          msg: "Expected price is lesser than the current price",
          status: "price-error",
        });
        return;
      }
      let title = $("#productTitle")
        .text()
        .trim()
        .replace(/[|&;$%@"<>()+,]/g, "");
      if (title.length > 100) {
        if (title.includes(",")) {
          title = title.split(",")[0];
        } else {
          title = title.substring(0, 90) + "...";
        }
      }
      let features = [];
      $("#feature-bullets>ul>li").each((i, desc) => {
        if (i < 2) {
          features.push(
            $(desc)
              .text()
              .trim()
              .replace(/[|&;$%@"<>()+,]/g, "")
          );
        }
      });
      let imgUrl = $("#imgTagWrapperId>img").attr("src");
      let inStock =
        $("#availability>span").text().trim() == "In stock" ? true : false;
      let rating = parseFloat($("#acrPopover>span>a>span").text().trim());

      const data = {
        url: url,
        title: title,
        features: features,
        imgUrl: imgUrl,
        inStock: inStock,
        rating: rating,
        exp_price: exp_price,
        curr_price: curr_price,
        email: email,
      };

      console.log(data);

      //
      if (email) {
        var app = catalyst.initialize(req);
        let zcql = app.zcql();

        let query = `
      INSERT INTO Track (url, title, features, img_url, inStock, rating, exp_price, curr_price, email)
      VALUES ('${url}', '${title}', '${JSON.stringify(
          features
        )}', '${imgUrl}', ${inStock}, ${rating}, ${exp_price}, ${curr_price}, '${email}')`;

        await zcql.executeZCQLQuery(query);
      }
      //
      res.status(200).json({
        msg: "Tracking data uploaded successfully",
        status: "success",
        data: data,
      });
    });
  } catch (error) {
    console.log("Failed to fetch the data from the url");
    console.log(error);
    const data = {
      url: url,
      title: "Updating...",
      features: ["Updating...", "Updating..."],
      imgUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/310px-Placeholder_view_vector.svg.png",
      inStock: true,
      rating: 0.0,
      exp_price: exp_price,
      curr_price: 0.0,
      email: email,
    };
    console.log("Saving Failed data");
    console.log(data);
    res.status(200).json({
      msg: "Failed to upload the tracking data",
      error: error,
      status: "error",
      data: data,
    });
  }
};

const getHTML = async (url) => {
  const { data: html } = await axios.get(url);
  return html;
};

module.exports = scrape;
