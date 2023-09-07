import { expect } from "chai";
import { Address, Contract, Giver, Signer, WalletTypes, toNano } from "locklift";
import { FactorySource, factorySource } from "../build/factorySource";
import { Account, EverWalletAccount } from "everscale-standalone-client/nodejs";

let giver: Giver;
let signer: Signer;
let alice: Account;
let bob: Account;
let learnTvmContract: Contract<FactorySource["LearnTvm"]>;

const ZERO_ADDRESS = "0:0000000000000000000000000000000000000000000000000000000000000000";

describe("Test LearnTvm Contract", async function () {
  before(async () => {
    giver = locklift.giver;
    signer = (await locklift.keystore.getSigner("0"))!;
    const signerWallet = await EverWalletAccount.fromPubkey({
      publicKey: signer.publicKey,
    });

    await giver.sendTo(signerWallet.address, toNano(1));

    const { account: accountAlice } = await locklift.factory.accounts.addNewAccount({
      type: WalletTypes.EverWallet,
      value: toNano(0),
      publicKey: signer.publicKey,
      nonce: (new Date().getTime() + 1) % 4294967296,
    });

    alice = accountAlice;

    const { account: accountBob } = await locklift.factory.accounts.addNewAccount({
      type: WalletTypes.EverWallet,
      value: toNano(0),
      publicKey: signer.publicKey,
      nonce: (new Date().getTime() + 2) % 4294967296,
    });

    bob = accountBob;

    // Transfer money for signer
    await giver.sendTo(accountAlice.address, toNano(5));
  });

  xit("Check signer address", async () => {
    console.log("Alice address: ", alice.address);
    console.log(await locklift.provider.getBalance(alice.address).then(res => Number(res)));

    console.log("Bob address: ", bob.address);
    console.log(await locklift.provider.getBalance(bob.address).then(res => Number(res)));
  });

  describe("Deploy LearnTvm contract", async () => {
    before(async () => {
      const LearnTvm = locklift.factory.getContractArtifacts("LearnTvm");

      const { address: learnTvmAddress, stateInit: learnTvmStateInit } = await locklift.provider.getStateInit(
        LearnTvm.abi,
        {
          tvc: LearnTvm.tvc,
          initParams: {
            owner_: alice.address,
            timestamp_: new Date().getTime(),
          },
        },
      );

      learnTvmContract = new locklift.provider.Contract(factorySource["LearnTvm"], learnTvmAddress);

      await locklift.tracing.trace(
        learnTvmContract.methods.constructor({}).send({
          from: alice.address,
          amount: toNano(2),
          stateInit: learnTvmStateInit,
        }),
      );
    });

    xit("Log learnTvm deployed", async () => {
      console.log(learnTvmContract.address);
    });

    it("Transfer with accept", async () => {
      await learnTvmContract.methods
        .transferWithoutAccept({
          _to: bob.address,
          _val: toNano(1),
        })
        .send({
          from: alice.address,
          amount: toNano(1.5),
        });

      console.log("Alice address: ", alice.address);
      console.log(await locklift.provider.getBalance(alice.address).then(res => Number(res)));

      console.log("Bob address: ", bob.address);
      console.log(await locklift.provider.getBalance(bob.address).then(res => Number(res)));

      console.log(await locklift.provider.getBalance(learnTvmContract.address).then(res => Number(res)));
    });
  });

  // transferAccept: 1493748000 , gas is paid from contract when use tvm.accept() so balance of contract will lower than below value
  // transferWithoutAccept: 1493859000
});
