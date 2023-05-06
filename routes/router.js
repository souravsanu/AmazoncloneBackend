const express = require("express");
const router = new express.Router();
const Products = require("../models/productsSchema");
const USER = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const athenticate = require("../middleware/authenticate");

//get productdata api
router.get("/getproducts", async (req, res) => {
  try {
    const productsdata = await Products.find();
    // console.log("console the data" + productsdata);
    res.status(201).json(productsdata);
  } catch (error) {
    console.log("error" + error.message);
  }
});

//get individual data
router.get("/getproductsone/:id", async (req, res) => {
  let individuadata;
  try {
    const { id } = req.params;
    // console.log(id);

    individuadata = await Products.findOne({ id: id });
    // console.log(individuadata + "individual data");
    res.status(201).json(individuadata);
  } catch (error) {
    res.status(400).json(individuadata);
    console.log("error" + error.message);
  }
});

//register data
router.post("/register", async (req, res) => {
  // console.log(req.body);

  const { fname, email, mobile, Password, cPassword } = req.body;

  if (!fname || !email || !mobile || !Password || !cPassword) {
    res.status(422).json({ error: "fill the all data" });
    console.log("no data available");
  }

  try {
    const preuser = await USER.findOne({ email: email });

    if (preuser) {
      res.status(422).json({ error: "this user is already present" });
    } else if (Password !== cPassword) {
      res.status(422).json({ error: "password and cpassword not match" });
    } else {
      const finalUser = new USER({
        fname,
        email,
        mobile,
        Password,
        cPassword,
      });

      const storedata = await finalUser.save();
      console.log(storedata);

      res.status(201).json(storedata);
    }
  } catch (error) {}
});

//Login user api

router.post("/login", async (req, res) => {
  const { email, Password } = req.body;

  if (!email || !Password) {
    res.status(400).json({ error: "fill the details" });
  }
  try {
    const userlogin = await USER.findOne({ email: email });
    console.log(userlogin + "user value");

    if (userlogin) {
      const isMatch = await bcrypt.compare(Password, userlogin.Password);

      const token = await userlogin.generateAuthtokenn();
      // console.log(token);
      res.cookie("Amazonweb", token, {
        expires: new Date(Date.now() + 2589000),
        httpOnly: true,
      });

      if (!isMatch) {
        res.status(400).json({ error: "Password not match" });
      } else {
        res.status(201).json(userlogin);
      }
    } else {
      res.status(400).json({ error: "invalid details" });
    }
  } catch (error) {
    res.status(400).json({ error: "invalid crediential pass" });
    console.log("error the bhai catch ma for login time" + error.message);
  }
});

//adding the data into cart

router.post("/addcart/:id", athenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await Products.findOne({ id: id });
    console.log(cart + "cart value");

    const UserContact = await USER.findOne({ _id: req.userID });
    console.log(UserContact);

    if (UserContact) {
      const cartData = await UserContact.addcartdata(cart);
      await UserContact.save();
      console.log(cartData);
      res.status(201).json(UserContact);
    } else {
      res.status(401).json({ error: "invalid user" });
    }
  } catch (error) {
    res.status(401).json({ error: "invalid user" });
  }
});

//get cart details

router.get("/cartdetails", athenticate, async (req, res) => {
  try {
    const buyuser = await USER.findOne({ _id: req.userID });
    res.status(201).json(buyuser);
  } catch (error) {
    console.log("error" + error);
  }
});

//get valid user

router.get("/validuser", athenticate, async (req, res) => {
  try {
    const validuserone = await USER.findOne({ _id: req.userID });
    res.status(201).json(validuserone);
  } catch (error) {
    console.log("error" + error);
  }
});

//remove item from cart

router.delete("/remove/:id", athenticate, async (req, res) => {
  try {
    const { id } = req.params;
    req.rootUser.carts = req.rootUser.carts.filter((cruval) => {
      return cruval.id != id;
    });

    req.rootUser.save();
    res.status(201).json(req.rootUser);
    console.log("item remove");
  } catch (error) {
    console.log("error" + error);
    res.status(400).json(req.rootUser);
  }
});

//for user logout

router.get("/lougout", athenticate, (req, res) => {
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
      return curelem.token !== req.token;
    });

    res.clearCookie("Amazonweb", { path: "/" });
    req.rootUser.save();
    res.status(201).json(req.rootUser.tokens);
    console.log("user logout");
  } catch (error) {
    console.log("error for user logout");
  }
});
module.exports = router;
