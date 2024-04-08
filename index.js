import 'dotenv/config'
import fs from 'fs';
import { Wallet, JsonRpcProvider } from 'ethers';
import IndexClient from "@indexnetwork/sdk";
import { getAllTeams } from './utils/getAllTeams.js';
import { createTeam } from './utils/getComposeClient.js';

// Function to load teams from cache or fetch new ones
const loadTeams = async () => {
  const fromCache = true; // Toggle this to switch between cache and fetching new data, to not hurt PL directory server.
  if (fromCache) {
    return JSON.parse(fs.readFileSync("temp/teams.json"));
  } else {
    const teams = await getAllTeams();
    fs.writeFileSync("temp/teams.json", JSON.stringify(teams));
    return teams;
  }
};


const go = async () => {
  try {
    console.log('Starting process...');

    const walletPrivateKey = process.env.WALLET_PRIVATE_KEY;
    const rpcEndpoint = process.env.LIT_RPC_ENDPOINT;
    if (!walletPrivateKey || !rpcEndpoint) {
      throw new Error('Environment variables for wallet or RPC endpoint are missing.');
    }

    const wallet = new Wallet(walletPrivateKey, new JsonRpcProvider(rpcEndpoint));
    console.log('Wallet initialized.');

    const indexClient = new IndexClient({
      privateKey: wallet.privateKey,
      domain: "index.network",
      network: "ethereum",
    });

    console.log('Authenticating index client...');
    await indexClient.authenticate();
    console.log('Index client authenticated.');

    console.log('Creating index...');
    const indexId = await indexClient.createIndex("PL Ecosystem Teams");
    console.log(`Index created with ID: ${indexId}`);

    console.log('Loading teams...');
    const teams = await loadTeams(); // This function needs to be defined elsewhere
    console.log(`Loaded ${teams.length} teams.`);

    let createdTeams = [];
    for (const t of teams) {
      let createdTeam;
      try {
        createdTeam = await createTeam(wallet, t); // Assuming createTeam is defined elsewhere
        console.log(`Team created: ${t.name}`);
      } catch (err) {
        console.error('Error creating team:', err);
        continue; // Skip this team and proceed with the next one
      }
      createdTeams.push(createdTeam);
    }

    console.log('Adding teams to index...');
    for (const t of createdTeams) {
      try {
        await indexClient.addItemToIndex(indexId, t);
        console.log(`Team added to index: ${t.id}`);
      } catch (err) {
        console.error('Error adding team to index:', err);
      }
    }

    /* Uncomment this block if you want to query the index
    console.log('Querying index...');
    const queryResponse = await indexClient.query({
      query: "Which team is building a decentralized semantic index?",
      indexes: [indexId],
    });
    console.log('Query response:', queryResponse);
    */

  } catch (error) {
    console.error('Exception in process:', error);
  }
};


go()
