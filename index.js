require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();

app.use(cors());
app.use(express.json());

const errorHandler = (error, _, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }

  next(error);
};

app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      JSON.stringify(req.body),
    ].join(" ");
  })
);

app.use(express.static("dist"));

app.get("/info", (_, response, next) => {
  Person.find({})
    .then((result) => {
      response.send(`
        <div>Phoneboook has info for ${result.length} people</div>
        </br>
        <div>${new Date()}</div>
    `);
    })
    .catch((error) => next(error));
});

app.get("/api/persons", (_, response, next) => {
  Person.find({})
    .then((result) => {
      response.send(result.map((item) => item.toJSON()));
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;

  Person.findById(id)
    .then((result) => {
      if (!result) {
        response.status(404).end();
      } else {
        response.send(result.toJSON());
      }
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true })
    .then((updatedPerson) => {
      response.send(updatedPerson);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const { name, number } = request.body || {};
  let error;

  if (!name || !number) {
    error = "Name and number must be present in request body!";
  }

  if (error) {
    return response.status(400).send({ error });
  }

  const person = new Person({ name, number });

  person
    .save()
    .then((result) => {
      response.status(201).send(result.toJSON());
    })
    .catch((error) => next(error));
});

app.use(errorHandler);

const PORT = process.env.PORT;
console.log(PORT);
app.listen(PORT, () => console.log(`App is running on port: ${PORT}`));
