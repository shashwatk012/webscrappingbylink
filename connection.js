// This files is to make a successful connection to the database

// Importing mysql module to connect to the database
const mysql = require("mysql2");

// Connecting to the database through host,user,password,port
const connection = mysql.createConnection({
  host: "publiqdatabase.crvs0kcwplwy.ap-south-1.rds.amazonaws.com",
  user: "admin",
  password: "Publiq2023",
  port: 3306,
  database: "Publiq",
});

// Promise to tell us whether the connection is successful or not
connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("connected");

    // connection.query(
    //   "SELECT * FROM FLIPKART_PRODUCT_TABLE",
    //   function (err, result, fields) {
    //     if (err) throw err;
    //     convertJSONtoCSV(result);
    //   }
    // );
  }
});

module.exports = connection;

// var sql1 =
//   "CREATE TABLE FLIPKART_REVIEWS_TABLE (Title VARCHAR(1000), Summary VARCHAR(10000),Type VARCHAR(255), ProductName VARCHAR(500), Date VARCHAR(255))";
// var sql2 =
//   "CREATE TABLE FLIPKART_SELLERS_TABLE (SellersName VARCHAR(1000), Price INTEGER,Ratings FLOAT,Flipkart_Assured INTEGER, ProductName VARCHAR(500), Date VARCHAR(255))";
// connection.query(sql, function (err, result) {
//   if (err) throw err;
//   console.log("Table created");
// });
// connection.query(sql1, function (err, result) {
//   if (err) throw err;
//   console.log("Table created");
// });
// connection.query(sql2, function (err, result) {
//   if (err) throw err;
//   console.log("Table created");
// });
// var sql =
//       "CREATE TABLE AMAZON_PRODUCT_TABLE (Imagelink VARCHAR(2000),Productlink VARCHAR(2000), Position INTEGER,Product VARCHAR(500), ProductName VARCHAR(500), Brand VARCHAR(255), Price INTEGER,Price_Per_Unit FLOAT, Max_Retail_Price INTEGER, Stars FLOAT, Ratings INTEGER, Reviews INTEGER, Mother_Category VARCHAR(255), Category VARCHAR(255),Sub_Category VARCHAR(500),Num_1_Star_Ratings INTEGER  ,Num_2_Star_Ratings INTEGER,Num_3_Star_Ratings INTEGER,Num_4_Star_Ratings INTEGER,Num_5_Star_Ratings INTEGER,Platform VARCHAR(255),Quantity INTEGER,Quantity_Unit VARCHAR(10),Number_Of_Sellers INTEGER,Description VARCHAR(5000), Number_Of_Images INTEGER,IsAds VARCHAR(20),Net_Rating_Score_NRS FLOAT, Discount INTEGER,Search_Term VARCHAR(255),Min_Price FLOAT,Max_Price FLOAT, St_Dev_Price FLOAT, Title_Length INTEGER, Description_Length INTEGER,Date VARCHAR(255),BSR_in_Mother_Category INTEGER,BSR_in_Category INTEGER)";
//     connection.query(sql, function (err, result) {
//       if (err) throw err;
//       console.log("Table created");
//     });
