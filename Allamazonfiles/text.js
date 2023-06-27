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
  "BSR_in_Mother_Category",
  "BSR_in_Category",
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
let amazonsql = async (listofproducts) => {
  // Inserting the data into database
  let Product =
    "INSERT INTO AMAZON_PRODUCT_TABLE (Imagelink,Productlink, Position,Product, ProductName , Brand , Price ,Price_Per_Unit, Max_Retail_Price , Stars, Ratings , Reviews , Mother_Category , Category ,Sub_Category,Num_1_Star_Ratings ,Num_2_Star_Ratings ,Num_3_Star_Ratings ,Num_4_Star_Ratings ,Num_5_Star_Ratings ,Platform,Quantity ,Quantity_Unit, Number_Of_Sellers , Description, Number_Of_Images ,IsAds,Net_Rating_Score_NRS, Discount ,Search_Term ,Min_Price , Max_Price , St_Dev_Price, Title_Length , Description_Length , Date,BSR_in_Mother_Category,BSR_in_Category) VALUES ?";

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
  // if (values1.length > 0) {
  //   connection.query(Seller, [values1], function (err, result) {
  //     if (err) throw err;
  //     console.log("Number of reco rds inserted: " + result.affectedRows);
  //   });
  // }
  // if (values2.length > 0) {
  //   connection.query(Reviews, [values2], function (err, result) {
  //     if (err) throw err;
  //     console.log("Number of reco rds inserted: " + result.affectedRows);
  //   });
  // }
};

let proxies_list = [
  "120.196.186.248:9091",
  "120.197.40.219:9002",
  "120.234.203.171:9002",
  "120.234.135.251:9002",
  "120.194.4.157:5443",
  "120.196.186.248:9091",
  "120.197.40.219:9002",
  "120.234.203.171:9002",
  "120.234.135.251:9002",
  "120.194.4.157:5443",
  "47.91.45.198:5555",
  "123.126.158.184:80",
  "203.89.126.250:80",
  "8.213.129.15:8080",
  "8.213.129.15:12000",
  "47.252.20.42:20002",
  "47.109.52.147:2000",
  "47.252.20.42:11300",
  "8.219.167.110:8009",
  "8.219.167.110:8002",
  "103.49.202.252:80",
  "94.74.80.88:9992",
  "8.219.5.240:8085",
  "103.179.58.122:80",
  "211.138.173.110:9091",
  "103.83.232.122:80",
  "112.54.47.55:9091",
  "39.104.79.145:3127",
  "94.74.80.88:8999",
  "117.160.250.132:80",
  "117.160.250.133:80",
  "117.160.250.134:8899",
  "39.104.79.145:21025",
  "117.160.250.134:80",
  "103.117.192.14:80",
  "103.133.210.133:80",
  "20.120.240.49:80",
  "120.197.40.219:9002",
  "47.91.45.198:5555",
  "103.210.57.243:80",
  "8.213.129.15:8080",
  "139.196.214.238:8082",
  "8.213.129.15:12000",
  "168.187.72.71:8080",
  "47.109.52.147:2000",
  "47.252.20.42:11300",
  "8.219.167.110:8009",
  "8.219.167.110:8002",
  "103.49.202.252:80",
  "94.74.80.88:9992",
  "8.219.5.240:8085",
  "103.179.58.122:80",
  "117.160.250.132:8899",
];

// Exporting all the fields so that they can be accessed from other files whenever neccessary
module.exports = {
  headers,
  allProducts,
  imglink,
  typesOfRatings,
  fields,
  replce,
  amazonsql,
  save,
  proxies_list,
};
