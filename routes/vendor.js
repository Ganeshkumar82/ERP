const express = require('express');
const router = express.Router();
const vendor = require('../services/vendor');
const { uploadVendorRegistrationCert, uploadVendorPAN, uploadVendorCancelledCheque, uploadVendorLogo } = require('../middleware');


router.post('/addvendor', async function(req,res,next){
  try{
    res.json(await vendor.AddVendor(req.body));
  }catch(er){
    console.log(`Error adding the vendor -> ${er}`);
    next(er);
  }
});

router.post('/getvendor', async function(req,res,next){
  try{
   res.json(await vendor.GetVendor(req.body));
  }catch(er){
   console.log(`Error getting the vendor -> ${er}`);
   next(er);
  }
});

router.post('/addquotation', async function(req,res,next){
  try{
    res.json(await vendor.AddQuotation(req, res, next));
  }catch(er){
    console.log(`Error adding the vendor quotation -> ${er}`);
    next(er);
  }
});

router.post('/detailspreloader', async function(req, res, next) {
  try {
    res.json(await vendor.vendorDetailsPreLoader(req.body));
  } catch (er) {
    console.log(`Error in vendor details preloader -> ${er}`);
    next(er);
  }
});
router.post('/getprocesslist', async function(req, res, next) {
  try {
    res.json(await vendor.GetProcessList(req.body));
  } catch (er) {
    console.log(`Error in vendor process list -> ${er}`);
    next(er);
  }
});

router.post('/getsubprocesslist', async function(req, res, next) {
  try {
    res.json(await vendor.GetSubProcessList(req.body));
  } catch (er) {
    console.log(`Error in vendor sub process list -> ${er}`);
    next(er);
  }
});

router.post('/postrfq', async function(req, res, next) {
  try {
    res.json(await vendor.PostRFQ(req, res));
  } catch (er) {
    console.log(`Error posting RFQ -> ${er}`);
    next(er);
  }
});

// KYC Document Update Routes
router.post('/updateregistrationcert', uploadVendorRegistrationCert, async function(req, res, next) {
  try {
    res.json(await vendor.UpdateVendorRegistrationCert(req, res));
  } catch (er) {
    console.log(`Error updating vendor registration certificate -> ${er}`);
    next(er);
  }
});

router.post('/updatepan', uploadVendorPAN, async function(req, res, next) {
  try {
    res.json(await vendor.UpdateVendorPAN(req, res));
  } catch (er) {
    console.log(`Error updating vendor PAN -> ${er}`);
    next(er);
  }
});

router.post('/updatecancelledcheque', uploadVendorCancelledCheque, async function(req, res, next) {
  try {
    res.json(await vendor.UpdateVendorCancelledCheque(req, res));
  } catch (er) {
    console.log(`Error updating vendor cancelled cheque -> ${er}`);
    next(er);
  }
});

router.post('/updatelogo', uploadVendorLogo, async function(req, res, next) {
  try {
    res.json(await vendor.UpdateVendorLogo(req, res));
  } catch (er) {
    console.log(`Error updating vendor logo -> ${er}`);
    next(er);
  }
});

router.post('/getproducts', async function(req, res, next) {
  try {
    res.json(await vendor.GetProducts(req.body));
  } catch (er) {
    console.log(`Error getting vendor products -> ${er}`);
    next(er);
  }
});

router.post('/getnotes', async function(req, res, next) {
  try {
    res.json(await vendor.getNotes(req.body));
  } catch (er) {
    console.log(`Error getting vendor notes -> ${er}`);
    next(er);
  }
});

router.post('/getallprocesslist', async function(req, res, next) {
  try {
    res.json(await vendor.GetAllProcessList(req.body));
  } catch (er) {
    console.log(`Error getting vendor process list -> ${er}`);
    next(er);
  }
});

module.exports = router;