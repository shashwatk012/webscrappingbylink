"use strict";
// This page scrapps the sellers details

const cheerio = require("cheerio");
const { replce } = require("../text");
const math = require("mathjs");
const flipkartbylinktext = require("./flipkartbylinktext");

const sellers = (html, ProductName) => {
  const $ = cheerio.load(html);

  let count = 0,
    mn = 1000000,
    mx = 0;
  let sellersDetails = [],
    pricearr = [];
  $(flipkartbylinktext.F_SELLERS_CN).each(async (_idx, el) => {
    const x = $(el);

    const sellersName = x.find(flipkartbylinktext.F_SELLERSNAME_CN).text();

    let Ratings = x.find(flipkartbylinktext.F_SELLERSRATINGS_CN).text();
    Ratings = replce(Ratings);

    let price = x.find(flipkartbylinktext.F_SELLERSPRICE_CN).text();
    price = replce(price);
    pricearr.push(price);
    mx = Math.max(mx, price);
    mn = Math.min(mn, price);

    let flipkartassured = x
      .find(flipkartbylinktext.F_SELLERSFLIPKARTASSURED_CN)
      .attr("src");
    if (flipkartassured) {
      flipkartassured = 1;
    } else {
      flipkartassured = 0;
    }
    let date = new Date();

    date = date.toLocaleDateString();
    sellersDetails.push({
      sellersName,
      price,
      Ratings,
      flipkartassured,
      ProductName,
      date,
    });
    count++;
  });
  const stDev = math.std(pricearr);

  return {
    St_Dev_Price: stDev,
    Min_Price: mn,
    Max_Price: mx,
    NumberofSellers: count,
    sellersDetails,
  };
};

const flipkartsellerslist = async (url, browser, page, ProductName) => {
  try {
    page = await browser.browser.newPage();

    await page.goto(url, { timeout: 60000 });

    await page.waitForTimeout(1000);

    await page.waitForSelector("div._2Y3EWJ");

    const html = await page.content();

    await page.close();

    return sellers(html, ProductName);
  } catch (error) {
    if (page) {
      await page.close();
    }
    return { message: "Can not fetch" };
  }
};

module.exports = { flipkartsellerslist };
