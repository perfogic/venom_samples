import { Address, toNano, WalletTypes } from "locklift";
import { EverWalletAccount } from "everscale-standalone-client/nodejs";

async function main() {
  const signer = (await locklift.keystore.getSigner("0"))!;
  const signerWallet = await EverWalletAccount.fromPubkey({ publicKey: signer.publicKey, workchain: 0 });
  const { contract: tokenRoot, tx } = await locklift.factory.deployContract({
    contract: "TokenRoot",
    publicKey: signer.publicKey,
    initParams: {
      randomNonce_: 0,
      name_: "My First VENOM Token",
      symbol_: "MFVT",
      decimals_: 9,
      rootOwner_: signerWallet.address,
      walletCode_: (await locklift.factory.getContractArtifacts("TokenWallet")).code,
      deployer_: new Address("0:0000000000000000000000000000000000000000000000000000000000000000"),
    },
    constructorParams: {
      initialSupplyTo: signerWallet.address,
      initialSupply: 100000000000,
      deployWalletValue: 100000000,
      mintDisabled: true,
      burnByRootDisabled: true,
      burnPaused: false,
      remainingGasTo: signerWallet.address,
    },
    value: locklift.utils.toNano(2),
  });

  console.log(`TokenRoot deployed at: ${tokenRoot.address.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
