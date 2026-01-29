const sayHello = require("./hello.js");
const myModule = require("./module.js");

console.log(__dirname);
console.log(__filename);

global.myVariable = "こんちか✨️";
console.log(myVariable);
sayHello("いちか");
sayHello("ぽちぽちフレンズの皆");
myModule.eatSweetPotato();
myModule.eatPudding();
