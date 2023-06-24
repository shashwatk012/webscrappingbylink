"use strict";
const puppeteer = require("puppeteer");
const { nykaafetchIndividualDetails } = require("./nykaadetails");
const { nykaafetchUrlDetails } = require("./nykaaurldetails");
const { nykaafetchUrlDetails1 } = require("./nykaaurldetails1");
const { nykaafetchReviews } = require("./nykaareviews");
const { check } = require("./checkformat");
const { fields, save, nykaasql } = require("../text");
const nykaatext = require("./nykaatext");

const urlmaking = (category) => {
  const url = `https://www.nykaa.com/search/result/?q=${category}&root=search&searchType=history&suggestionType=query&ssp=2&searchItem=${category}&sourcepage=home&`;
  return url;
};

const nykaa = async (Categories) => {
  try {
    console.log(Categories);
    if (!Categories.length) {
      Categories = [Categories];
    }
    // Declaration of an array to store all the product details
    let listofproducts = [];

    let browser = await puppeteer.launch({
      headless: `true`,
      defaultViewport: false, // indicates not to use the default viewport size but to adjust to the user's screen resolution instead
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    let page;

    // Running a loop to scrap each product
    for (let i = 0; i < Categories.length; i++) {
      listofproducts = [];

      // Storing the number of data to be scraped in numData variable
      let numOfData = Categories[i].data;
      let category = Categories[i].category;

      //Creating the link to be scrapped
      let url = urlmaking(Categories[i].category);

      let arr = [];
      let data = [];

      const flag = await check(url, { browser }, page);
      if (flag === "NOT POSSIBLE") {
        continue;
      }

      //function to scrap the data from the main page
      if (flag) {
        const allProductDetails = await nykaafetchUrlDetails(
          url,
          { browser },
          page
        );
        if (!allProductDetails[0].message) {
          //storing the coming data in arr
          arr = [...arr, ...allProductDetails];
        }

        allProductDetails.length = 0;
      } else {
        const allProductDetails = await nykaafetchUrlDetails1(
          url,
          { browser },
          page
        );
        if (!allProductDetails[0].message) {
          //storing the coming data in arr
          arr = [...arr, ...allProductDetails];
        }
        allProductDetails.length = 0;
      }

      console.log(arr.length);

      //arr contains the whole product but we need only required number of data so pushing the required number of data in data array
      for (let j = 0; j < Math.min(arr.length, numOfData); j++) {
        data[j] = arr[j];
      }

      // looping to go inside the individual products
      for (let j = 0; j < data.length; j++) {
        // scrapping all the required details by going inside every individual products
        let details = await nykaafetchIndividualDetails(
          data[j].Productlink,
          { browser },
          page
        );
        if (details.message !== "NOT POSSIBLE") {
          for (let key in details) {
            data[j][key] = details[key];
          }
          for (let k = 1; k <= 5; k++) {
            if (!data[`Num_${k}_${nykaatext.N_STARRATINGS_FD}`]) {
              data[`Num_${k}_${nykaatext.N_STARRATINGS_FD}`] = 0;
            }
          }

          let NetRatingRank =
            (data[j][`Num_5_${nykaatext.N_STARRATINGS_FD}`] +
              data[j][`Num_4_${nykaatext.N_STARRATINGS_FD}`] -
              (data[j][`Num_2_${nykaatext.N_STARRATINGS_FD}`] +
                data[j][`Num_1_${nykaatext.N_STARRATINGS_FD}`])) /
            (data[j][`Num_5_${nykaatext.N_STARRATINGS_FD}`] +
              data[j][`Num_4_${nykaatext.N_STARRATINGS_FD}`] +
              data[j][`Num_3_${nykaatext.N_STARRATINGS_FD}`] +
              (data[j][`Num_2_${nykaatext.N_STARRATINGS_FD}`] +
                data[j][`Num_5_${nykaatext.N_STARRATINGS_FD}`]));

          data[j][nykaatext.N_NET_RATING_SCORE_FD] = NetRatingRank * 100;
        }

        // if (details.reviewsLink !== undefined) {
        //   const totalReviewsandratings = await nykaafetchReviews(
        //     data[j].reviewsLink,
        //     browser,
        //     page,
        //     data[j]["ProductName"]
        //   );
        //   if (totalReviewsandratings.message !== "NOT POSSIBLE") {
        //     for (let key in totalReviewsandratings) {
        //       data[j][key] = totalReviewsandratings[key];
        //     }
        //   }
        // }

        data[j][nykaatext.N_PLATFORM_FD] = "nykaa";

        if (data[j][nykaatext.N_PRODUCTNAME_FD]) {
          data[j][nykaatext.N_TITLE_LENGTH_FD] =
            data[j][nykaatext.N_PRODUCTNAME_FD].length;
        }

        let date = new Date();

        data[j][nykaatext.N_DATE_FD] = date.toLocaleDateString();

        data[j][nykaatext.N_SEARCH_TERM_FD] = category;

        data[j][nykaatext.N_POSITION_FD] = j + 1;

        // Making a new array of product with required fields
        let obj = {};
        for (let k = 0; k < fields.length; k++) {
          if (data[j][fields[k]]) {
            obj[fields[k]] = data[j][fields[k]];
          } else {
            obj[fields[k]] = null;
          }
        }
        delete obj[nykaatext.N_MOST_USEFUL_FD];
        delete obj[nykaatext.N_MOST_POSITIVE_FD];
        delete obj[nykaatext.N_MOST_NEGATIVE_FD];
        delete obj[nykaatext.N_SELLERDETAILS_FD];

        listofproducts.push(obj);

        // console.log(await save(obj));
        console.log(j);
      }
      await nykaasql(listofproducts);
    }
    await browser.close();
    return listofproducts;
  } catch (e) {
    console.log(e);
    return [{ message: "Unable to fetch. Try again later" }];
  }
};

module.exports = { nykaa };
