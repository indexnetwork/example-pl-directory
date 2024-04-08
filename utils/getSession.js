
import { Cacao, SiweMessage } from '@didtools/cacao'
import { randomString, randomBytes } from '@stablelib/random';
import { DIDSession, createDIDKey, createDIDCacao } from 'did-session';


export const getSession = async (wallet) => {

  const address = wallet.address

  // DID Key Generation: Develop a DID key using a random seed
  const keySeed = randomBytes(32);
  const didKey = await createDIDKey(keySeed);

  const now = new Date();
  const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // Create a SIWE message for authentication.
  const siweMessage = new SiweMessage({
      domain: "index.network",
      address: address,
      statement: "Give this application access to some of your data on Ceramic",
      uri: didKey.id,
      version: "1",
      chainId: "1",
      nonce: randomString(10),
      issuedAt: now.toISOString(),
      expirationTime: threeMonthsLater.toISOString(),
      resources: ["ceramic://*"],
  })

  // Sign the SIWE message with the wallet's private key.
  const signature = await wallet.signMessage(siweMessage.toMessage())

  siweMessage.signature = signature

  // Create a new session using the CACAO, key seed, and DID.
  const cacao = Cacao.fromSiweMessage(siweMessage);
  const did = await createDIDCacao(didKey, cacao);
  const newSession = new DIDSession({ cacao, keySeed, did });

  // Here is our authorization token.
  return newSession

}
