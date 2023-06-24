// const wait = require("wait-for-stuff");
const { amazonfetchUrlDetails } = require("./amazonurlDetails");
const { amazonfetchReviews } = require("./amazonreviews");
const { amazonfetchIndividualDetails } = require("./amazondetails");
const { fields, save, amazonsql } = require("../text");
const amazontext = require("./amazontext");

const amazon = async (Categories) => {
  try {
    console.log(Categories);
    if (!Categories.length) {
      Categories = [Categories];
    }
    // Declaration of an array to store all the product details
    let listofproducts = [];

    // Running a loop to scrap each product
    for (let i = 0; i < Categories.length; i++) {
      listofproducts = [];

      //Creating the link to be scrapped
      let url = `https://www.amazon.in/s?k=${Categories[i].category}&page=0&crid=1EAMOLVYHA0EG&sprefix=suncream%2Caps%2C303&ref=sr_pg_0`;

      // Storing the number of data to be scraped in numData variable
      let numOfData = Categories[i].data;
      let category = Categories[i].category;
      let arr = [],
        data = [];

      //Scrapping the data from the provided url from all the pages
      for (let j = 0; j < 6; j++) {
        //Changing the page number to scrap data from the next page
        url = url.replace(`page=${j}&crid`, `page=${j + 1}&crid`);
        url = url.replace(`sr_pg_${j}`, `sr_pg_${j + 1}`);

        //function to scrap the data from the main page
        const allProductDetails = await amazonfetchUrlDetails(url);

        if (allProductDetails && allProductDetails.length) {
          //storing the coming data in arr
          arr = [...arr, ...allProductDetails];
        } else {
          j--;
        }
        console.log(arr.length);

        if (arr.length >= numOfData) {
          break;
        }
      }

      //arr contains the whole product but we need only required number of data so pushing the required number of data in data array
      for (let j = 0; j < Math.min(arr.length, numOfData); j++) {
        data = [...data, arr[j]];
      }

      // looping to go inside the individual products
      for (let j = 0; j < data.length; j++) {
        // wait.for.time(8);
        // scrapping all the required details by going inside every individual products
        let details = await amazonfetchIndividualDetails(data[j].Productlink);

        if (!details.ProductName) {
          j--;
          continue;
        }
        for (const key in details) {
          data[j][key] = details[key];
        }

        // Checking whether reviews page is available on the site or not
        if (details.reviewsLink !== "https://amazon.inundefined") {
          const totalReviewsandratings = await amazonfetchReviews(
            details.reviewsLink
          );
          for (const key in totalReviewsandratings) {
            data[j][key] = totalReviewsandratings[key];
          }
        }

        data[j][amazontext.A_PLATFORM_FD] = "Amazon";

        // Number of reviews is in percentage so converting in the numbers
        for (let k = 1; k <= 5; k++) {
          if (data[j][`Num_${k}_${amazontext.A_STARRATINGS1_FD}`]) {
            data[j][`Num_${k}_${amazontext.A_STARRATINGS1_FD}`] = Math.floor(
              (Number(data[j][`Num_${k}_${amazontext.A_STARRATINGS1_FD}`]) *
                Number(data[j][amazontext.A_RATINGS_FD])) /
                100
            );
          } else {
            data[j][`Num_${k}_${amazontext.A_STARRATINGS1_FD}`] = 0;
          }
        }

        let NetRatingRank =
          (data[j][`Num_5_${amazontext.A_STARRATINGS1_FD}`] +
            data[j][`Num_4_${amazontext.A_STARRATINGS1_FD}`] -
            (data[j][`Num_2_${amazontext.A_STARRATINGS1_FD}`] +
              data[j][`Num_1_${amazontext.A_STARRATINGS1_FD}`])) /
          (data[j][`Num_5_${amazontext.A_STARRATINGS1_FD}`] +
            data[j][`Num_4_${amazontext.A_STARRATINGS1_FD}`] +
            data[j][`Num_3_${amazontext.A_STARRATINGS1_FD}`] +
            (data[j][`Num_2_${amazontext.A_STARRATINGS1_FD}`] +
              data[j][`Num_1_${amazontext.A_STARRATINGS1_FD}`]));

        data[j][amazontext.A_NET_RATING_SCORE_FD] = NetRatingRank * 100;

        if (data[j].ProductName) {
          data[j][amazontext.A_TITLE_LENGTH_FD] =
            data[j][amazontext.A_PRODUCTNAME_FD].length;
        }

        if (data[j][amazontext.A_DESCRIPTION_FD]) {
          data[j][amazontext.A_DESCRIPTION_LENGTH_FD] =
            data[j][amazontext.A_DESCRIPTION_FD].length;
        }

        let date = new Date();

        data[j][amazontext.A_DATE_FD] = date.toLocaleDateString();

        data[j][amazontext.A_SEARCH_TERM_FD] = category;
        console.log(category);

        data[j][amazontext.A_POSITION_FD] = j + 1;

        let discount =
          (data[j][amazontext.A_MAXRETAILPRICE_FD] -
            data[j][amazontext.A_PRICE_FD]) /
          data[j][amazontext.A_MAXRETAILPRICE_FD];
        data[j][amazontext.A_DISCOUNT_FD] = Math.floor(discount * 100);

        data[j][amazontext.A_QUANTITY_FD] =
          data[j][amazontext.A_NET_QUANTITY_FD];

        // Separating the amount and unit from the quantity (i.e.,100ml->100 and ml)
        if (data[j][amazontext.A_QUANTITY_FD]) {
          const quantity = data[j][amazontext.A_QUANTITY_FD];
          const ar = quantity.split(" ");
          data[j].Quantity = Number(ar[0]);
          data[j][amazontext.A_QUANTITY_UNIT_FD] = ar[1];
          data[j][amazontext.A_PRICE_PER_UNIT_FD] =
            data[j][amazontext.A_PRICE_FD] / data[j][amazontext.A_QUANTITY_FD];
        } else {
          data[j][amazontext.A_QUANTITY_FD] = 1;
          data[j][amazontext.A_PRICE_PER_UNIT_FD] =
            data[j][amazontext.A_PRICE_FD] / data[j][amazontext.A_QUANTITY_FD];
          data[j][amazontext.A_QUANTITY_UNIT_FD] = "NA";
        }

        // Making a new array of product with required fields
        let obj = {};
        for (let k = 0; k < fields.length; k++) {
          if (data[j][fields[k]]) {
            obj[fields[k]] = data[j][fields[k]];
          } else {
            obj[fields[k]] = null;
          }
        }
        delete obj[amazontext.A_SELLERDETAILS_FD];
        delete obj[amazontext.A_POSITIVE_FIRST_FD];
        delete obj[amazontext.A_NEGATIVE_FIRST_FD];

        // console.log(await save(obj));
        listofproducts.push(obj);
        console.log(j);
      }
      await amazonsql(listofproducts);
    }
    return listofproducts;
  } catch (e) {
    console.log(e);
    return { message: "Something went wrong, try again later" };
  }
};

module.exports = { amazon };
