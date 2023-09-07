import { Address, getRandomNonce, toNano, WalletTypes } from "locklift";
import { EverWalletAccount } from "everscale-standalone-client/nodejs";

const TOKEN_ROOT_ADDRESS = "0:0000000000000000000000000000000000000000000000000000000000000000";

async function main() {
  const signer = (await locklift.keystore.getSigner("0"))!;
  const signerWallet = await EverWalletAccount.fromPubkey({ publicKey: signer.publicKey });

  const { contract: setState, tx } = await locklift.factory.deployContract({
    contract: "SetState",
    publicKey: signer.publicKey,
    initParams: {},
    constructorParams: {
      _gasTo: signerWallet.address,
    },
    value: toNano(1),
  });

  console.log(`SetState deployed at: ${setState.address.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
