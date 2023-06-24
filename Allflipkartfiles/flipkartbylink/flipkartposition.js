// This page scrapps the complete product details

const axios = require("axios");
const cheerio = require("cheerio");
const { headers, allProducts } = require("../text");

const scrapposition = (html, ProductName) => {
  // cheerio nodejs module to load html
  const $ = cheerio.load(html);
  let obj = {};
  $(allProducts).each(async (_idx, el) => {
    // selecting the elements to be scrapped
    const pos = $(el);
    let name = pos.find("a.s1Q9rs").attr("title");
    if (!name) {
      name = pos.find("div._4rR01T").text();
    }
    if (ProductName.includes(name)) {
      // console.log(_idx + 1);
      obj["Position"] = _idx + 1;
    }
    obj.totalproducts = _idx + 1;
  });
  return obj;
};

const flipkartPosition = async (url, ProductName) => {
  // function to scrap complete data about one product
  try {
    const response = await axios.get(url, headers);

    const html = response.data;

    // function in text.js to scrap the required details from the page
    const pos = scrapposition(html, ProductName);
    return pos;
  } catch (error) {
    return "100+";
  }
};

module.exports = { flipkartPosition };
