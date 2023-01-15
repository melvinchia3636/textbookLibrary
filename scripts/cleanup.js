const data = require("../src/data/sizes.json");
const fs = require("fs");

const newData = Object.entries(data).map(([k, v]) => ({
  grade: k,
  items: Object.entries(v).map(([k, v]) => ({
    id: k,
    sizes: v,
  })),
}));

fs.writeFileSync("./v2.sizes.json", JSON.stringify(newData, null, 2));
