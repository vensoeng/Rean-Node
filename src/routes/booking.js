const router = require("express").Router();
const bookingContoller = require("../controllers/bookingContoller");

const { validateBooking } = require("../validators/bookingValidation");

//action
router.post("/", validateBooking, bookingContoller.createBooking);

module.exports = router;
