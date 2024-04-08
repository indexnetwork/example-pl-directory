import 'dotenv/config'
import fs from 'fs';
import { Wallet } from '@ethersproject/wallet'
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

    const wallet = Wallet.createRandom(process.env.WALLET_PRIVATE_KEY)

    const teams = await loadTeams(); // Load teams from cache or fetch new ones

    let createdTeams = [];
    for (const t of teams) {
      let createdTeam = await createTeam(wallet, t);
      createdTeams.push(createdTeam)
    }

    const indexClient = new IndexClient({
      privateKey: wallet.privateKey,
      domain: "index.network",
      network: "ethereum",
    });

    await indexClient.authenticate();

    const indexId = await indexClient.createIndex({
      title: "PL Ecosystem Teams",
    });

    for (const t of createdTeams) {
      await indexClient.addIndexItem(indexId, t)
    }

    const queryResponse = await indexClient.query({
      query: "Which team is building a decentralized semantic index?",
      indexes: [indexId],
    });

  } catch (error) {
    console.error('Exception:', error);
  }
};

go()
