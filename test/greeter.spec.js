const {expect} = require("chai");
// The ethers variable is available in the global scope.
// If you like your code always being explicit, you can uncomment this line below:
// const { ethers } = require("hardhat");

describe("Greeter", function () {
  let accounts;

  before(async function () {
    // Getting the first and second account in the node
    accounts = await ethers.getSigners();
  });

  it("Should return the new greeting once it's changed", async function () {
    // Greeter is a ContractFactory for deploying Greeter contracts
    const Greeter = await ethers.getContractFactory("Greeter");
    // deploy() function takes the argument passed to the ctor and resolves to a Contract instance of type Greeter
    const greeter = await Greeter.deploy("Hello, world!");
    // Wait for contract to be deployed
    await greeter.deployed();
    // Using contract instance to call method greet() which returns a string from the contract
    expect(await greeter.greet()).to.equal("Hello, world!");
    // Using contract instance to call method setGreeting() which sets a new string in the contract
    await greeter.setGreeting("Hola, mundo!");
    expect(await greeter.greet()).to.equal("Hola, mundo!");
    // Calling the setGreeting() method using a different account from the owner account
    const [owner, addr1] = accounts;
    await greeter.connect(addr1).setGreeting("Hallo, Erde!");
    expect(await greeter.greet()).to.equal("Hallo, Erde!");
  });
});
