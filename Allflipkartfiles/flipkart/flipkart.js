"use strict";
// Importing all the required modules
const { flipkartfetchUrlDetails } = require("./flipkarturlDetails");
const { flipkartfetchReviews } = require("./flipkartreviews");
const { flipkartfetchIndividualDetails } = require("./flipkartdetails");
const { flipkartsellerslist } = require("./flipkartsellerslist");
const {
  typesOfRatings,
  fields,
  urlmaking,
  flipkartsql,
  save,
} = require("../text");
const puppeteer = require("puppeteer");
const flipkarttext = require("./flipkarttext");

const flipkart = async (Categories) => {
  try {
    console.log(Categories);
    if (!Categories.length) {
      Categories = [Categories];
    }
    // Declaration of an array to store all the product details
    let listofproducts = [];
    // Running a loop to scrap each product
    for (let i = 0; i < Categories.length; i++) {
      let page;
      let browser = await puppeteer.launch({
        headless: `true`,
        defaultViewport: false, // indicates not to use the default viewport size but to adjust to the user's screen resolution instead
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      listofproducts = [];

      // Storing the number of data to be scraped in numData variable
      let numOfData = Categories[i].data;
      let category = Categories[i].category;

      //Creating the link to be scrapped
      let url = urlmaking(Categories[i].category);

      let arr = [];
      let data = [];
      let check = 0;
      for (let i = 0; i < 10; i++) {
        //Scrapping the data from the provided url from all the pages
        let urls = url;

        //Changing the page number to scrap data from the next page
        urls += `&page=${i + 1}`;

        //function to scrap the data from the main page
        const allProductDetails = await flipkartfetchUrlDetails(urls);

        if (check < 3 && allProductDetails.length === 0) {
          i--;
          check++;
        } else if (allProductDetails.length === 0) {
          break;
        }
        //storing the coming data in arr
        arr = [...arr, ...allProductDetails];
        allProductDetails.length = 0;
        if (arr.length >= numOfData) {
          break;
        }
      }
      console.log(arr.length);

      //arr contains the whole product but we need only required number of data so pushing the required number of data in data array
      for (let j = 0; j < Math.min(arr.length, numOfData); j++) {
        data[j] = arr[j];
      }

      // looping to go inside the individual products
      for (let j = 0; j < data.length; j++) {
        // scrapping all the required details by going inside every individual products
        let details = await flipkartfetchIndividualDetails(
          data[j].Productlink,
          { browser },
          page
        );
        if (!details.message) {
          for (let key in details) {
            data[j][key] = details[key];
          }
        }

        // Scrapping the sellers details
        if (details.sellerslink !== undefined) {
          const sellers = await flipkartsellerslist(
            details.sellerslink,
            { browser },
            page,
            data[j][flipkarttext.F_PRODUCTNAME_FD]
          );
          if (sellers.message === "Can not fetch") {
            continue;
          }
          data[j][flipkarttext.F_NUMBEROFSELLERS_FD] =
            sellers.Number_Of_Sellers;
          data[j][flipkarttext.F_SELLERDETAILS_FD] = sellers.SellersDetails;
          data[j][flipkarttext.F_MAX_PRICE_FD] =
            sellers[flipkarttext.F_MAX_PRICE_FD];
          data[j][flipkarttext.F_MIN_PRICE_FD] =
            sellers[flipkarttext.F_MIN_PRICE_FD];
          data[j][flipkarttext.F_ST_DEV_PRICE_FD] =
            sellers[flipkarttext.F_ST_DEV_PRICE_FD];
        }

        data[j][flipkarttext.F_PLATFORM_FD] = "Flipkart";

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
              data[j][flipkarttext.F_PRODUCTNAME_FD]
            );
            if (!totalReviewsandratings.message) {
              for (let key in totalReviewsandratings) {
                data[j][key] = totalReviewsandratings[key];
              }
            }
            break;
          }

          for (let k = 1; k <= 5; k++) {
            if (!data[j][`Num_${k}_${flipkarttext.F_STARRATINGS_FD}`]) {
              data[j][`Num_${k}_${flipkarttext.F_STARRATINGS_FD}`] = 0;
            }
          }

          let NetRatingRank =
            (data[j][`Num_5_${flipkarttext.F_STARRATINGS_FD}`] +
              data[j][`Num_4_${flipkarttext.F_STARRATINGS_FD}`] -
              (data[j][`Num_2_${flipkarttext.F_STARRATINGS_FD}`] +
                data[j][`Num_1_${flipkarttext.F_STARRATINGS_FD}`])) /
            (data[j][`Num_5_${flipkarttext.F_STARRATINGS_FD}`] +
              data[j][`Num_4_${flipkarttext.F_STARRATINGS_FD}`] +
              data[j][`Num_3_${flipkarttext.F_STARRATINGS_FD}`] +
              (data[j][`Num_2_${flipkarttext.F_STARRATINGS_FD}`] +
                data[j][`Num_1_${flipkarttext.F_STARRATINGS_FD}`]));

          data[j][flipkarttext.F_NET_RATING_SCORE_FD] = NetRatingRank * 100;
        }

        if (data[j][flipkarttext.F_PRODUCTNAME_FD]) {
          data[j][flipkarttext.F_TITLE_LENGTH_FD] =
            data[j][flipkarttext.F_PRODUCTNAME_FD].length;
        }
        if (data[j][flipkarttext.F_DESCRIPTION_FD]) {
          data[j][flipkarttext.F_DESCRIPTION_LENGTH_FD] =
            data[j][flipkarttext.F_DESCRIPTION_FD].length;
        }

        let date = new Date();

        data[j][flipkarttext.F_DATE_FD] = date.toLocaleDateString();

        data[j][flipkarttext.F_SEARCH_TERM_FD] = category;
        console.log(category);

        data[j][flipkarttext.F_POSITION_FD] = j + 1;

        // Separating the amount and unit from the quantity (i.e.,100ml->100 and ml)
        if (data[j].Quantity) {
          const quantity = data[j].Quantity;
          const ar = quantity.split(" ");
          data[j].Quantity = Number(ar[0]);
          data[j][flipkarttext.F_QUANTITY_UNIT_FD] = ar[1];
          data[j][flipkarttext.F_PRICE_PER_UNIT_FD] =
            data[j][flipkarttext.F_PRICE_FD] / data[j].Quantity;
        } else {
          data[j].Quantity = 1;
          data[j][flipkarttext.F_PRICE_PER_UNIT_FD] =
            data[j][flipkarttext.F_PRICE_FD] / data[j].Quantity;
          data[j][flipkarttext.F_QUANTITY_UNIT_FD] = "NA";
        }

        // Making a new array of product with required fields and in required order
        let obj = {};
        for (let k = 0; k < fields.length; k++) {
          if (data[j][fields[k]]) {
            obj[fields[k]] = data[j][fields[k]];
          } else {
            obj[fields[k]] = null;
          }
        }
        // await sql(obj);

        delete obj[flipkarttext.F_SELLERDETAILS_FD];
        delete obj[flipkarttext.F_POSITIVE_FIRST_FD];
        delete obj[flipkarttext.F_NEGATIVE_FIRST_FD];

        // console.log(await save(obj));

        listofproducts.push(obj);

        console.log(j);
      }
      await browser.close();
      await flipkartsql(listofproducts);
    }
    return listofproducts;
  } catch (e) {
    console.log(e);
    return [{ message: "Unable to fetch. Try again later" }];
  }
};

module.exports = { flipkart };
