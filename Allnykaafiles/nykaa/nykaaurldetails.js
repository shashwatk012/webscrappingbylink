"use strict";
const axios = require("axios");
const cheerio = require("cheerio");
const { headers, replce } = require("../text");
const nykaatext = require("./nykaatext");

const fetchUrl = (html) => {
  let $ = cheerio.load(html);

  const nykaa = [];

  $(nykaatext.N_PRODUCTLINK_CN).each(async (_idx, el) => {
    // selecting the elements to be scrapped
    const links = $(el);

    const link = links // scraping the link of the product
      .find("a")
      .attr("href");

    let element = {
      Productlink: `${nykaatext.NYKAA_PAGE_LINK}${link}`,
    };

    nykaa.push(element); //storing the details in an array
  });
  return nykaa;
};

const nykaafetchUrlDetails = async (url, browser, page) => {
  try {
    page = await browser.browser.newPage();
    await page.goto(url);

    await page.waitForTimeout(1000);

    let lastHeight = await page.evaluate("document.body.scrollHeight");

    while (true) {
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
      await page.waitForTimeout(1000); // sleep a bit
      let newHeight = await page.evaluate("document.body.scrollHeight");
      if (newHeight === lastHeight) {
        break;
      }
      lastHeight = newHeight;
    }

    let html = await page.content();

    await page.close();

    return fetchUrl(html);
  } catch (error) {
    try {
      if (page) {
        await page.close();
      }

      // api to get html of the required page
      const response = await axios.get(url, headers);

      const html = response.data;

      return fetchUrl(html);
    } catch (e) {
      return [{ message: "Can not fetch" }];
    }
  }
};

module.exports = { nykaafetchUrlDetails };
