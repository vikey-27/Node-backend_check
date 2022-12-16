const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const placesControllers = require("../controller/places-controller");
const checkAuth = require("../middleware/check-auth");

router.get("/:pid", placesControllers.getPlaceById);
router.get("/user/:uid", placesControllers.getPlaceByUserId);

router.use(checkAuth);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesControllers.createPlace
);

router.patch(
  "/:pid",
  [
    check("description").not().isEmpty().isLength({min:5}),
    check("title").not().isEmpty(),
  ],
  placesControllers.updatePlaceById
);

router.delete("/:pid", placesControllers.deletePlace);
module.exports = router;
