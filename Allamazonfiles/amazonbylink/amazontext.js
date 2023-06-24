"use strict";

// CN=CLASS NAME
// F=AMAZON
// FD=FIELD

const amazontext = {
  A_ALLPRODUCTLINK_CN: "div.s-result-item.s-asin.sg-col.s-widget-spacing-small",
  A_PRODUCTLINK_CN:
    "a.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal",
  A_PRODUCTNAME_CN: "span#productTitle",
  A_PRICE_CN:
    "span.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay>span.a-offscreen",
  A_PRICE_ALTERNATIVE_CN:
    "span.a-price.a-text-price.a-size-medium.apexPriceToPay>span.a-offscreen",
  A_MAXRETAILPRICE_CN:
    "div.a-section.a-spacing-small.aok-align-center>span>span>span>span.a-price.a-text-price>span.a-offscreen",
  A_MAXRETAILPRICE_ALTERNATIVE_CN:
    "td.a-span12.a-color-secondary.a-size-base>span.a-price.a-text-price.a-size-base>span.a-offscreen",
  A_IMAGELINK_CN: "div.imgTagWrapper>img",
  A_IMAGELINK_ALTERNATIVE_CN: "div.imgTagWrapper>div#unrolledImgNo0>div>img",
  A_RATINGS_CN: "span#acrCustomerReviewText",
  A_STARS_CN: "a.a-popover-trigger.a-declarative>span.a-size-base.a-color-base",
  F_STARS_ALTERNATIVE_CN: "div._2d4LTz",
  A_LISTOFCATEGORIES_CN:
    ".a-section.feature.detail-bullets-wrapper.bucket>ul.a-unordered-list.a-nostyle.a-vertical.a-spacing-none.detail-bullet-list",
  A_CATEGORY_CN: "span.a-list-item",
  A_REVIEWSLINK_CN: "a.a-link-emphasis.a-text-bold",
  A_PRODUCTDETAILS1_CN: "tr.a-spacing-small",
  A_PRODUCTDETAILS2_CN:
    ".a-section.feature.detail-bullets-wrapper.bucket>div#detailBullets_feature_div>ul.a-unordered-list.a-nostyle.a-vertical.a-spacing-none.detail-bullet-list",
  A_PRODUCTDETAILS_KEY_CN: "td.a-span3>span.a-size-base.a-text-bold",
  A_PRODUCTDETAILS3_CN: "table#productDetails_detailBullets_sections1>tbody>tr",
  A_PRODUCTDETAILS_VALUE_CN: "td.a-span9>span.a-size-base.po-break-word",
  A_PRODUCTDETAILS2_KEY_CN: "span.a-text-bold",
  A_PRODUCTDETAILS2_VALUE_CN: "span.a-list-item",
  A_DESCRIPTION_CN: "div#productDescription>p",
  A_NUMBEROFIMAGES_CN: "li.a-spacing-small.item.imageThumbnail.a-declarative",
  A_ALLRATINGS_CN: "tr.a-histogram-row.a-align-center",
  A_ALLRATINGS_key_CN: "td.aok-nowrap>span.a-size-base>a.a-link-normal",
  A_ALLRATINGS_value_CN:
    "td.a-text-right.a-nowrap>span.a-size-base>a.a-link-normal",
  A_NUM_REVIEWS_CN: ".a-row.a-spacing-base.a-size-base",
  A_REVIEWS_CN: "div.a-section.review.aok-relative",
  A_REVIEWS_TITLE_CN: "span.a-profile-name",
  A_REVIEWS_SUMMARY_CN: "span.a-size-base.review-text.review-text-content>span",
  A_SELLERS_CN: "div.a-box.mbc-offer-row.pa_mbc_on_amazon_offer",
  A_SELLERSDELIVERYCHARGES_CN: "span#mbc-delivery-",
  A_SELLERSPRICE_CN: "span#mbc-price-",
  A_BRAND_CN: "a#bylineInfo",
  A_PRODUCTNAME_FD: "ProductName",
  A_PRICE_FD: "Price",
  A_MAXRETAILPRICE_FD: "Max_Retail_Price",
  A_IMAGELINK_FD: "Imagelink",
  A_RATINGS_FD: "Ratings",
  A_REVIEWS_FD: "Reviews",
  A_STARS_FD: "Stars",
  A_MOTHER_CATEGORY_FD: "Mother_Category",
  A_CATEGORY_FD: "Category",
  A_SUB_CATEGORY_FD: "Sub_Category",
  A_REVIEWSLINK_FD: "reviewsLink",
  A_DESCRIPTION_FD: "Description",
  A_NUMBEROFIMAGES_FD: "Number_Of_Images",
  A_NUMBEROFSELLERS_FD: "Number_Of_Sellers",
  A_DISCOUNT_FD: "Discount%",
  A_PRODUCT_FD: "Product",
  A_BRAND_FD: "Brand",
  A_STARRATINGS_FD: "ratings",
  A_STARRATINGS1_FD: "Star_Ratings",
  A_SELLERDETAILS_FD: "SellerDetails",
  A_MAX_PRICE_FD: "Max_Price",
  A_MIN_PRICE_FD: "Min_Price",
  A_ST_DEV_PRICE_FD: "St_Dev_Price",
  A_PLATFORM_FD: "Platform",
  A_NET_RATING_SCORE_FD: "Net_Rating_Score_NRS",
  A_TITLE_LENGTH_FD: "Title_Length",
  A_DESCRIPTION_FD: "Description",
  A_DESCRIPTION_LENGTH_FD: "Description_Length",
  A_SEARCH_TERM_FD: "Search_Term",
  A_POSITION_FD: "Position",
  A_DATE_FD: "Date",
  A_QUANTITY_FD: "Quantity",
  A_QUANTITY_UNIT_FD: "Quantity_Unit",
  A_NET_QUANTITY_FD: "Net Quantity",
  A_PRICE_PER_UNIT_FD: "Price_Per_Unit",
  A_POSITIVE_FIRST_FD: "POSITIVE_FIRST",
  A_NEGATIVE_FIRST_FD: "NEGATIVE_FIRST",
  A_BSR_IN_MOTHER_CATEGORY: "BSR_in_Mother_Category",
  A_BSR_IN_CATEGORY: "BSR_in_Category",
  AMAZON_PAGE_LINK: "https://amazon.in",
};

module.exports = amazontext;
