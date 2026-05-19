import { Octokit } from '@octokit/rest';
import { appConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { IntegrationError } from '../utils/errors.js';

let _octokit = null;

function getOctokit() {
  if (!appConfig.github.enabled) return null;
  if (!_octokit) {
    _octokit = new Octokit({ auth: appConfig.github.token });
  }
  return _octokit;
}

export const github = {
  async inviteToOrg(username) {
    const octokit = getOctokit();
    if (!octokit) return { skipped: true, reason: 'GitHub not configured' };

    try {
      await octokit.orgs.createInvitation({
        org: appConfig.github.org,
        invitee_id: await getUserId(octokit, username),
        role: 'direct_member',
      });
      logger.info('GitHub org invitation sent', { username, org: appConfig.github.org });
      return { success: true, username, org: appConfig.github.org };
    } catch (err) {
      throw new IntegrationError('GitHub', `Failed to invite ${username}: ${err.message}`, { username });
    }
  },

  async addToTeams(username, teamSlugs = []) {
    const octokit = getOctokit();
    if (!octokit || teamSlugs.length === 0) return { skipped: true };

    const results = [];
    for (const teamSlug of teamSlugs) {
      try {
        await octokit.teams.addOrUpdateMembershipForUserInOrg({
          org: appConfig.github.org,
          team_slug: teamSlug,
          username,
        });
        results.push({ teamSlug, success: true });
      } catch (err) {
        logger.warn('Failed to add to GitHub team', { username, teamSlug, error: err.message });
        results.push({ teamSlug, success: false, error: err.message });
      }
    }
    return { results };
  },

  async assignRepos(username, repos = []) {
    const octokit = getOctokit();
    if (!octokit || repos.length === 0) return { skipped: true };

    const results = [];
    for (const repo of repos) {
      try {
        await octokit.repos.addCollaborator({
          owner: appConfig.github.org,
          repo,
          username,
          permission: 'push',
        });
        results.push({ repo, success: true });
      } catch (err) {
        logger.warn('Failed to add GitHub collaborator', { username, repo, error: err.message });
        results.push({ repo, success: false, error: err.message });
      }
    }
    return { results };
  },

  async revokeAccess(username) {
    const octokit = getOctokit();
    if (!octokit) return { skipped: true, reason: 'GitHub not configured' };

    try {
      await octokit.orgs.removeMember({ org: appConfig.github.org, username });
      logger.info('GitHub access revoked', { username, org: appConfig.github.org });
      return { success: true, username };
    } catch (err) {
      throw new IntegrationError('GitHub', `Failed to revoke access for ${username}: ${err.message}`, { username });
    }
  },
};

async function getUserId(octokit, username) {
  const { data } = await octokit.users.getByUsername({ username });
  return data.id;
}
