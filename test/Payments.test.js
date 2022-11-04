const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Payments", function () {
  let acc1;
  let acc2;
  let payments;
  beforeEach(async function () {
    [acc1, acc2] = await ethers.getSigners();

    const PaymentsContract = await ethers.getContractFactory("Payments", acc1);
    payments = await PaymentsContract.deploy(); //Мы ждем пока транзакция будет отправлена
    await payments.deployed(); //Мы ждем пока она будет выполнена
  });

  async function sendMoney(sender) {
    const amount = 100;
    const transactionData = {
      to: payments.address,
      value: amount,
    };

    const transaction = await sender.sendTransaction(transactionData);
    await transaction.wait();
    return [transaction, amount];
  }

  it("should be deployed", async function () {
    expect(payments.address).to.be.properAddress;
  });

  it("should have 0 ethers by default", async function () {
    const balance = await payments.currentBalance();
    expect(balance).to.eq(0);
  });

  // Отправлять средства с помощью транзакций
  it("should possible to send the funds", async function () {
    const message = "hello from hardhat";
    const amount = 100;

    const transaction = await payments.connect(acc2).pay("hello from hardhat", {
      value: 100,
    });

    await expect(() => transaction).to.changeEtherBalances(
      [acc2, payments],
      [-100, 100]
    );
    await transaction.wait();

    const newPayment = await payments.getPayment(acc2.address, 0);
    expect(newPayment.message).to.eq(message);
    expect(newPayment.amount).to.eq(amount);
    expect(newPayment.from).to.eq(acc2.address);
  });

  it("should allow to send money", async function () {
    const [sendMoneyTransaction, amount] = await sendMoney(acc2);
    await expect(() => sendMoneyTransaction).to.changeEtherBalance(
      payments,
      amount
    );

    const timestamp = (
      await ethers.provider.getBlock(sendMoneyTransaction.blockNumber)
    ).timestamp;

    await expect(sendMoneyTransaction)
      .to.emit(payments, "Paid")
      .withArgs(acc2.address, amount, timestamp);
  });

  it("should allow owner to withdraw funds", async function () {
    const [_, amount] = await sendMoney(acc2);

    const transaction = await payments.withdraw(acc1.address);

    await expect(() => transaction).to.changeEtherBalances(
      [payments, acc1],
      [-amount, amount]
    );
  });

  it("should not allow other account to withdraw funds", async function () {
    await sendMoney(acc2);

    await expect(
      payments.connect(acc2).withdraw(acc2.address)
    ).to.be.revertedWith("You are not an owner!");
  });
});
