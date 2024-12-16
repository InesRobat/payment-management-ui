const fs = require("fs");
const path = require("path");

// Read the index.html file
fs.readFile("dist/browser/index.html", "utf8", function (err, data) {
  if (err) {
    console.log(err);
    return;
  }

  // Update the src folder path
  let result = data.replace(/src="/g, 'src="/assets/');

  result = result.replace(
    '<link rel="stylesheet" href="',
    '<link rel="stylesheet" href="/assets/'
  );

  // Write the updated content back to the index.html file
  fs.writeFile("dist/browser/index.html", result, "utf8", function (err) {
    if (err) console.log(err);
  });
});
