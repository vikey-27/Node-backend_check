const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const usersControllers = require("../controller/users-controller");

router.get("/", usersControllers.getUsers);

router.post("/login", usersControllers.login);
router.post(
  "/signup",
  [
    check("name").isEmpty(),
    check("email").normalizeEmail()   //Test@test.com => test@test.com
    .isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.signup
);

module.exports = router;

module.exports = router;
