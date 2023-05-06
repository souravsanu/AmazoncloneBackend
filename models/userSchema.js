const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secrectKey = process.env.KEY;

const userSchema = new mongoose.Schema({
  fname: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validator(value) {
      if (!validator.isEmail(value)) {
        throw new Error("not valid email address");
      }
    },
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    maxlength: 10,
  },
  Password: { type: String, required: true, minlength: 6 },
  cPassword: { type: String, required: true, minlength: 6 },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  carts: Array,
});

userSchema.pre("save", async function (next) {
  if (this.isModified("Password")) {
    this.Password = await bcrypt.hash(this.Password, 12);
    this.cPassword = await bcrypt.hash(this.cPassword, 12);
  }
  next();
});

//token genrate

userSchema.methods.generateAuthtokenn = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, secrectKey);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
  }
};

//add to cart data

userSchema.methods.addcartdata = async function (cart) {
  try {
    this.carts = this.carts.concat(cart);
    await this.save();
    return this.carts;
  } catch (error) {
    console.log(error);
  }
};

const USER = new mongoose.model("USER", userSchema);

module.exports = USER;
