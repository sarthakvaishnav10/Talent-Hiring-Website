const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    postText: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: [],
      default: 0,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

const Job = mongoose.model("Job", postSchema);

module.exports = Job;
