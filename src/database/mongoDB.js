/** @format */

const mongoose = require("mongoose");

mongoose.connect(process.env.DB_URL);
mongoose.connection.on("error", () => console.log("DB is not connectetd"));
mongoose.connection.on("connected", () => console.log("DB is connectetd"));
