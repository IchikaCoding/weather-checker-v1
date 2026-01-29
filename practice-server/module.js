function eatSweetPotato() {
  console.log("焼き芋食べた🍠");
}

function eatPudding() {
  console.log("卵が美味しいプリンって最高🍮");
}
// 複数のモジュールをexportするときはオブジェクトにする
module.exports = {
  eatSweetPotato: eatSweetPotato,
  eatPudding: eatPudding,
};
// module.exports = eatPudding;
