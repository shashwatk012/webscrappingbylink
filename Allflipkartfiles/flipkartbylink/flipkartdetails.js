"use strict";

// This page scrapps the complete product details
const axios = require("axios");
const cheerio = require("cheerio");
const { headers, replce } = require("../text");
const flipkartbylinktext = require("./flipkartbylinktext");

const scrapdetails = (html) => {
  // cheerio nodejs module to load html
  const $ = cheerio.load(html);

  // Declaration of object to store the product details
  let obj = {};

  // Scraping the ProductName
  let ProductName = $(flipkartbylinktext.F_PRODUCTNAME_CN).text().trim();
  if (ProductName !== undefined) {
    obj[flipkartbylinktext.F_PRODUCTNAME_FD] = ProductName;
  }

  let price = $(flipkartbylinktext.F_PRICE_CN).text();
  price = replce(price);
  obj[flipkartbylinktext.F_PRICE_FD] = price;

  let maxprice = $(flipkartbylinktext.F_MAXRETAILPRICE_CN).text();
  if (maxprice === "") {
    maxprice = price;
  } else {
    maxprice = replce(maxprice);
  }
  obj[flipkartbylinktext.F_MAXRETAILPRICE_FD] = maxprice;

  let discount = (maxprice - price) / maxprice;
  obj[flipkartbylinktext.F_DISCOUNT_FD] = Math.floor(discount * 100);

  let image = $(flipkartbylinktext.F_IMAGELINK_CN).attr("src");
  if (image === undefined) {
    image = $(flipkartbylinktext.F_IMAGELINK_ALTERNATIVE_CN).attr("src");
  }
  obj[flipkartbylinktext.F_IMAGELINK_FD] = image;

  // scraping the number of global ratings
  let ratings = $(flipkartbylinktext.F_RATINGS_CN).text();

  // scraping the global rating(i.e 4.1)
  let stars = $(flipkartbylinktext.F_STARS_CN).text();

  if (stars && ratings) {
    stars = replce(stars);
    obj[flipkartbylinktext.F_STARS_FD] = stars;
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
    obj[flipkartbylinktext.F_RATINGS_FD] = rating;
    obj[flipkartbylinktext.F_REVIEWS_FD] = review;
  } else {
    // scraping the number of global ratings
    let ratings = $(flipkartbylinktext.F_RATINGS_ALTERNATIVE_CN).text();

    // scraping the global ratings(i.e 4.1)
    let stars = $(flipkartbylinktext.F_STARS_ALTERNATIVE_CN).text();
    stars = replce(stars);
    obj[flipkartbylinktext.F_STARS_FD] = stars;
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
    obj[flipkartbylinktext.F_RATINGS_FD] = rating;
    obj[flipkartbylinktext.F_REVIEWS_FD] = review;
  }

  // Declaration of an array to store the Category and Sub-Categories
  let Categories = [],
    link = [];

  //selecting the category element and the looping to get the category and sub-category
  $(flipkartbylinktext.F_LISTOFCATEGORIES_CN).each(async (_idx, el) => {
    const x = $(el);
    let category = x.find(flipkartbylinktext.F_CATEGORY_CN).text();
    let links = x.find("a._2whKao").attr("href");
    if (category) {
      Categories.push(category);
    }

    if (links) {
      link.push(links);
    }
  });
  obj[flipkartbylinktext.F_MOTHER_CATEGORY_FD] = Categories[1];
  obj[flipkartbylinktext.F_CATEGORY_FD] = Categories[2];
  obj[flipkartbylinktext.F_SUB_CATEGORY_FD] = Categories[3];
  obj[flipkartbylinktext.F_PRODUCT_FD] = Categories[Categories.length - 2];
  obj[flipkartbylinktext.F_MAINPAGELINK_FD] = `${
    flipkartbylinktext.FLIPKART_PAGE_LINK
  }${link[link.length - 2]}`;
  if (Categories.length) {
    const product = obj[flipkartbylinktext.F_PRODUCT_FD].split(" ");
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
    obj[flipkartbylinktext.F_BRAND_FD] = st;
  }

  //scraping the pagelink for the reviews
  let reviewsLink = $(flipkartbylinktext.F_REVIEWSLINK_CN).attr("href");
  if (reviewsLink !== undefined) {
    obj[
      flipkartbylinktext.F_REVIEWSLINK_FD
    ] = `${flipkartbylinktext.FLIPKART_PAGE_LINK}${reviewsLink}`;
  }

  // Declaration of an array to store the highlights of products
  let highLits = [];

  //selecting the product details element and the looping to get the highlights of product
  $(flipkartbylinktext.F_PRODUCTDETAILS1_CN).each(async (_idx, el) => {
    const x = $(el);
    const p = x.text();
    highLits.push(p);

    if (highLits.length !== 0) {
      obj[flipkartbylinktext.F_HIGHLIGHTS_FD] = highLits;
    }
  });

  //selecting the product details element and the looping to get the complete product details
  $(flipkartbylinktext.F_PRODUCTDETAILS2_CN).each(async (_idx, el) => {
    const x = $(el);
    let key = x.find(flipkartbylinktext.F_PRODUCTDETAILS_KEY_CN).text();
    let value = x.find(flipkartbylinktext.F_PRODUCTDETAILS_VALUE_CN).text();
    if (key !== "" && value !== "") {
      obj[key] = value;
    }
  });

  // Scraping the sellers page link
  let sellerslink = $(flipkartbylinktext.F_SELLERLINK_CN).attr("href");
  if (sellerslink) {
    obj[
      flipkartbylinktext.F_SELLERLINK_FD
    ] = `${flipkartbylinktext.FLIPKART_PAGE_LINK}${sellerslink}`;
  }

  let description = $(flipkartbylinktext.F_DESCRIPTION_CN).text();

  let count = 1;
  $(flipkartbylinktext.F_NUMBEROFIMAGES_CN).each(async (_idx, el) => {
    count++;
  });
  obj[flipkartbylinktext.F_NUMBEROFIMAGES_FD] = count;
  if (description === "") {
    description = "NA";
  }
  obj[flipkartbylinktext.F_DESCRIPTION_FD] = description;

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
