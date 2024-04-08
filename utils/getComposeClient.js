import { ComposeClient } from '@composedb/client';
import { definition } from '../temp/merged-runtime.js';
import { getSession } from './getSession.js';

const compose = new ComposeClient({ ceramic: process.env.CERAMIC_URL, definition });

// Function to create a team
export const createTeam = async (wallet, team) => {
  try {
    if(!compose.did || !compose.did.authenticated){
      const session = await getSession(wallet);
      compose.setDID(session.did);
    }
    const { data, errors } = await compose.executeQuery(`
      mutation CreateTeam($input: CreateTeamInput!) {
        createTeam(input: $input) {
          document {
            id
          }
        }
      }`, { input: { content: team } });

    if(data && data.createTeam && data.createTeam.document){
      return data.createTeam.document.id;
    }
    if (errors) {
      console.error('Error creating team:', errors[0]);
      return null; // Return null or appropriate value in case of error
    }
  } catch (error) {
    console.error('Exception in createTeam:', error);
    return null; // Ensure function returns even on exception
  }
};
