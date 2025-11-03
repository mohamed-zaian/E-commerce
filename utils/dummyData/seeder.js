import dotenv from "dotenv";
import fs from "fs";
import dbConnection from "../../config/db.js";
import Product from "../../model/productModel.js";

dotenv.config({ path: "../../config.env" });

// connect to DB
dbConnection();

const products = JSON.parse(fs.readFileSync("./data.json"));

// Insert data into DB
const insertData = async () => {
  try {
    await Product.create(products);

    console.log("Data Inserted");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log("Data Destroyed");
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// node seeder.js -d
if (process.argv[2] === "-i") {
  insertData();
} else if (process.argv[2] === "-d") {
  destroyData();
}
