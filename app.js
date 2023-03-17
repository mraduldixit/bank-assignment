const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = 3100;

app.use(
  cors({
    origin: "*",
  })
);

// Connect to the database
mongoose
  .connect(
    "mongodb+srv://rishusingh:rishu04072001@cluster0.lhxiv.mongodb.net/mybank?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => {
    console.log("DB Success");
  })
  .catch(() => {
    console.log("DB failure");
  });

// Define the account schema
const accountSchema = new mongoose.Schema({
  acId: { type: String, required: true, unique: true },
  acNm: { type: String, required: true },
  balance: { type: Number, required: true },
});

const Account = mongoose.model("Account", accountSchema);

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Route for retrieving all accounts
app.get("/accounts", async (req, res) => {
  const accounts = await Account.find();
  res.json(accounts);
});

// Route for creating a new account
app.post("/accounts", async (req, res) => {
  const account = new Account({
    acId: req.body.acId,
    acNm: req.body.acNm,
    balance: req.body.balance,
  });
  const result = await account.save();
  res.json(result);
});

// Route for retrieving a specific account
app.get("/accounts/:acId", async (req, res) => {
  const account = await Account.findOne({ acId: req.params.acId });
  if (!account) {
    res.sendStatus(404);
  } else {
    res.json(account);
  }
});

// Route for updating an account
app.put("/accounts/:acId", async (req, res) => {
  const account = await Account.findOne({ acId: req.params.acId });
  if (!account) {
    res.sendStatus(404);
  } else {
    account.acNm = req.body.acNm || account.acNm;
    account.balance = req.body.balance || account.balance;
    const result = await account.save();
    res.json(result);
  }
});

// Route for deleting an account
app.delete("/accounts/:acId", async (req, res) => {
  const result = await Account.deleteOne({ acId: req.params.acId });
  res.json(result.deletedCount === 1 ? { success: true } : { success: false });
});

// Route for depositing into an account
app.post("/accounts/:acId/deposit", async (req, res) => {
  const account = await Account.findOne({ acId: req.params.acId });
  if (!account) {
    res.sendStatus(404);
  } else {
    const depositAmount = parseFloat(req.body.amount);
    account.balance += depositAmount;
    const result = await account.save();
    res.json(result);
  }
});

app.post("/accounts/:acId/withdraw", async (req, res) => {
  const account = await Account.findOne({ acId: req.params.acId });
  if (!account) {
    res.sendStatus(404);
  } else {
    const withdrawAmount = parseFloat(req.body.amount);
    if (account.balance < withdrawAmount) {
      res.status(400).json({ message: "Insufficient funds" });
    } else {
      account.balance -= withdrawAmount;
      const result = await account.save();
      res.json(result);
    }
  }
});

// Route for transferring between accounts
app.post("/accounts/:fromAcId/transfer/:toAcId", async (req, res) => {
  const fromAccount = await Account.findOne({ acId: req.params.fromAcId });
  const toAccount = await Account.findOne({ acId: req.params.toAcId });
  if (!fromAccount || !toAccount) {
    res.sendStatus(404);
  } else {
    const transferAmount = parseFloat(req.body.amount);
    if (fromAccount.balance < transferAmount) {
      res.status(400).json({ message: "Insufficient funds" });
    } else {
      fromAccount.balance -= transferAmount;
      toAccount.balance += transferAmount;
      const result1 = await fromAccount.save();
      const result2 = await toAccount.save();
      res.json([result1, result2]);
    }
  }
});

app.listen(port, () => {
  console.log("running on port 3100");
});
