import {Address} from "locklift";
import {checkIsContractDeployed} from "./utils";
import {EverWalletAccount} from "everscale-standalone-client/nodejs";
import BigNumber from "bignumber.js";

async function main() {
  const signer = (await locklift.keystore.getSigner("0"))!;
  // The same EverWallet we deployed in script 0, because they are from one pubkey
  const diceOwnerWallet = await EverWalletAccount.fromPubkey({publicKey: signer.publicKey, workchain: 0});
  // We need to add our EverWallet as account to provider
  // to use .send({from: 'address'})
  await locklift.factory.accounts.storage.addAccount(diceOwnerWallet);

  console.log('diceOwnerWallet', diceOwnerWallet.address.toString());
  const TokenRootAddress = new Address("0:cb5f57378e82174ed95502b01df16235d8d94e974ce24a4dc8a10143f23c0c44");

  const { contract: anyOwner } = await locklift.factory.deployContract({
    contract: "AnyOwner",
    publicKey: signer.publicKey,
    initParams: {
      tokenRoot_: TokenRootAddress
    },
    constructorParams: {},
    value: locklift.utils.toNano(2)
  });

  const TokenRoot = locklift.factory.getDeployedContract('TokenRootUpgradeable', TokenRootAddress);

  console.log('anyOwner deployed', anyOwner.address.toString())
  await TokenRoot.methods.transferOwnership({
    newOwner: anyOwner.address,
    remainingGasTo: diceOwnerWallet.address,
    callbacks: []
  }).send({
    from: diceOwnerWallet.address,
    amount: locklift.utils.toNano(2)
  })
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
