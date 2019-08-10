const SafeMath = artifacts.require("SafeMath");
const Points = artifacts.require("Points");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, Points);
  deployer.deploy(Points);
};
