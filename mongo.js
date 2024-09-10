const mongoose = require("mongoose");
const [, , name, number] = process.argv;

require("dotenv").config();

mongoose.set("strictQuery", false);
const url = process.env.MONGODB_URI;
console.log(url);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});
const Person = mongoose.model("Person", personSchema);

if (name && number) {
  const newPerson = new Person({ name, number });
  newPerson.save().then((result) => {
    console.log(`added ${result.name} number ${result.number} to phonebook`);
    mongoose.connection.close();
    process.exit(0);
  });
}

Person.find({}).then((result) => {
  console.log("phonebook:");
  result.forEach(({ name, number }) => {
    console.log(`${name} ${number}`);
  });
  process.exit(0);
});
