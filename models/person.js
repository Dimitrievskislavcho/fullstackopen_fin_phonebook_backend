const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const dbUrl = process.env.MONGODB_URI;

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    validate: {
      validator: (value) => /\d{2,3}-(\d)+/.test(value) && value.length >= 8,
      message: (props) =>
        `${props.value} is invalid. Input should be in format: [2 or 3 digits]-[any number of digits] ex: 22-22222`,
    },
  },
});

personSchema.set("toJSON", {
  transform: (_, itemObject) => {
    itemObject.id = itemObject._id.toString();
    delete itemObject._id;
    delete itemObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
