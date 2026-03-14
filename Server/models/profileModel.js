const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
  lastName: {
    type: String,
  },
  sex: {
    type: String,
  },
  specialty: {
    type: String,
  },
  followers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
  ],
  following: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
  ],
  uploads: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Article", default: [] },
  ],
  bio: {
    type: String,
    default: "",
  },
  profilePicture: {
    type: String,
    default: "",
  },
  ProfileCover: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
  government: {
    type: String,
    default: "",
  },
  socials: [
    {
      platform: {
        type: String,
        required: true,
        enum: [
          "LinkedIn",
          "GitHub",
          "Twitter",
          "Facebook",
          "Instagram",
          "Website",
        ],
      },
      userName: { type: String, required: true },
      url: {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            return /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/.test(v);
          },
          message: (props) => `${props.value} n'est pas une URL valide !`,
        },
      },
      icon: { type: String },
      connected: { type: Boolean, default: false },
    },
  ],
});

module.exports = mongoose.model("Profile", profileSchema);
