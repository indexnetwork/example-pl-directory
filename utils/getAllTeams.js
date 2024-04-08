
const transformDataToTeamObject = (data) =>  {
  const { team, members } = data.pageProps;

  // Transform technologies, industryTags, and membershipSources
  const technologies = team.technologies.map(tech => ({
    uid: tech.uid,
    title: tech.title,
    createdAt: tech.createdAt,
    updatedAt: tech.updatedAt,
  }));

  const industryTags = team.industryTags.map(tag => ({
    uid: tag.uid,
    title: tag.title,
    definition: tag.definition || '',
    airtableRecId: tag.airtableRecId || '',
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt,
    industryCategoryUid: tag.industryCategoryUid,
  }));

  const membershipSources = team.membershipSources.map(source => ({
    uid: source.uid,
    title: source.title,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  }));

  // Transform members
  const transformedMembers = members.map(member => ({
    memberId: member.id,
    name: member.name,
    image: member.image,
    githubHandle: member.githubHandle || '',
    discordHandle: member.discordHandle || '',
    telegramHandle: member.telegramHandle || '',
    twitter: member.twitter || '',
    officeHours: member.officeHours || '',
    location: member.location,
    skills: member.skills.map(skill => ({ title: skill.title })),
    teamLead: member.teamLead,
    projectContributions: member.projectContributions.map(pc => ({
      uid: pc.uid || '',
      role: pc.role || '',
      description: pc.description || '',
      currentProject: pc.currentProject || false,
      startDate: pc.startDate || '',
      endDate: pc.endDate || null,
      memberUid: pc.memberUid || '',
      projectUid: pc.projectUid || ''
    })),
    teams: member.teams.map(team => ({
      uid: team.id,
      name: team.name,
      role: team.role,
      teamLead: team.teamLead,
      mainTeam: team.mainTeam,
    })),
    mainTeam: member.mainTeam ? {
      uid: member.mainTeam.id,
      name: member.mainTeam.name,
      role: member.mainTeam.role,
      teamLead: member.mainTeam.teamLead,
      mainTeam: member.mainTeam.mainTeam,
    } : null,
    openToWork: member.openToWork,
    linkedinHandle: member.linkedinHandle || null,
    repositories: [], // Assuming structure; needs details for proper mapping
    preferences: '', // Assuming structure; needs details for proper mapping
  }));

  return {
    teamId: team.id,
    name: team.name,
    logo: team.logo,
    website: team.website,
    twitter: team.twitter,
    shortDescription: team.shortDescription,
    longDescription: team.longDescription,
    technologies,
    fundingStage: team.fundingStage,
    industryTags,
    membershipSources,
    members: transformedMembers,
    contactMethod: team.contactMethod || null,
    linkedinHandle: team.linkedinHandle || null,
  };
}

export const getTeam = async (teamId) => {
  const res = await fetch(`https://directory.plnetwork.io/_next/data/yoMEE54BV2SkIRBb76jyU/teams/${teamId}.json?backLink=%2Fteams`)
  const teamData = await res.json();
  const teamObject = transformDataToTeamObject(teamData);
  return teamObject;
}
export const getAllTeams = async () => {
  const res = await fetch('https://directory.plnetwork.io/_next/data/yoMEE54BV2SkIRBb76jyU/teams.json')
  const allTeams = await res.json();
  const teamList = allTeams.pageProps.teams.map(t => t.id);

  const body = await Promise.all(teamList.map(t => getTeam(t)))
  return body

}
