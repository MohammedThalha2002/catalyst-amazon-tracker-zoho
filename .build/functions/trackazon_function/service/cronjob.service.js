const cheerio = require("cheerio");
const { default: axios } = require("axios");

async function cronJob(details, zcql) {
  console.log("Scraping started");
  for (const detail of details) {
    await findPrice(detail, zcql);
  }
}

async function findPrice(detail, zcql) {
  // url, email, exp_price;
  console.log(detail.title);
  const url = detail.url;
  const exp_price = detail.exp_price;
  try {
    await getHTML(url).then(async (html) => {
      const $ = cheerio.load(html);
      let curr_price = $(".a-price-whole").text();
      curr_price = curr_price.replace(/,/g, "");
      curr_price = parseInt(curr_price);
      let inStock = $("#availability>span").text().trim();
      let rating = $("#acrPopover>span>a>span").text().trim();
      console.log(curr_price, inStock, rating);
      // updating the db on price or rating varied
      if (curr_price != detail.curr_price) {
        await updatePriceDetails(detail._id, curr_price, zcql);
      } else {
        console.log("Same price");
      }

      // notify the user on the price drop
      if (curr_price <= detail.exp_price) {
        console.log("price drop alert");
        console.log("Curr Price : ", curr_price);
        console.log("Exp Price : ", exp_price);
        notifyUser(detail, zcql);
      }
    });
  } catch (error) {
    console.log(error.response.statusText);
  }
}

const getHTML = async (url) => {
  const { data: html } = await axios.get(url);
  return html;
};

async function updatePriceDetails(id, curr_price, zcql) {
  const updateQuery = `
      UPDATE Track
      SET curr_price = ${curr_price}
      WHERE ROWID = '${id}';
    `;

  try {
    await zcql.executeZCQLQuery(updateQuery);
    console.log(curr_price, "price updated successfully");
  } catch (err) {
    console.log(err);
  }
}

async function notifyUser(body, zcql) {
  console.log(body);
  let email = body.email;

  let query = `select * from users where email = '${email}'`;
  let queryRes = await zcql.executeZCQLQuery(query);
  const result = queryRes[0].Users
  //
  console.log(result.email);
  let userId = result.userId;
  let token = result.token;

  const sandbox = `https://cliq.zoho.com/company/${userId}/api/v2/applications/2305843009213699174/incoming?appkey=sbx-NTIyMy0yNDAxZDViMi02YTVhLTQyZGUtOWNhYy1hNDc0NDg2NzU5M2Q=`;
  await axios
    .post(`${sandbox}&zapikey=${token}`, body)
    .then((result) => console.log(result.data))
    .catch((err) => console.log(err));
}

module.exports = cronJob;
