const app = require("./app");

// app configuration
app.set("port", process.env.PORT || 3000);

app.listen(app.get("port"), function () {
  const url = "http://localhost:" + app.set("port");
  console.log("Application running on port: ", app.get("port"));
});
