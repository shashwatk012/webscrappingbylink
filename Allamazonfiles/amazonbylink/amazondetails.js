const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const { replce } = require("../text");
const math = require("mathjs");
const amazontext = require("./amazontext");
const { proxyReq } = require("./proxyreq");

const amazonfetchIndividualDetails = async (url, browser, page) => {
  // function to scrap complete data about one product
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

    let $ = cheerio.load(html);

    console.log(html.substring(1, 100));

    let captchalink = $("div.a-row.a-text-center>img").attr("src");

    if (captchalink) {
      console.log(captchalink);
      while (true) {
        html = await proxyReq(url);
        if (html !== "") {
          break;
        }
      }
    }

    // cheerio nodejs module to load html
    $ = cheerio.load(html);

    // Declaration of object to store the product details
    let obj = {};

    // ProductName
    let ProductName = $(amazontext.A_PRODUCTNAME_CN).text();

    // stars
    let star = $(amazontext.A_STARS_CN).text();

    // number of ratings
    let numratings = $(amazontext.A_RATINGS_CN).text();

    // Link for the images
    let imagelink = $(amazontext.A_IMAGELINK_CN).attr("src");
    if (!imagelink) {
      imagelink = $(amazontext.A_IMAGELINK_ALTERNATIVE_CN).attr("src");
    }

    // price
    let price = $(amazontext.A_PRICE_CN).text();
    price = replce(price);

    if (!price) {
      price = $(amazontext.A_PRICE_ALTERNATIVE_CN).text();
      price = replce(price);
    }

    // maxretailprice
    let maxretailprice = $(amazontext.A_MAXRETAILPRICE_CN).text();
    maxretailprice = replce(maxretailprice);

    if (!maxretailprice) {
      maxretailprice = $(amazontext.A_MAXRETAILPRICE_ALTERNATIVE_CN).text();
      maxretailprice = replce(maxretailprice);
    }

    if (ProductName) {
      obj[amazontext.A_PRODUCTNAME_FD] = ProductName.trim();
    }

    if (star) {
      let stararr = star.split(" ");
      obj[amazontext.A_STARS_FD] = Number(stararr[1]);
    }

    if (numratings) {
      numratings = numratings.replace(/\D/g, "");
      let size = numratings.length;
      const st = numratings.substring(0, size / 2);
      // const st1 = numratings.substring(size / 2, size);
      obj[amazontext.A_RATINGS_FD] = Number(st);
    }

    if (imagelink) {
      obj[amazontext.A_IMAGELINK_FD] = imagelink;
    }

    if (price) {
      obj[amazontext.A_PRICE_FD] = price;
    }

    if (maxretailprice) {
      obj[amazontext.A_MAXRETAILPRICE_FD] = maxretailprice;
    } else {
      obj[amazontext.A_MAXRETAILPRICE_FD] = price;
    }

    //Scraping the Best Sellers Rank in different Sub-Categories
    $(amazontext.A_LISTOFCATEGORIES_CN).each(async (_idx, el) => {
      const x = $(el);
      if (_idx === 0) {
        let p = x.find(amazontext.A_CATEGORY_CN).text();
        if (p) {
          p = p.trim();
        }
        let ranks,
          num = [];
        if (p) {
          ranks = p.replace("Best Sellers Rank:", "");
          ranks = ranks.trim();
          ranks = ranks.split(" ");
          ranks = ranks.filter((item) => {
            if (item !== " ") return item;
          });
          ranks = ranks.join(" ");
          while (ranks.includes("#")) {
            ranks = ranks.replace("#", " ");
          }
          // ranks = ranks.replaceAll("#", " ");

          num = ranks.split("  ");
        }

        let st = [],
          rank = [];
        for (let i = 0; i < num.length; i++) {
          let q = num[i].split(" ");
          let s = "";
          if (!st.length) {
            let idx = q.indexOf("(See");
            for (let j = 3; j < idx; j++) {
              s += q[j];
            }
            if (q && q.length > 1) {
              q[1] = replce(q[1]);
              rank.push(q[1]);
            }
          } else {
            for (let j = 2; j < q.length; j++) {
              s += q[j];
            }
            if (q && q.length > 0) {
              q[0] = replce(q[0]);
              rank.push(q[0]);
            }
          }
          if (i == num.length - 1) {
            obj[amazontext.A_POSITION_FD] = q[0];
          }
          st.push(s);
        }

        // saving the scraped data in an object
        if (st.length > 1) {
          obj[amazontext.A_MOTHER_CATEGORY_FD] = st[0];
          obj[amazontext.A_CATEGORY_FD] = st[1];
          obj[amazontext.A_BSR_IN_MOTHER_CATEGORY] = rank[0];
          obj[amazontext.A_BSR_IN_CATEGORY] = rank[1];
          if (st.length > 2) {
            obj[amazontext.A_SUB_CATEGORY_FD] = st[2];
            obj[amazontext.A_PRODUCT_FD] = st[2];
          } else {
            obj[amazontext.A_PRODUCT_FD] = st[1];
          }
        }
      }
    });

    // Number of images
    let count = 1;
    $(amazontext.A_NUMBEROFIMAGES_CN).each(async (_idx, el) => {
      const x = $(el);
      count++;
    });
    obj[amazontext.A_NUMBEROFIMAGES_FD] = count;

    // Sellerdetails
    count = 1;
    let mn = price,
      mx = price,
      pricearr = [price],
      Sellerdetails = [];
    $(amazontext.A_SELLERS_CN).each(async (_idx, el) => {
      const x = $(el);
      let price = x.find(`${amazontext.A_SELLERSPRICE_CN}${_idx + 1}`).text();
      let deliveryCharges = x
        .find(`${amazontext.A_SELLERSDELIVERYCHARGES_CN}${_idx + 1}`)
        .text();
      let soldBy = x
        .find(`div#mbc-sold-by-${_idx + 1}>span.mbcMerchantName`)
        .text();

      price = replce(price);
      pricearr.push(price);

      mx = Math.max(mx, price);
      mn = Math.min(mn, price);

      // matching all numbers
      deliveryCharges = deliveryCharges.match(/[.0-9]+/);

      if (!deliveryCharges || !deliveryCharges.length) {
        deliveryCharges = [0];
      }

      Sellerdetails.push({
        SoldBy: soldBy,
        Price: price,
        "Delivery charges": Number(deliveryCharges[0]),
      });
      count++;
    });
    let stDev;
    if (pricearr.length) {
      stDev = math.std(pricearr);
    }
    obj[amazontext.A_ST_DEV_PRICE_FD] = stDev;
    obj[amazontext.A_MIN_PRICE_FD] = mn;
    obj[amazontext.A_MAX_PRICE_FD] = mx;
    obj[amazontext.A_NUMBEROFSELLERS_FD] = count;
    obj[amazontext.A_SELLERDETAILS_FD] = Sellerdetails;

    // Product description
    const description = $(amazontext.A_DESCRIPTION_CN).text();
    obj[amazontext.A_DESCRIPTION_FD] = description;

    // Scraping the brand
    let brand = $(amazontext.A_BRAND_CN).text();
    let brandarr = [];

    if (brand) {
      brandarr = brand.split(":");
      obj[amazontext.A_BRAND_FD] = brandarr[1];
    }

    // selecting the ratings element and the looping to get the different ratings percentage
    $(amazontext.A_ALLRATINGS_CN).each(async (_idx, el) => {
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

    //scraping the pagelink for the reviews
    const reviewsLink = $(amazontext.A_REVIEWSLINK_CN).attr("href");
    obj[
      amazontext.A_REVIEWSLINK_FD
    ] = `${amazontext.AMAZON_PAGE_LINK}${reviewsLink}`;

    //selecting the product details element and the looping to get the complete product details
    $(amazontext.A_PRODUCTDETAILS1_CN).each(async (_idx, el) => {
      const x = $(el);
      const key = x.find(amazontext.A_PRODUCTDETAILS_KEY_CN).text();
      const value = x.find(amazontext.A_PRODUCTDETAILS_VALUE_CN).text();
      if (key && value) {
        obj[key] = value;
      }
    });

    //selecting the product details element and the looping to get the complete product details
    $(amazontext.A_PRODUCTDETAILS2_CN)
      .children()
      .each(async (_idx, el) => {
        const x = $(el);
        let key = x.find(amazontext.A_PRODUCTDETAILS2_KEY_CN).text();
        for (let i = 0; i < key.length - 1; i++) {
          if (key[i] === " " && key[i + 1] === " ") {
            key = key.substring(0, i - 1);
            break;
          }
        }
        const value = x
          .find(amazontext.A_PRODUCTDETAILS2_VALUE_CN)
          .children("span")
          .last()
          .text();
        if (key && value) {
          obj[key] = value;
        }
      });

    //selecting the product details element and the looping to get the complete product details in case of electronics
    $(amazontext.A_PRODUCTDETAILS3_CN).each(async (_idx, el) => {
      const x = $(el);
      let key = x.find("th").text();
      for (let i = 0; i < key.length - 1; i++) {
        if (key[i] === " " && key[i + 1] === " ") {
          key = key.substring(0, i - 1);
          break;
        }
      }
      const value = x.find("td").text();
      if (key && value) {
        obj[key.trim()] = value.trim();
      }
    });

    if (!obj[amazontext.A_MOTHER_CATEGORY_FD]) {
      let p = obj["Best Sellers Rank"];
      let ranks,
        num = [];
      if (p) {
        ranks = p.replace("Best Sellers Rank:", "");
        ranks = ranks.trim();
        ranks = ranks.split(" ");
        ranks = ranks.filter((item) => {
          if (item !== " ") return item;
        });
        ranks = ranks.join(" ");
        ranks = ranks.replaceAll("#", " ");

        num = ranks.split("  ");
      }

      let st = [],
        rank = [];
      for (let i = 0; i < num.length; i++) {
        let q = num[i].split(" ");
        let s = "";
        if (!st.length) {
          let idx = q.indexOf("(See");
          for (let j = 3; j < idx; j++) {
            s += q[j];
          }
          if (q && q.length > 1) {
            q[1] = replce(q[1]);
            rank.push(q[1]);
          }
        } else {
          for (let j = 2; j < q.length; j++) {
            s += q[j];
          }
          if (q && q.length > 0) {
            q[0] = replce(q[0]);
            rank.push(q[0]);
          }
        }
        if (i == num.length - 1) {
          obj[amazontext.A_POSITION_FD] = Number(q[0]);
        }
        st.push(s);
      }

      // saving the scraped data in an object
      if (st.length > 1) {
        obj[amazontext.A_MOTHER_CATEGORY_FD] = st[0];
        obj[amazontext.A_CATEGORY_FD] = st[1];
        obj[amazontext.A_BSR_IN_MOTHER_CATEGORY] = rank[0];
        obj[amazontext.A_BSR_IN_CATEGORY] = rank[1];
        if (st.length > 2) {
          obj[amazontext.A_SUB_CATEGORY_FD] = st[2];
          obj[amazontext.A_PRODUCT_FD] = st[2];
        } else {
          obj[amazontext.A_PRODUCT_FD] = st[1];
        }
      }
    }

    if (!obj[amazontext.A_MOTHER_CATEGORY_FD]) {
      let Categories = [];
      $("div#wayfinding-breadcrumbs_feature_div>ul>li").each(
        async (_idx, el) => {
          const x = $(el);
          let category = x.find("a").text();
          if (category && category != "") {
            Categories.push(category.trim());
          }
        }
      );
      // saving the scraped data in an object
      if (Categories.length) {
        obj[amazontext.A_MOTHER_CATEGORY_FD] = Categories[0];
        obj[amazontext.A_CATEGORY_FD] = Categories[1];
        obj[amazontext.A_PRODUCT_FD] = Categories[Categories.length - 1];
        if (Categories.length > 2) {
          obj[amazontext.A_SUB_CATEGORY_FD] = Categories[2];
        }
      }
    }

    return obj;
  } catch (error) {
    try {
      console.log(error);
      if (page) {
        await page.close();
      }
      console.log("Some thing Went Wrong on details.js");
      return {};
    } catch (e) {
      console.log("Some thing Went Wrong on details1.js");
      return {};
    }
  }
};

module.exports = { amazonfetchIndividualDetails };

// const readline = require("readline").createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// readline.question("Type the captcha", (name) => {
//   console.log(`Captcha is ${name}!`);
//   captcha = name;
//   readline.close();
// });

// await page.waitForTimeout(20000);

// await page.type("input#captchacharacters", captcha);

// await page.click(
//   "span.a-button.a-button-primary.a-span12>span.a-button-inner>button.a-button-text"
// );

// await page.waitForTimeout(5000);
