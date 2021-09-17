//Importing the npm package
const obj = require('tennis-player-pairing');

//Using a function from teh package to check a pair of names
result = obj.checkNames("Jack", "Uliyan");
console.log(result);

fileResult = obj.processFile("./TestData.csv");