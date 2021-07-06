var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var cors = require("cors");
var fs = require("fs");

var { ExportToCsv } = require("export-to-csv");

const exportToCsv = (localStorage) => {
  const options = {
    fieldSeparator: ",",
    quoteStrings: '"',
    decimalSeparator: ".",
    showLabels: true,
    showTitle: true,
    title: "My Awesome CSV",
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
    // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
  };

  const csvExporter = new ExportToCsv(options);

  const x = csvExporter.generateCsv(localStorage, true);

  fs.writeFile("./myAwesomeCSV.csv", x, function (err) {
    if (err) throw err;
    console.log("ILIAS SUCCESSFULLY WRITTEN");
  });

  // const csvExporter = new ExportToCsv(options);

  // return csvExporter.generateCsv(localStorage);
};

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/downloadCSV", (req, res, next) => {
  const data = req.body;
  console.log("hi ilias", data);
  console.log("hi ilias", req.method);
  console.log("hi ilias body", req.body);

  exportToCsv(data);

  console.log("hi ilias data exported");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "*");

  res.json({ status: "success" });
  next();
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  console.log("hi ilias error", err);

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(3000, (err) => {
  if (err) throw err;

  console.log(`🚀 Ready on http://localhost:3000`);
});

// module.exports = app;
