// Importing the file to scrap the given products positive and negative reviews from flipkart
const { flipkartfetchReviews } = require("./flipkartreviews");

// Importing the file to scrap the given complete products details from flipkart
const { flipkartfetchIndividualDetails } = require("./flipkartdetails");

// Importing the file to scrap the given products sellers details from flipkart
const { flipkartsellerslist } = require("./flipkartsellerslist");

// Importing text.js file to use the reusable codes
const { typesOfRatings, fields } = require("../text");

const { flipkartPosition } = require("./flipkartposition");

const puppeteer = require("puppeteer");
const flipkartbylinktext = require("./flipkartbylinktext");

const flipkartbylink = async (url) => {
  try {
    let page;
    let browser = await puppeteer.launch({
      headless: `true`,
      defaultViewport: false, // indicates not to use the default viewport size but to adjust to the user's screen resolution instead
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    let flag = true;

    // Creating an object which is going to be the response of the coming request
    const data = {
      Productlink: url,
    };

    // scrapping all the required details by going inside every individual products
    let details = await flipkartfetchIndividualDetails(url, { browser }, page);
    if (details.message === "Can not fetch") {
      flag = false;
    }

    // Inserting all the data into data object
    for (let key in details) {
      data[key] = details[key];
    }

    if (details.mainPagelink) {
      let res = 0;
      for (let i = 0; i < 5; i++) {
        //Scrapping the data from the provided url from all the pages
        let urls = details.mainPagelink;

        //Changing the page number to scrap data from the next page
        urls += `&page=${i + 1}`;

        //function to scrap the data from the main page
        const pos = await flipkartPosition(urls, details.ProductName);
        if (pos.Position) {
          data.Position = res + pos.Position;
          break;
        }
        res += pos.totalproducts;
      }
      if (!data.Position) {
        data.Position = "100+";
      }
    }

    // Scrapping the sellers details
    if (details.sellerslink !== undefined) {
      const sellers = await flipkartsellerslist(
        details.sellerslink,
        { browser },
        page,
        data[flipkartbylinktext.F_PRODUCTNAME_FD]
      );
      data[flipkartbylinktext.F_NUMBEROFSELLERS_FD] = sellers.NumberofSellers;
      data[flipkartbylinktext.F_SELLERDETAILS_FD] = sellers.sellersDetails;
      data[flipkartbylinktext.F_MAX_PRICE_FD] =
        sellers[flipkartbylinktext.F_MAX_PRICE_FD];
      data[flipkartbylinktext.F_MIN_PRICE_FD] =
        sellers[flipkartbylinktext.F_MIN_PRICE_FD];
      data[flipkartbylinktext.F_ST_DEV_PRICE_FD] =
        sellers[flipkartbylinktext.F_ST_DEV_PRICE_FD];
    }

    data[flipkartbylinktext.F_PLATFORM_FD] = "Flipkart";

    // Checking whether reviews page is available on the site or not
    if (details.reviewsLink !== undefined) {
      let url1 = details.reviewsLink;
      url1 = url1.replace(
        "&marketplace=FLIPKART",
        "&aid=overall&certifiedBuyer=false&sortOrder="
      );

      // looping to scrap the different kinds of reviews such as "MOST_RECENT", "POSITIVE", "NEGATIVE"
      for (let key of typesOfRatings) {
        let urls = url1 + `${key}`;
        const totalReviewsandratings = await flipkartfetchReviews(
          urls,
          key,
          { browser },
          page,
          data[flipkartbylinktext.F_PRODUCTNAME_FD]
        );
        if (!totalReviewsandratings.message) {
          for (let key in totalReviewsandratings) {
            data[key] = totalReviewsandratings[key];
          }
        }
      }

      for (let k = 1; k <= 5; k++) {
        if (!data[`Num_${k}_${flipkartbylinktext.F_STARRATINGS_FD}`]) {
          data[`Num_${k}_${flipkartbylinktext.F_STARRATINGS_FD}`] = 0;
        }
      }

      let NetRatingRank =
        (data[`Num_5_${flipkartbylinktext.F_STARRATINGS_FD}`] +
          data[`Num_4_${flipkartbylinktext.F_STARRATINGS_FD}`] -
          (data[`Num_2_${flipkartbylinktext.F_STARRATINGS_FD}`] +
            data[`Num_1_${flipkartbylinktext.F_STARRATINGS_FD}`])) /
        (data[`Num_5_${flipkartbylinktext.F_STARRATINGS_FD}`] +
          data[`Num_4_${flipkartbylinktext.F_STARRATINGS_FD}`] +
          data[`Num_3_${flipkartbylinktext.F_STARRATINGS_FD}`] +
          (data[`Num_2_${flipkartbylinktext.F_STARRATINGS_FD}`] +
            data[`Num_1_${flipkartbylinktext.F_STARRATINGS_FD}`]));

      data[flipkartbylinktext.F_NET_RATING_SCORE_FD] = NetRatingRank * 100;
    }

    if (data[flipkartbylinktext.F_PRODUCTNAME_FD]) {
      data[flipkartbylinktext.F_TITLE_LENGTH_FD] =
        data[flipkartbylinktext.F_PRODUCTNAME_FD].length;
    }
    if (data[flipkartbylinktext.F_DESCRIPTION_FD]) {
      data[flipkartbylinktext.F_DESCRIPTION_LENGTH_FD] =
        data[flipkartbylinktext.F_DESCRIPTION_FD].length;
    }

    let date = new Date();

    data[flipkartbylinktext.F_DATE_FD] = date.toLocaleDateString();

    // Separating the amount and unit from the quantity (i.e.,100ml->100 and ml)
    if (data.Quantity) {
      const quantity = data.Quantity;
      const ar = quantity.split(" ");
      data.Quantity = Number(ar[0]);
      data[flipkartbylinktext.F_QUANTITY_UNIT_FD] = ar[1];
      data[flipkartbylinktext.F_PRICE_PER_UNIT_FD] =
        data[flipkartbylinktext.F_PRICE_FD] / data.Quantity;
    } else {
      data.Quantity = 1;
      data[flipkartbylinktext.F_PRICE_PER_UNIT_FD] =
        data[flipkartbylinktext.F_PRICE_FD] / data.Quantity;
      data[flipkartbylinktext.F_QUANTITY_UNIT_FD] = "NA";
    }

    // Making a new array of product details with required fields and in required order
    let obj = {};
    for (let k = 0; k < fields.length; k++) {
      if (data[fields[k]]) {
        obj[fields[k]] = data[fields[k]];
      } else {
        obj[fields[k]] = "NA";
      }
    }
    await browser.close();
    if (!flag) {
      return "Something went wrong! Try again";
    } else {
      return obj;
    }
  } catch (e) {
    return "Something went wrong! Try again";
  }
};

module.exports = { flipkartbylink };
