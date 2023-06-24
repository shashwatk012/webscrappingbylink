// const wait = require("wait-for-stuff");
const cheerio = require("cheerio");
const amazontext = require("./amazontext");
const scrapingbee = require("scrapingbee");
const request = require("request-promise");
const axios = require("axios");
const http = require("http");
const https = require("https");
const { proxies_list } = require("../text");

// let num = 0;
// let num_proxies = [];
// for (let i = 0; i < 993; i++) {
//   num_proxies.push(0);
// }
const amazonfetchUrlDetails = async (url) => {
  try {
    const headers = {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-US,en;q=0.9,la;q=0.8",
      "Sec-Ch-Ua":
        '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "cross-site",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      "X-Amzn-Trace-Id": "Root=1-646baec9-23c65be55fbb54967e9160ef",
    };

    const num = Math.floor(Math.random() * 993);
    // num_proxies.num_proxies[random]++;
    const [host, port] = proxies_list[num].split(":");
    // num_proxies[num]++;
    // num++;
    // if (num == proxies_list.length) {
    //   num = 0;
    // }
    console.log(host, port, num);

    const targetUrl = url;

    const agent = new http.Agent({
      host: host,
      port: port,
      path: "/",
      rejectUnauthorized: false, // Set to false if the proxy server has a self-signed SSL certificate
    });

    headers.httpAgent = agent;
    headers.timeout = 3000;

    const response = await axios.get(targetUrl, headers);
    const html = response.data;

    // cheerio nodejs module to load html
    $ = cheerio.load(html);

    const products = [];

    $(amazontext.A_ALLPRODUCTLINK_CN).each(async (_idx, el) => {
      // selecting the elements to be scrapped
      const product = $(el);

      let productlink = product // scraping the link of the product
        .find(amazontext.A_PRODUCTLINK_CN)
        .attr("href");

      let element = {
        Productlink: `${amazontext.AMAZON_PAGE_LINK}${productlink}`,
      };

      products.push(element); //storing the details in an array
    });
    return products;
  } catch (error) {
    return [];
  }
};

module.exports = { amazonfetchUrlDetails };
