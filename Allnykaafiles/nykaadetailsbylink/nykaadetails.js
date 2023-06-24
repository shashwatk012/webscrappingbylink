const axios = require("axios");
const cheerio = require("cheerio");
const { headers, brands } = require("../text");
const nykaatext = require("./nykaatext");

const individualdetails = (html) => {
  // cheerio nodejs module to load html
  let $ = cheerio.load(html);

  // Declaration of object to store the product details
  let obj = {};

  // let a = $("div#brand_arrowUp").text();

  // Scraping the ProductName
  const ProductName = $(nykaatext.N_PRODUCTNAME_CN).text().trim();
  if (ProductName !== undefined) {
    obj[nykaatext.N_PRODUCTNAME_FD] = ProductName;
  }

  const pos = ProductName.indexOf("(");
  let pos1 = ProductName.indexOf(")");
  if (pos !== -1) {
    let Quantity = ProductName.substring(pos + 1, pos1);
    const splitArray = Quantity.match(/([\d\.]+)(.*)/);
    let QuantityUnit;
    if (splitArray && splitArray[2]) {
      QuantityUnit = splitArray[2].trim();
    }
    // matching all numbers
    if (splitArray && splitArray[1]) {
      Quantity = Number(splitArray[1]);
    }

    if (
      QuantityUnit === "gm" ||
      QuantityUnit === "ml" ||
      QuantityUnit === "g"
    ) {
      obj[nykaatext.N_QUANTITY_FD] = Number(Quantity);
      obj[nykaatext.N_QUANTITY_UNIT_FD] = QuantityUnit;
    } else {
      obj[nykaatext.N_QUANTITY_FD] = 1;
      obj[nykaatext.N_QUANTITY_UNIT_FD] = "NA";
    }
  } else {
    obj[nykaatext.N_QUANTITY_FD] = 1;
    obj[nykaatext.N_QUANTITY_UNIT_FD] = "NA";
  }

  let imagelink = $(nykaatext.N_IMAGELINK_CN).attr("src");
  obj[nykaatext.N_IMAGELINK_FD] = imagelink;

  const price = $(nykaatext.N_PRICE_CN).text();
  let arr = [];

  if (price) {
    arr = price.split("₹");
  }
  obj[nykaatext.N_PRICE_FD] = Number(arr[1]);

  obj[nykaatext.N_PRICE_PER_UNIT_FD] =
    obj[nykaatext.N_PRICE_FD] / obj[nykaatext.N_QUANTITY_FD];

  const maxretailprice = $(nykaatext.N_MAXRETAILPRICE_CN).text();

  if (maxretailprice) {
    arr = maxretailprice.split("₹");
  }

  obj[nykaatext.N_MAXRETAILPRICE_FD] = Number(arr[1]);

  const discount = $(nykaatext.N_DISCOUNT_CN).text();

  if (discount) {
    arr = discount.split("%");
  }

  obj[nykaatext.N_DISCOUNT_FD] = Number(arr[0]);

  // scraping the number of global ratings and reviews
  let ratingsandreviews = $(nykaatext.N_RATINGS_CN).text().trim();
  let ratings, reviews;
  if (ratingsandreviews) {
    arr = ratingsandreviews.split(" ");
    ratings = Number(arr[0]);
    reviews = Number(arr[arr.length - 2]);
  }

  // scraping the global rating(i.e 4.1)
  let stars = $(nykaatext.N_STARS_CN).text();

  if (stars) {
    arr = stars.split("/");
    obj[nykaatext.N_STARS_FD] = Number(arr[0]);
  }

  obj[nykaatext.N_RATINGS_FD] = ratings;
  obj[nykaatext.N_REVIEWS_FD] = reviews;

  $(nykaatext.N_DIFFRATINGS_CN).each(async (_idx, el) => {
    const x = $(el);
    const diffratings = x.text();
    obj[`Num_${5 - _idx}_${nykaatext.N_STARRATINGS_FD}`] = Number(diffratings);
  });

  let categories = [];
  $(nykaatext.N_LISTOFCATEGORIES_CN).each(async (_idx, el) => {
    const x = $(el);
    const category = x.find(nykaatext.N_CATEGORY_CN).text();
    categories.push(category);
  });
  obj[nykaatext.N_MOTHER_CATEGORY_FD] = categories[1];
  obj[nykaatext.N_CATEGORY_FD] = categories[2];
  obj[nykaatext.N_SUB_CATEGORY_FD] = categories[3];
  obj[nykaatext.N_PRODUCT_FD] = categories[categories.length - 1];

  //scraping the pagelink for the reviews
  const reviewsLink = $(nykaatext.N_REVIEWSLINK_CN).attr("href");
  if (reviewsLink !== undefined) {
    obj[
      nykaatext.N_REVIEWSLINK_FD
    ] = `${nykaatext.NYKAA_PAGE_LINK}${reviewsLink}`;
  }

  const posLink = $(nykaatext.N_POSLINK_CN).last().attr("href");
  obj[nykaatext.N_POSLINK_FD] = `${nykaatext.NYKAA_PAGE_LINK}${posLink}`;

  // Number of images
  let count = 1;
  $(nykaatext.N_NUMBEROFIMAGES_CN).each(async (_idx, el) => {
    count++;
  });
  obj[nykaatext.N_NUMBEROFIMAGES_FD] = count;

  if (ProductName) {
    let arr = ProductName.split(" ");
    const index = brands.findIndex((element) => element.includes(arr[0]));
    obj.Brand = brands[index];
  }
  return obj;
};

