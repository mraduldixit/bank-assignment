const MongoClient = require("mongodb").MongoClient;

const url =
  "mongodb+srv://rishusingh:rishu04072001@cluster0.lhxiv.mongodb.net/mybank?retryWrites=true&w=majority";
let _db;

const connect = async () => {
  const client = await MongoClient.connect(url);
  _db = client.db("mybank");
  return _db;
};

const getDb = () => {
  if (!_db) {
    throw Error("Database not initialized");
  }
  console.log("DB success");
};

module.exports = {
  connect,
  getDb,
};
