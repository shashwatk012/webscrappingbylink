const { proxies_list } = require("../text");

const proxyReq = async (url) => {
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

    const [host, port] = proxies_list[num].split(":");

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

    return html;
  } catch (error) {
    return "";
  }
};

module.exports = proxyReq;