const nykaafetchIndividualDetails = async (url, browser, page) => {
  // function to scrap complete data about one product
  try {
    page = await browser.browser.newPage();

    await page.goto(url);

    await page.waitForTimeout(1000);

    let lastHeight = await page.evaluate("document.body.scrollHeight");

    while (true) {
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
      await page.waitForTimeout(1000); // sleep a bit
      let newHeight = await page.evaluate("document.body.scrollHeight");
      if (newHeight === lastHeight) {
        break;
      }
      lastHeight = newHeight;
    }

    // await page.hover("div.css-1m0y15j");

    const html = await page.content();

    await page.close();

    return individualdetails(html);
  } catch (error) {
    try {
      if (page) {
        await page.close();
      }

      // api to get html of the required page
      const response = await axios.get(url, headers);

      const html = response.data;

      let obj = individualdetails(html);
      let ProductName = obj.ProductName;

      let pos = ProductName.indexOf(")");

      ProductName = ProductName.substring(0, pos + 1);
      obj.ProductName = ProductName;

      pos = ProductName.indexOf("(");
      let pos1 = ProductName.indexOf(")");
      if (pos !== -1 && pos1 !== -1) {
        let Quantity = ProductName.substring(pos + 1, pos1 - 1);
        const splitArray = Quantity.match(/([\d\.]+)(.*)/);

        let QuantityUnit = "NA";
        if (splitArray && splitArray[2]) {
          QuantityUnit = splitArray[2].trim();
        }
        // matching all numbers
        if (splitArray && splitArray[1]) {
          Quantity = Number(splitArray[1]);
        }
        if (
          QuantityUnit === "gm" ||
          QuantityUnit === "ml" ||
          QuantityUnit === "g"
        ) {
          obj[nykaatext.N_QUANTITY_FD] = Number(Quantity);
          obj[nykaatext.N_QUANTITY_UNIT_FD] = QuantityUnit;
        } else {
          obj[nykaatext.N_QUANTITY_FD] = 1;
          obj[nykaatext.N_QUANTITY_UNIT_FD] = "NA";
        }
      } else {
        obj[nykaatext.N_QUANTITY_FD] = 1;
        obj[nykaatext.N_QUANTITY_UNIT_FD] = "NA";
      }
      return obj;
    } catch (e) {
      return { message: "NOT POSSIBLE" };
    }
  }
};

module.exports = { nykaafetchIndividualDetails };
