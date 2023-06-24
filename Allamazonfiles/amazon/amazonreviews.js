const cheerio = require("cheerio");
const amazontext = require("./amazontext");
const puppeteer = require("puppeteer-extra");

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const { executablePath } = require("puppeteer");

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const amazonfetchReviews = async (url) => {
  try {
    let browser = await puppeteer.launch({
      headless: `true`, // indicates that we want the browser visible
      defaultViewport: false, // indicates not to use the default viewport size but to adjust to the user's screen resolution instead
      userDataDir: "./tmp", // caches previous actions for the website. Useful for remembering if we've had to solve captchas in the past so we don't have to resolve them
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: executablePath(),
    });

    page = await browser.newPage();
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

    const html = await page.content();

    await page.close();
    await browser.close();

    const $ = cheerio.load(html);

    let obj = {};
    // Scraping the Global number of reviews
    const noReviews = $(amazontext.A_NUM_REVIEWS_CN);
    numberReviews = noReviews.html();
    if (numberReviews) {
      numberReviews = numberReviews.trim();
      let sp = numberReviews.split(",");
      numberReviews = sp[1].replace(/\D/g, "");
    }

    //Scraping the number of all type of ratings such as 5 star, 4 star
    $(amazontext.A_ALLRATINGS_CN).each(async (_idx, el) => {
      // selecting the ratings element and the looping to get the different ratings
      const x = $(el);
      let key = x.find(amazontext.A_ALLRATINGS_key_CN).text();
      let value = x.find(amazontext.A_ALLRATINGS_value_CN).text();
      if (key) {
        key = key.trim();
      }
      if (value) {
        value = value.trim(); // triming to trim the spaces in the string
      }

      if (key !== "" && value !== "") {
        const result = value.replace(/\D/g, "");
        obj[`Num_${5 - _idx}_${amazontext.A_STARRATINGS1_FD}`] = result; // saving the scraped data in an object
      }
    });

    obj[amazontext.A_REVIEWS_FD] = Number(numberReviews);
    return obj;
  } catch (error) {
    try {
      if (page) {
        await page.close();
      }
      if (browser) {
        await browser.close();
      }
      return {};
    } catch (e) {
      return {};
    }
  }
};

module.exports = { amazonfetchReviews };
