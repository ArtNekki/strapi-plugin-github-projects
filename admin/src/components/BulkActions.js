import React from 'react';
import {Box, Button, Flex, Typography} from "@strapi/design-system";
const BulkActions = ({selectedRepos, createAction, deleteAction}) => {
  const reposWithoutProject = selectedRepos.filter((repo) => !repo.projectId);
  const reposWithProject = selectedRepos.filter((repo) => repo.projectId);
  const projectsToBeCreated = reposWithoutProject.length
  const projectsToBeDeleted = reposWithProject.length

  return (
    <Box paddingBottom={4}>
      <Flex>
        <Typography>
          {`You have ${projectsToBeCreated} projects to generate and ${projectsToBeDeleted} to delete`}
        </Typography>
        {(projectsToBeCreated > 0) && (
          <Box marginLeft={2}>
            <Button
              size="S"
              variant="success-light"
              onClick={() => createAction(reposWithoutProject)}
            >
              {`Create ${projectsToBeCreated} project(s)`}
            </Button>
          </Box>
        )}
        {
          (projectsToBeDeleted > 0) && (
            <Box marginLeft={2}>
              <Button
                size="S"
                variant="danger-light"
                onClick={() => deleteAction(reposWithProject)}
              >
                {`Delete ${projectsToBeDeleted} project(s)`}
              </Button>
            </Box>
          )
        }
      </Flex>
    </Box>
  )
}

export default BulkActions;

