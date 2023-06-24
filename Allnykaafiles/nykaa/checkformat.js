"use strict";
const axios = require("axios");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const { headers } = require("../text");

const check = async (url, browser, page) => {
  try {
    page = await browser.browser.newPage();
    await page.goto(url);

    let html = await page.content();

    let $ = cheerio.load(html);
    let load = $("button.load-more-button").text();

    await page.close();

    if (load) {
      return true;
    }
    return false;
  } catch (error) {
    try {
      if (page) {
        await page.close();
      }

      // api to get html of the required page
      const response = await axios.get(url, headers);

      const html = response.data;

      let $ = cheerio.load(html);

      let load = $("button.load-more-button").text();
      console.log(load);
      if (load) {
        return true;
      }
      return false;
    } catch (e) {
      console.log(error);
      return "NOT POSSIBLE";
    }
  }
};

module.exports = { check };
