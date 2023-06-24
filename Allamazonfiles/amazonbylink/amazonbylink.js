const { amazonfetchReviews } = require("./amazonreviews");
const { amazonfetchIndividualDetails } = require("./amazondetails");
const { typesOfRatings, fields } = require("../text");
// const puppeteer = require("puppeteer");
const amazontext = require("./amazontext");

const puppeteer = require("puppeteer-extra");

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const { executablePath } = require("puppeteer");

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const amazonbylink = async (url) => {
  try {
    let browser, page;
    browser = await puppeteer.launch({
      headless: `true`, // indicates that we want the browser visible
      defaultViewport: false, // indicates not to use the default viewport size but to adjust to the user's screen resolution instead
      // userDataDir: "./tmp", // caches previous actions for the website. Useful for remembering if we've had to solve captchas in the past so we don't have to resolve them
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: executablePath(),
      // devtools: true,
    });
    console.log(url);
    let data = {
      Productlink: url,
    };

    // scrapping all the required details by going inside the given url
    let details = await amazonfetchIndividualDetails(
      data.Productlink,
      { browser },
      page
    );
    for (const key in details) {
      data[key] = details[key];
    }

    // Checking whether reviews page is available on the site or not
    if (details.reviewsLink !== "https://amazon.inundefined") {
      const totalReviewsandratings = await amazonfetchReviews(
        details.reviewsLink,
        { browser },
        page
      );
      for (const key in totalReviewsandratings) {
        data[key] = totalReviewsandratings[key];
      }

      // looping to scrap the different kinds of reviews such as "MOST_RECENT", "POSITIVE", "NEGATIVE"
      for (const element of typesOfRatings) {
        const str =
          details.reviewsLink + `&pageNumber=1&filterByStar=${element}`;
        const data1 = await amazonfetchReviews(str, { browser }, page);
        if (data1.Reviews) {
          data[`${element} reviews and ratings`] = data1.Reviews;
        }
        if (data1.top10reviews) {
          data[`${element}`] = data1.top10reviews;
        }
      }
    }
    data[amazontext.A_PLATFORM_FD] = "Amazon";

    // Number of reviews is in percentage so converting in the numbers
    for (let k = 1; k <= 5; k++) {
      if (data[`Num_${k}_${amazontext.A_STARRATINGS1_FD}`]) {
        data[`Num_${k}_${amazontext.A_STARRATINGS1_FD}`] = Math.floor(
          (Number(data[`Num_${k}_${amazontext.A_STARRATINGS1_FD}`]) *
            Number(data[amazontext.A_RATINGS_FD])) /
            100
        );
      } else {
        data[`${k} ${amazontext.A_STARRATINGS1_FD}`] = 0;
      }
    }

    let NetRatingRank =
      (data[`Num_5_${amazontext.A_STARRATINGS1_FD}`] +
        data[`Num_4_${amazontext.A_STARRATINGS1_FD}`] -
        (data[`Num_2_${amazontext.A_STARRATINGS1_FD}`] +
          data[`Num_1_${amazontext.A_STARRATINGS1_FD}`])) /
      (data[`Num_5_${amazontext.A_STARRATINGS1_FD}`] +
        data[`Num_4_${amazontext.A_STARRATINGS1_FD}`] +
        data[`Num_3_${amazontext.A_STARRATINGS1_FD}`] +
        (data[`Num_2_${amazontext.A_STARRATINGS1_FD}`] +
          data[`Num_1_${amazontext.A_STARRATINGS1_FD}`]));

    data[amazontext.A_NET_RATING_SCORE_FD] = NetRatingRank * 100;

    if (data.ProductName) {
      data[amazontext.A_TITLE_LENGTH_FD] =
        data[amazontext.A_PRODUCTNAME_FD].length;
    }

    if (data[amazontext.A_DESCRIPTION_FD]) {
      data[amazontext.A_DESCRIPTION_LENGTH_FD] =
        data[amazontext.A_DESCRIPTION_FD].length;
    }

    let date = new Date();

    data[amazontext.A_DATE_FD] = date.toLocaleDateString();

    let discount =
      (data[amazontext.A_MAXRETAILPRICE_FD] - data[amazontext.A_PRICE_FD]) /
      data[amazontext.A_MAXRETAILPRICE_FD];
    data[amazontext.A_DISCOUNT_FD] = Math.floor(discount * 100);

    data[amazontext.A_QUANTITY_FD] = data[amazontext.A_NET_QUANTITY_FD];

    // Separating the amount and unit from the quantity (i.e.,100ml->100 and ml)
    if (data.Quantity) {
      const quantity = data.Quantity;
      const ar = quantity.split(" ");
      data.Quantity = Number(ar[0]);
      data[amazontext.A_QUANTITY_UNIT_FD] = ar[1];
      data[amazontext.A_PRICE_PER_UNIT_FD] =
        data[amazontext.A_PRICE_FD] / data.Quantity;
    } else {
      data.Quantity = 1;
      data[amazontext.A_PRICE_PER_UNIT_FD] =
        data[amazontext.A_PRICE_FD] / data.Quantity;
      data[amazontext.A_QUANTITY_UNIT_FD] = "NA";
    }

    // Making a new array of product with required fields
    let obj = {};
    for (let k = 0; k < fields.length; k++) {
      if (data[fields[k]]) {
        obj[fields[k]] = data[fields[k]];
      } else {
        obj[fields[k]] = "NA";
      }
    }
    await browser.close();

    return obj;
  } catch (e) {
    console.log(e);
  }
};

module.exports = { amazonbylink };
