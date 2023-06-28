const cheerio = require("cheerio");
const amazontext = require("./amazontext");
const { proxyReqforreviews } = require("./proxyreq");

const amazonscrapreviews = (html) => {
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

  // Scraping the reviews
  const reviews1 = [];
  $(amazontext.A_REVIEWS_CN).each(async (_idx, el) => {
    const reviews = $(el);
    const name = reviews.find(amazontext.A_REVIEWS_TITLE_CN).text();
    const review = reviews.find(amazontext.A_REVIEWS_SUMMARY_CN).text();
    reviews1.push({
      name: name,
      review: review,
    });
  });

  obj["top10reviews"] = reviews1;

  return obj;
};

const amazonfetchReviews = async (url, browser, page) => {
  try {
    console.log(url);
    page = await browser.browser.newPage();
    await page.goto(url);

    await page.waitForTimeout(1000);

    await page.screenshot({
      path: "./sreenshot.jpg",
    });

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

    let $ = cheerio.load(html);

    // Scraping the Global number of reviews
    const noReviews = $(amazontext.A_NUM_REVIEWS_CN);
    numberReviews = noReviews.html();
    if (!numberReviews) {
      while (true) {
        html = await proxyReqforreviews(url);
        if (html !== "") {
          break;
        }
      }
    }

    return amazonscrapreviews(html);
  } catch (error) {
    try {
      if (page) {
        await page.close();
      }
      console.log("Some thing Went Wrong on review.js");
      let html;
      while (true) {
        html = await proxyReqforreviews(url);
        if (html !== "") {
          break;
        }
      }
      return amazonscrapreviews(html);
    } catch (e) {
      console.log("Some thing Went Wrong on review1.js");
      let html;
      while (true) {
        html = await proxyReqforreviews(url);
        if (html !== "") {
          break;
        }
      }
      return amazonscrapreviews(html);
    }
  }
};

module.exports = { amazonfetchReviews };
