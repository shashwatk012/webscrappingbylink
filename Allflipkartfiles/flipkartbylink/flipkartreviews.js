"use strict";

// This page scraps the reviews of the product
const axios = require("axios");
const cheerio = require("cheerio");
const { headers, replce } = require("../text");
const flipkartbylinktext = require("./flipkartbylinktext");

const scrapreviews = (html, typeofreviews, ProductName) => {
  const $ = cheerio.load(html);

  let review = [];
  let obj = {};

  // Scraping the number of all type of ratings such as 5 star, 4 star
  $(flipkartbylinktext.F_ALLRATINGS_CN).each(async (_idx, el) => {
    const x = $(el);
    obj[`Num_${5 - _idx}_${flipkartbylinktext.F_STARRATINGS_FD}`] = replce(
      x.text()
    );
  });
  let date = new Date();

  date = date.toLocaleDateString();

  // Scraping the reviewS
  $(flipkartbylinktext.F_REVIEWS_CN).each(async (_idx, el) => {
    const x = $(el);
    let title = x.find(flipkartbylinktext.F_REVIEWS_TITLE_CN).text();
    let summary = x.find(flipkartbylinktext.F_REVIEWS_SUMMARY_CN).last().text();
    let type;
    if (typeofreviews === "POSITIVE_FIRST") {
      type = "POSITIVE";
    } else {
      type = "NEGATIVE";
    }
    if (title && summary) {
      review.push({
        title: title,
        summary: summary,
        type: type,
        ProductName,
        date,
      });
    } else if (title) {
      review.push({
        title: title,
        summary: null,
        type: type,
        ProductName,
        date,
      });
    } else {
      review.push({
        title: null,
        summary: summary,
        type: type,
        ProductName,
        date,
      });
    }
  });
  obj[typeofreviews] = review;
  return obj;
};

const flipkartfetchReviews = async (
  url,
  typeofreviews,
  browser,
  page,
  ProductName
) => {
  try {
    page = await browser.browser.newPage();
    await page.goto(url);
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      document
        .querySelector("div._1AtVbE>div._27M-vq>div.col>div.col._2wzgFH.K0kLPL")
        .scrollIntoView();
    });
    const html = await page.content();
    await page.close();

    // function in text.js to scrap the required details from the page
    return scrapreviews(html, typeofreviews, ProductName);
  } catch (error) {
    try {
      if (page) {
        await page.close();
      }

      // api to get html of the required page
      const response = await axios.get(url, headers);

      const html = response.data;

      // function in text.js to scrap the required details from the page
      return scrapreviews(html, typeofreviews, ProductName);
    } catch (e) {
      return { message: "Some error occured" };
    }
  }
};

module.exports = { flipkartfetchReviews };
