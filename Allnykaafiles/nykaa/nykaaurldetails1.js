"use strict";
const axios = require("axios");
const cheerio = require("cheerio");
const { headers } = require("../text");
const nykaatext = require("./nykaatext");

const nykaafetchUrlDetails1 = async (url, browser, page) => {
  try {
    page = await browser.browser.newPage();

    await page.goto(url);

    await page.waitForTimeout(1000);

    let html = await page.content();

    let $ = cheerio.load(html);

    let load = $(nykaatext.N_LOAD_NYKAAURL_CN).first().text();
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
    let i = 1;

    while (load) {
      let pagenum = Math.min(4, i + 1);
      await page.click(`div.css-8u7lru>a:nth-child(${pagenum})`);

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

      html = await page.content();

      $ = cheerio.load(html);

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
      load = $(nykaatext.N_LOAD_NYKAAURL_CN).first().text();

      i++;
      if (i == 3) {
        break;
      }
    }
    await page.close();

    return nykaa;
  } catch (error) {
    try {
      if (page) {
        await page.close();
      }

      // api to get html of the required page
      const response = await axios.get(url, headers);

      const html = response.data;

      $ = cheerio.load(html);

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
    } catch (e) {
      return [{ message: "Can not fetch" }];
    }
  }
};

module.exports = { nykaafetchUrlDetails1 };
