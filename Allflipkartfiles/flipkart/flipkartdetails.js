"use strict";

// This page scrapps the complete product details
const axios = require("axios");
const cheerio = require("cheerio");
const { headers, replce } = require("../text");
const flipkarttext = require("./flipkarttext");

const scrapdetails = (html) => {
  // cheerio nodejs module to load html
  const $ = cheerio.load(html);

  // Declaration of object to store the product details
  let obj = {};

  // Scraping the ProductName
  let ProductName = $(flipkarttext.F_PRODUCTNAME_CN).text().trim();
  if (ProductName !== undefined) {
    obj[flipkarttext.F_PRODUCTNAME_FD] = ProductName;
  }

  let price = $(flipkarttext.F_PRICE_CN).text();
  price = replce(price);
  obj[flipkarttext.F_PRICE_FD] = price;

  let maxprice = $(flipkarttext.F_MAXRETAILPRICE_CN).text();
  if (maxprice === "") {
    maxprice = price;
  } else {
    maxprice = replce(maxprice);
  }
  obj[flipkarttext.F_MAXRETAILPRICE_FD] = maxprice;

  let discount = (maxprice - price) / maxprice;
  obj[flipkarttext.F_DISCOUNT_FD] = Math.floor(discount * 100);

  let image = $(flipkarttext.F_IMAGELINK_CN).attr("src");
  if (image === undefined) {
    image = $(flipkarttext.F_IMAGELINK_ALTERNATIVE_CN).attr("src");
  }
  obj[flipkarttext.F_IMAGELINK_FD] = image;

  // scraping the number of global ratings
  let ratings = $(flipkarttext.F_RATINGS_CN).text();

  // scraping the global rating(i.e 4.1)
  let stars = $(flipkarttext.F_STARS_CN).text();

  if (stars && ratings) {
    stars = replce(stars);
    obj[flipkarttext.F_STARS_FD] = stars;
    let p = ratings.indexOf("and");
    if (p === -1) {
      p = ratings.indexOf("&");
    }
    let rating = ratings.substring(0, p);
    let review = ratings.substring(p);
    rating = rating.replace(/\D/g, "");
    review = review.replace(/\D/g, "");

    rating = replce(rating);
    review = replce(review);
    obj[flipkarttext.F_RATINGS_FD] = rating;
    obj[flipkarttext.F_REVIEWS_FD] = review;
  } else {
    // scraping the number of global ratings
    let ratings = $(flipkarttext.F_RATINGS_ALTERNATIVE_CN).text();

    // scraping the global ratings(i.e 4.1)
    let stars = $(flipkarttext.F_STARS_ALTERNATIVE_CN).text();
    stars = replce(stars);
    obj[flipkarttext.F_STARS_FD] = stars;
    let p = ratings.indexOf("and");
    if (p === -1) {
      p = ratings.indexOf("&");
    }
    let rating = ratings.substring(0, p);
    let review = ratings.substring(p);
    rating = rating.replace(/\D/g, "");
    review = review.replace(/\D/g, "");
    rating = replce(rating);
    review = replce(review);
    obj[flipkarttext.F_RATINGS_FD] = rating;
    obj[flipkarttext.F_REVIEWS_FD] = review;
  }

  // Declaration of an array to store the Category and Sub-Categories
  let Categories = [];

  //selecting the category element and the looping to get the category and sub-category
  $(flipkarttext.F_LISTOFCATEGORIES_CN).each(async (_idx, el) => {
    const x = $(el);
    let category = x.find(flipkarttext.F_CATEGORY_CN).text();
    if (category) {
      Categories.push(category);
    }
  });
  obj[flipkarttext.F_MOTHER_CATEGORY_FD] = Categories[1];
  obj[flipkarttext.F_CATEGORY_FD] = Categories[2];
  obj[flipkarttext.F_SUB_CATEGORY_FD] = Categories[3];
  obj[flipkarttext.F_PRODUCT_FD] = Categories[Categories.length - 2];
  if (Categories.length) {
    const product = obj[flipkarttext.F_PRODUCT_FD].split(" ");
    const Brand = Categories[Categories.length - 1].split(" ");
    let pos = Brand[Brand.length - 1];
    for (let i = 0; i < Brand.length; i++) {
      if (Brand[i] === product[0]) {
        pos = i;
        break;
      }
    }
    let st = "";
    for (let i = 0; i < pos; i++) {
      st += Brand[i];
    }
    obj[flipkarttext.F_BRAND_FD] = st;
  }

  //scraping the pagelink for the reviews
  let reviewsLink = $(flipkarttext.F_REVIEWSLINK_CN).attr("href");
  if (reviewsLink !== undefined) {
    obj[
      flipkarttext.F_REVIEWSLINK_FD
    ] = `${flipkarttext.FLIPKART_PAGE_LINK}${reviewsLink}`;
  }

  // Declaration of an array to store the highlights of products
  let highLits = [];

  //selecting the product details element and the looping to get the highlights of product
  $(flipkarttext.F_PRODUCTDETAILS1_CN).each(async (_idx, el) => {
    const x = $(el);
    const p = x.text();
    highLits.push(p);

    if (highLits.length !== 0) {
      obj[flipkarttext.F_HIGHLIGHTS_FD] = highLits;
    }
  });

  //selecting the product details element and the looping to get the complete product details
  $(flipkarttext.F_PRODUCTDETAILS2_CN).each(async (_idx, el) => {
    const x = $(el);
    let key = x.find(flipkarttext.F_PRODUCTDETAILS_KEY_CN).text();
    let value = x.find(flipkarttext.F_PRODUCTDETAILS_VALUE_CN).text();
    if (key !== "" && value !== "") {
      obj[key] = value;
    }
  });

  // Scraping the sellers page link
  let sellerslink = $(flipkarttext.F_SELLERLINK_CN).attr("href");
  if (sellerslink) {
    obj[
      flipkarttext.F_SELLERLINK_FD
    ] = `${flipkarttext.FLIPKART_PAGE_LINK}${sellerslink}`;
  }

  let description = $(flipkarttext.F_DESCRIPTION_CN).text();

  let count = 1;
  $(flipkarttext.F_NUMBEROFIMAGES_CN).each(async (_idx, el) => {
    count++;
  });
  obj[flipkarttext.F_NUMBEROFIMAGES_FD] = count;
  if (description === "") {
    description = "NA";
  }
  obj[flipkarttext.F_DESCRIPTION_FD] = description;

  return obj;
};

// function to scrap complete data about one product
const flipkartfetchIndividualDetails = async (url, browser, page) => {
  try {
    // api to get html of the required page

    page = await browser.browser.newPage();

    await page.goto(url);

    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      document.querySelector("div.col.JOpGWq>a").scrollIntoView();
    });

    const html = await page.content();

    await page.close();

    // function in text.js to scrap the required details from the page
    return scrapdetails(html);
  } catch (error) {
    try {
      if (page) {
        await page.close();
      }

      // api to get html of the required page
      const response = await axios.get(url, headers);

      const html = response.data;

      // function in text.js to scrap the required details from the page
      return scrapdetails(html);
    } catch (e) {
      return { message: "Some error occured" };
    }
  }
};

module.exports = { flipkartfetchIndividualDetails };
