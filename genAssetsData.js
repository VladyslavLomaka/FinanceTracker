const fs = require("fs");

const assetTypes = ["stock", "crypto"];
const assetNames = [
  "Apple Inc.",
  "Tesla Inc.",
  "Amazon.com Inc.",
  "Microsoft Corporation",
  "Alphabet Inc.",
  "Facebook Inc.",
  "Nvidia Corporation",
  "Netflix Inc.",
  "Bitcoin",
  "Ethereum",
  "Cardano",
  "Solana",
  "XRP",
  "Polkadot",
  "Litecoin",
  "Intel Corporation",
  "IBM",
  "Twitter Inc.",
  "Shopify Inc.",
  "PayPal Holdings",
];

function generateAssets(numAssets = 500) {
  const assets = [];

  for (let i = 1; i <= numAssets; i++) {
    const name = assetNames[Math.floor(Math.random() * assetNames.length)];
    const symbol = name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 5);
    const assetType = assetTypes[Math.floor(Math.random() * assetTypes.length)];
    const currentPrice = (Math.random() * 5000 + 10).toFixed(2);
    const dailyChangePercent = (Math.random() * 10 - 5).toFixed(2);

    assets.push({
      id: i,
      name,
      symbol,
      type: assetType,
      currentPrice: parseFloat(currentPrice),
      dailyChangePercent: parseFloat(dailyChangePercent),
    });
  }

  return assets;
}

const assets = generateAssets();
const fileName = "financial_assets.json";

fs.writeFile(fileName, JSON.stringify(assets, null, 4), err => {
  if (err) {
    console.error("Error writing file:", err);
  } else {
    console.log(`${fileName} has been created with 500+ financial assets.`);
  }
});
