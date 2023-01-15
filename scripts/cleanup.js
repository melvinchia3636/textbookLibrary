const name = require("../src/data/name.json");
const pages = require("../src/data/pages.json");
const size = require("../src/data/sizes.json");
const fs = require("fs");

let newData = [];

for (let item of Object.keys(name)) {
  newData.push({
    grade: item,
    items: Object.entries(name[item]).map(([key, value]) => ({
      id: key,
      name: value,
      page: pages[item][key],
      size: size[item][key],
    })),
  });
}

fs.writeFileSync("./v2_books.json", JSON.stringify(newData, null, 2));
