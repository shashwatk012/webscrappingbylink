"use strict";
const puppeteer = require("puppeteer");
const { nykaafetchIndividualDetails } = require("./nykaadetails");
const { nykaafetchReviews } = require("./nykaareviews");
const { fetchPosition } = require("./nykaafetchposition");
const { fields } = require("../text");
const nykaatext = require("./nykaatext");

const nykaabylink = async (body) => {
  try {
    let browser = await puppeteer.launch({
      headless: `true`,
      defaultViewport: false, // indicates not to use the default viewport size but to adjust to the user's screen resolution instead
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    let page;
    //Creating the link to be scrapped
    let url = body.link;

    const data = {
      Productlink: url,
    };

    // scrapping all the required details by going inside every individual products
    let details = await nykaafetchIndividualDetails(
      data.Productlink,
      { browser },
      page
    );
    if (details.message !== "NOT POSSIBLE") {
      for (let key in details) {
        data[key] = details[key];
      }
      for (let k = 1; k <= 5; k++) {
        if (!data[`${k} ${nykaatext.N_STARRATINGS_FD}`]) {
          data[`${k} ${nykaatext.N_STARRATINGS_FD}`] = 0;
        }
      }

      let NetRatingRank =
        (data[`Num_5_${nykaatext.N_STARRATINGS_FD}`] +
          data[`Num_4_${nykaatext.N_STARRATINGS_FD}`] -
          (data[`Num_2_${nykaatext.N_STARRATINGS_FD}`] +
            data[`Num_1_${nykaatext.N_STARRATINGS_FD}`])) /
        (data[`Num_5_${nykaatext.N_STARRATINGS_FD}`] +
          data[`Num_4_${nykaatext.N_STARRATINGS_FD}`] +
          data[`Num_3_${nykaatext.N_STARRATINGS_FD}`] +
          (data[`Num_2_${nykaatext.N_STARRATINGS_FD}`] +
            data[`Num_5_${nykaatext.N_STARRATINGS_FD}`]));

      data[nykaatext.N_NET_RATING_SCORE_FD] = NetRatingRank * 100;
    }

    if (details.reviewsLink !== undefined) {
      const totalReviewsandratings = await nykaafetchReviews(
        data.reviewsLink,
        { browser },
        page,
        data[nykaatext.N_PRODUCTNAME_FD]
      );
      if (totalReviewsandratings.message !== "NOT POSSIBLE") {
        for (let key in totalReviewsandratings) {
          data[key] = totalReviewsandratings[key];
        }
      }
    }

    if (details.posLink !== undefined) {
      const pos = await fetchPosition(
        details.posLink,
        { browser },
        page,
        data[nykaatext.N_PRODUCTNAME_FD]
      );
      data[nykaatext.N_POSITION_FD] = pos;
    }

    data[nykaatext.N_PLATFORM_FD] = "nykaa";

    if (data[nykaatext.N_PRODUCTNAME_FD]) {
      data[nykaatext.N_TITLE_LENGTH_FD] =
        data[nykaatext.N_PRODUCTNAME_FD].length;
    }

    let date = new Date();

    data[nykaatext.N_DATE_FD] = date.toLocaleDateString();

    // Making a new array of product with required fields and in required order
    let obj = {};
    for (let k = 0; k < fields.length; k++) {
      if (data[fields[k]]) {
        obj[fields[k]] = data[fields[k]];
      } else {
        obj[fields[k]] = null;
      }
    }
    await browser.close();
    return obj;
  } catch (e) {
    console.log(e);
    return { message: "Unable to fetch. Try again later" };
  }
};

module.exports = { nykaabylink };
