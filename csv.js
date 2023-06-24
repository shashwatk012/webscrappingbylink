// This file is to convert the json into csv file
const ObjectsToCsv = require("objects-to-csv");

// If you use "await", code must be inside an asynchronous function:
const convertJSONtoCSV = async (product_table) => {
  try {
    const csv = new ObjectsToCsv(product_table);
    let date = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    month++;
    // Save to file:

    // Converting product details into csv
    await csv.toDisk(
      `./csvfiles/product_table_dated${day}-${month}-${year}.csv`
    );
    console.log("File has been saved");
  } catch (e) {
    console.log(e);
  }
};

module.exports = { convertJSONtoCSV };
