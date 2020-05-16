require("dotenv").config();
const cors = require("cors");
const express = require("express");

const stripe = require("stripe")(process.env.SECRET_KEY);
const { v4: uuidv4 } = require("uuid");

const app = express();

//middleware
app.use(express.json());
app.use(cors());

//routes
app.get("/", (req, res) => {
  res.send("HELLO WORLD");
});

app.post("/payment", (req, res) => {
  const { product, token } = req.body;
  const idempontencyKey = uuidv4();

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: `purchase of ${product.name}`,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address_country,
            },
          },
        },
        { idempontencyKey }
      );
    })
    .then((result) => res.status(200).json(result))
    .catch((err) => console.log(err));
});

//listen
const port = process.env.PORT;
app.listen(port, () => console.log(`LISTENING AT PORT ${port}`));
