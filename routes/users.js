const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost:27017/spotlit");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6, // you can adjust this
    },
    Job: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Job",
        },
      ],
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    dp: {
      type: String, // storing URL of display picture
      default: "", // default empty string if no dp
    },
  },
  { timestamps: true }
);
userSchema.plugin(plm);
const User = mongoose.model("User", userSchema);

module.exports = User;
