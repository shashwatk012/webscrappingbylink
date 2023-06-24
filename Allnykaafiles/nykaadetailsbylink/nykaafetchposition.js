const cheerio = require("cheerio");
const nykaatext = require("./nykaatext");

const fetchPosition = async (url, browser, page, ProductName) => {
  // function to scrap complete data about one product
  try {
    page = await browser.browser.newPage();

    await page.goto(url);

    await page.waitForTimeout(1000);

    const html = await page.content();

    let $ = cheerio.load(html);
    let load = $(nykaatext.N_LOAD_NYKAAURL_CN).first().text();

    let position = 0,
      res = 0;
    let flag = true;
    $(nykaatext.N_PRODUCTLINK_CN).each(async (_idx, el) => {
      // selecting the elements to be scrapped
      const names = $(el);

      const name = names.find(nykaatext.N_POSITION_NAMES_CN).text(); // scraping the name of the product

      if (ProductName.includes(name) || name.includes(ProductName)) {
        flag = false;
        position = _idx + 1;
      }
      res = _idx + 1;
    });
    if (!flag) {
      return position;
    }
    let i = 1;

    while (load) {
      position = res;
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

      flag = true;

      $(nykaatext.N_PRODUCTLINK_CN).each(async (_idx, el) => {
        // selecting the elements to be scrapped
        const names = $(el);

        const name = names.find(nykaatext.N_POSITION_NAMES_CN).text(); // scraping the name of the product

        if (ProductName.includes(name) || name.includes(ProductName)) {
          flag = false;
          position += _idx + 1;
        }
        res += _idx + 1;
      });

      if (!flag) {
        return position;
      }

      load = $(nykaatext.N_LOAD_NYKAAURL_CN).first().text();

      i++;
      if (i == 3) {
        break;
      }
    }
    await page.close();

    return `${res}+`;
  } catch (error) {
    try {
      if (page) {
        await page.close();
      }

      return "60+";
    } catch (e) {
      return { message: "NOT POSSIBLE" };
    }
  }
};

module.exports = { fetchPosition };
