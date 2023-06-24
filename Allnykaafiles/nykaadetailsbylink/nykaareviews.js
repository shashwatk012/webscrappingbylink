const axios = require("axios");
const cheerio = require("cheerio");
const { headers, replce } = require("../text");
const nykaatext = require("./nykaatext");

const reviews = (html, ProductName) => {
  // cheerio nodejs module to load html
  let $ = cheerio.load(html);
  let date = new Date();

  date = date.toLocaleDateString();

  let obj = {},
    review = [];

  // Scraping the reviewS
  $(nykaatext.N_REVIEWS_CN).each(async (_idx, el) => {
    const x = $(el);
    let name = x.find("span.css-amd8cf").text();
    let title = x.find(nykaatext.N_REVIEWS_TITLE_CN).text();
    let summary = x.find(nykaatext.N_REVIEWS_SUMMARY_CN).text();
    let type = "Most Useful";

    if (title && summary) {
      review.push({
        name,
        title: title,
        summary: summary,
        type: type,
        ProductName,
        date,
      });
    } else if (title) {
      review.push({
        name,
        title: title,
        summary: null,
        type: type,
        ProductName,
        date,
      });
    } else {
      review.push({
        name,
        title: null,
        summary: summary,
        type: type,
        ProductName,
        date,
      });
    }
    title = null;
    summary = null;
  });
  obj[nykaatext.N_MOST_USEFUL_FD] = review;
  return obj;
};

const nykaafetchReviews = async (url, browser, page, ProductName) => {
  // function to scrap complete data about one product
  try {
    page = await browser.browser.newPage();

    await page.goto(url);

    await page.waitForTimeout(1000);

    const html = await page.content();

    await page.close();

    return reviews(html, ProductName);
  } catch (error) {
    try {
      if (page) {
        await page.close();
      }

      // api to get html of the required page
      const response = await axios.get(url, headers);

      const html = response.data;

      return reviews(html, ProductName);
    } catch (e) {
      return { message: "NOT POSSIBLE" };
    }
  }
};

module.exports = { nykaafetchReviews };
