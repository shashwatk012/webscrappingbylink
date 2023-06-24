"use strict";
// In this file all the reusable code are put together so that they can be called as per need.

// Establishing the connection to database
const connection = require("../connection");

const axios = require("axios");

const save = async (obj) => {
  const response = await axios({
    method: "post",
    url: "https://www.publiqverse.io/version-62l7/api/1.1/obj/ProductCatalogue",
    data: obj,
  });

  let html = response.data;
  return html;
};

// headers to send with api request to sites to avoid blockage
const headers = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.9,la;q=0.8",
  Host: "httpbin.org",
  "Sec-Ch-Ua":
    '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "cross-site",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
  "X-Amzn-Trace-Id": "Root=1-646baec9-23c65be55fbb54967e9160ef",
};

const allProducts =
  "div._1YokD2._2GoDe3>div._1YokD2._3Mn1Gg>div._1AtVbE.col-12-12>div._13oc-S>div";
const imglink = "img._396cs4";

// Types of rating we want to scrap
const typesOfRatings = ["POSITIVE_FIRST", "NEGATIVE_FIRST"];

// function to convert the given category into url in order to scrap the data.
const urlmaking = (category) => {
  const url = `https://www.flipkart.com/search?q=${category}&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off`;
  return url;
};

//Order of fields we want in the final output
const fields = [
  "Imagelink",
  "Productlink",
  "Position",
  "Product",
  "ProductName",
  "Brand",
  "Price",
  "Price_Per_Unit",
  "Max_Retail_Price",
  "Stars",
  "Ratings",
  "Reviews",
  "Mother_Category",
  "Category",
  "Sub_Category",
  "Num_5_Star_Ratings",
  "Num_4_Star_Ratings",
  "Num_3_Star_Ratings",
  "Num_2_Star_Ratings",
  "Num_1_Star_Ratings",
  "Platform",
  "Quantity",
  "Quantity_Unit",
  "Number_Of_Sellers",
  "SellerDetails",
  "Description",
  "Number_Of_Images",
  "IsAds",
  "POSITIVE_FIRST",
  "NEGATIVE_FIRST",
  "Net_Rating_Score_NRS",
  "Discount%",
  "Search_Term",
  "Min_Price",
  "Max_Price",
  "St_Dev_Price",
  "Title_Length",
  "Description_Length",
  "Date",
];

// function to convert the string into Number by removing the unwanted symbols.
const replce = (str) => {
  while (str.includes(",")) {
    str = str.replace(",", "");
  }
  while (str.includes("₹")) {
    str = str.replace("₹", "");
  }
  return Number(str);
};

// Saving the data to the flipkartdatabase
let flipkartsql = async (listofproducts) => {
  // Inserting the data into database
  let Product =
    "INSERT INTO FLIPKART_PRODUCT_TABLE (Imagelink,Productlink, Position,Product, ProductName , Brand , Price ,Price_Per_Unit, Max_Retail_Price , Stars, Ratings , Reviews , Mother_Category , Category ,Sub_Category,Num_1_Star_Ratings ,Num_2_Star_Ratings ,Num_3_Star_Ratings ,Num_4_Star_Ratings ,Num_5_Star_Ratings ,Platform,Quantity ,Quantity_Unit, Number_Of_Sellers , Description, Number_Of_Images ,IsAds,Net_Rating_Score_NRS, Discount ,Search_Term ,Min_Price , Max_Price , St_Dev_Price, Title_Length , Description_Length , Date) VALUES ?";

  let values = [];

  //Make an array of values:
  for (let i = 0; i < listofproducts.length; i++) {
    let keys = [];

    for (let value in listofproducts[i]) {
      keys.push(listofproducts[i][value]);
    }
    values.push(keys);
  }

  //Execute the SQL statement, with the value array:
  if (values.length > 0) {
    connection.query(Product, [values], function (err, result) {
      if (err) throw err;
      console.log("Number of reco rds inserted: " + result.affectedRows);
    });
  }

  // connection.query(
  //   "SELECT * FROM FLIPKART_PRODUCT_TABLE",
  //   function (err, result, fields) {
  //     if (err) throw err;
  //     convertJSONtoCSV(result, listofsellers, listofreviews, 1);
  //   }
  // );
};

// Exporting all the fields so that they can be accessed from other files whenever neccessary
module.exports = {
  headers,
  allProducts,
  imglink,
  typesOfRatings,
  urlmaking,
  fields,
  replce,
  flipkartsql,
  save,
};
