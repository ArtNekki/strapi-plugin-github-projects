'use strict';
// import { request } from "@octokit/request";
const { request } = require("@octokit/request");
const axios = require("axios");
const md = require("markdown-it")();

module.exports = ({ strapi }) => ({
  getProjectForRepo: async (repo) => {
    const {id} = repo;
    const matchingProjects = await strapi.entityService
      .findMany("plugin::github-projects.project", {
        filters: {
          repositoryId: id
        }
      });

    // console.log('matchingProjects', matchingProjects[0]);

    if (matchingProjects.length == 1) return matchingProjects[0].id;
    return null;
  },

   getPublicRepos: async () => {
    const result = await request("GET /user/repos", {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      type: "public",
    });

    //https://raw.githubusercontent.com/ArtNekki/strapi-experiments/main/README.md
    //
     return Promise.all(result.data.map(async (project) => {
      const {id, name, description, html_url, owner, default_branch} = project;
      const readmeUrl = `https://raw.githubusercontent.com/${owner.login}/${name}/${default_branch}/README.md`;
      // console.log('readmeUrl', readmeUrl);

      let longDescription = '';

      try {
        const response = await axios.get(readmeUrl);
        longDescription = md.render(response.data).replaceAll("\n", "<br />");
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.error(`README.md not found for project: ${name}`);
          longDescription = 'README.md not found';
        } else {
          console.error(`Error fetching README.md for project: ${name}`, error);
          longDescription = 'Error fetching README.md';
        }
      }

      const repo = {
        id,
        name,
        shortDescription: description,
        url: html_url, longDescription
      };

      const relatedProjectId = await strapi
        .plugin("github-projects")
        .service("getReposService")
        .getProjectForRepo(repo);

      return {
        ...repo,
        projectId: relatedProjectId
      }
    }));
  },
});
