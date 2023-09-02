import {Address} from "locklift";
import {EverWalletAccount} from "everscale-standalone-client/nodejs";
import BigNumber from "bignumber.js";
import TokenRootUpgradeable from "../build/TokenRootUpgradeable.abi.json";

async function main() {
    const signer = (await locklift.keystore.getSigner("0"))!;
    // // The same EverWallet we deployed in script 0, because they are from one pubkey
    const diceOwnerWallet = await EverWalletAccount.fromPubkey({publicKey: signer.publicKey, workchain: 0});

    const tokenRootAddress = '0:e21b7b3affdc8f54421be17eea5e7240bc93a7cbb6b39f74eef15294e5e4a883';

    const tokenRootContract = new locklift.provider.Contract(TokenRootUpgradeable, new Address(tokenRootAddress))

    const data = await tokenRootContract.methods.walletOf({ walletOwner: diceOwnerWallet.address, answerId: 0 } as never).call({responsible: true})

    console.log(data)
}

main()
    .then(() => process.exit(0))
    .catch(e => {
        console.log(e);
        process.exit(1);
    });
