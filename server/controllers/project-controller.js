'use strict';

module.exports = ({strapi}) => ({
  create: async (ctx) => {
    const repo = ctx.request.body;

    const newProject = await strapi.plugin('github-projects')
      .service('projectService').create(repo, ctx.state.user.id);

    // const sanitizedProducts = await this.sanitizeOutput(newProject, ctx);
    // console.log('sanitizedProducts', sanitizedProducts);
    // return this.transformResponse(sanitizedProducts);

    return newProject;
  },

  createAll: async (ctx) => {
    const repos = ctx.request.body;

    const createdProjects = strapi
      .plugin("github-projects")
      .service("projectService")
      .createAll(repos, ctx.state.user.id);

    return createdProjects;
  },

  deleteAll: async (ctx) => {
    const repos = ctx.request.body;

    const deletedProjects = await strapi
      .plugin("github-projects")
      .service("projectService")
      .deleteAll(repos);

    return deletedProjects;
  },

  delete: async (ctx) => {
    const {id} = ctx.params;

    const deletedProject = await strapi.plugin('github-projects')
      .service('projectService').delete(id);

    return deletedProject;
  },

  find: async (ctx) => {
    return await strapi.plugin("github-projects")
      .service("projectService").find(ctx.query)
  },

  findOne: async (ctx) => {
    const projectId = ctx.params.id;
    console.log('projectId', projectId)

    return await strapi.plugin("github-projects")
      .service("projectService").findOne(projectId, ctx.query);
  }
})
