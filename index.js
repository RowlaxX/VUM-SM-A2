const { Builder, By, Key, until } = require('selenium-webdriver');
const fs = require('fs');
const fsExtra = require('fs-extra');

require("chromedriver");

let COUNT = 100;
let METRICS = new Array(COUNT);
let RESULT;

async function main() {
  for (var i = 0 ; i < COUNT ; i++)
    await test(i);

  for (var j = 0 ; j < RESULT.length ; j++)
    RESULT[j].value /= COUNT;

  console.log("Final results :");
  console.log(RESULT);
  console.log("Saving...");
  await save();
}

async function test(i){
  let driver = await new Builder()
    .forBrowser("chrome")
    .build();

  await driver.sendAndGetDevToolsCommand('Performance.enable')
  await driver.get('https://en.wikipedia.org/wiki/Software_metric ');

  var result = await driver.sendAndGetDevToolsCommand('Performance.getMetrics')
  result = result.metrics;

  METRICS[i] = result;

  if (i == 0){
    RESULT = new Array(result.length);
    for (var j = 0 ; j < result.length ; j++)
      RESULT[j] = {name: result[j].name, value: 0};
  }

  for (var j = 0 ; j < result.length ; j++)
    RESULT[j].value += result[j].value;

  console.log(result);
  console.log("Test " + i + " done");

  await driver.quit();
}

async function save() {

  fsExtra.emptyDirSync("results");

  for (var i = 0 ; i < METRICS.length ; i++)
    fs.writeFileSync("results/result" + i + ".json", JSON.stringify( METRICS[i] ));

  fs.writeFileSync("results/average.json", JSON.stringify(RESULT) );
}

main();