const fs = require("fs");
const path = require("path");

// Define the correct output path
const outputPath = "dist/payment-management-ui/index.html";

// Read the index.html file
fs.readFile(outputPath, "utf8", function (err, data) {
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
  fs.writeFile(outputPath, result, "utf8", function (err) {
    if (err) console.log(err);
  });
});
