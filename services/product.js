const db = require('../db');
const helper = require('../helper');


//################################################################################################################################################################################################
//################################################################################################################################################################################################
//################################################################################################################################################################################################


async function addProduct(product){
    try{
           // Check if the session token exists
    if (!vendor.hasOwnProperty('STOKEN')) {
        return helper.getErrorResponse(false, "Login sessiontoken missing. Please provide the Login sessiontoken", "ADD PRODUCT", "");
      }
      
      // Validate session token length
      if (vendor.STOKEN.length > 50 || vendor.STOKEN.length < 30) {
        return helper.getErrorResponse(false, "Login sessiontoken size invalid. Please provide the valid Sessiontoken", "ADD PRODUCT", "");
      }
      
      // Validate session token
      const [result] = await db.spcall('CALL SP_STOKEN_CHECK(?,@result); SELECT @result;', [vendor.STOKEN]);
      const objectvalue = result[1][0];
      const userid = objectvalue["@result"];
      
      if (userid == null) {
        return helper.getErrorResponse(false, "Login sessiontoken Invalid. Please provide the valid sessiontoken", "ADD PRODUCT", "");
      }
      
      // Check if querystring is provided
      if (!vendor.hasOwnProperty("querystring")) {
        return helper.getErrorResponse(false, "Querystring missing. Please provide the querystring", "ADD PRODUCT", "");
      }
  
      var secret = vendor.STOKEN.substring(0, 16);
      var querydata;
  
      // Decrypt querystring
      try {
        querydata = await helper.decrypt(vendor.querystring, secret);
      } catch (ex) {
        return helper.getErrorResponse(false, "Querystring Invalid error. Please provide the valid querystring.", "ADD PRODUCT", secret);
      }
      
      // Parse the decrypted querystring
      try {
        querydata = JSON.parse(querydata);
      } catch (ex) {
        return helper.getErrorResponse(false, "Querystring JSON error. Please provide valid JSON", "ADD PRODUCT", secret);
      }
  
      // Validate required fields
      if (!querydata.hasOwnProperty('productname') || querydata.productname == '') {
        return helper.getErrorResponse(false, "Product name missing. Please provide the Product name", "ADD PRODUCT", secret);
      }
      if (!querydata.hasOwnProperty('productprice') || querydata.productprice == '') {
        return helper.getErrorResponse(false, "Product price missing. Please provide the Product price", "ADD PRODUCT", secret);
      }
      if(!querydata.hasOwnProperty('producthsn') || querydata.producthsn == ''){
        return helper.getErrorResponse(false, "Product HSN missing. Please provide the Product HSN", "ADD PRODUCT", secret);
      }
      if(!querydata.hasOwnProperty('productgst') || querydata.productgst == ''){
        return helper.getErrorResponse(false, "Product GST missing. Please provide the Product GST", "ADD PRODUCT", secret);
      }
      if(!querydata.hasOwnProperty('productbrand') || querydata.productbrand == ''){
        return helper.getErrorResponse(false, "Product Brand missing. Please provide the Product Brand", "ADD PRODUCT", secret);
      }
      if(!querydata.hasOwnProperty('producttype') || querydata.producttype == ''){  
        return helper.getErrorResponse(false, "Product Type missing. Please provide the Product Type", "ADD PRODUCT", secret);
      }
      if(!querydata.hasOwnProperty('productmrp') || querydata.productmrp == ''){  
        return helper.getErrorResponse(false, "Product MRP missing. Please provide the Product MRP", "ADD PRODUCT", secret);
      }
    }catch(er){
        console.log(er);
    }
}

module.exports = {
    addProduct,

}