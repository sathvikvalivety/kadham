const app = require("./app");
const config = require("./config");

const port = config.port;

app.listen(port, () => {
  console.log(`Kadham backend listening on port ${port}`);
});
