import React, {useEffect, useState} from 'react';
import { Table, Thead, Tbody, Tr, Td, Th } from '@strapi/design-system/Table';
import { Box, Checkbox, BaseCheckbox, Typography, Flex, IconButton, Alert, Loader, Link } from '@strapi/design-system';
import { Pencil, Trash, Plus } from '@strapi/icons';
import axios from "../utils/axiosInstance";
import {ConfirmationDialog} from "./ConfirmationDialog";
import BulkActions from "./BulkActions";
import {useIntl} from "react-intl";
import getTrad from "../utils/getTrad";

const COL_COUNT = 5;
const Repo = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [alert, setAlert] = useState(undefined)
  const [deletingRepo, setDeletingRepo] = useState(undefined);
  const {formatMessage} = useIntl()

  const allChecked = selectedRepos.length === repos.length;
  const isIndeterminate = selectedRepos.length > 0 && !allChecked;

  const showAlert = (alert) => {
    setAlert(alert);

    setTimeout(() => {
      setAlert(undefined);
    }, 5000)
  }

  // const updateRepoAfterProjectCreated = (repo, project) => {
  //   const updateRepos = (repos) => {
  //     return repos.map((item) => {
  //       return item.id !== repo.id ? item : {
  //         ...item,
  //         projectId: project.id
  //       };
  //     })
  //   }
  //
  //   setRepos(updateRepos);
  // }

  const updateRepoAfterProjectCreated = (repo, project) => {
    setRepos((repos) =>
      repos.map((item) =>
        item.id !== repo.id ? item : { ...item, projectId: project.id }
      )
    );
  };

  const updateRepoAfterProjectDeleted = (repo) => {
    setRepos((repos) =>
      repos.map((item) =>
        item.id !== repo.id ? item : { ...item, projectId: null }
      )
    );
  };

  const createProject = async (repo) => {
    axios.post('/github-projects/project', repo)
      .then((response) => {
        updateRepoAfterProjectCreated(repo, response.data);

        showAlert({
          title: "Project created",
          text: `Successfully created ${response.data.title}`,
          variant: "success"
        })
      })
      .catch((error) => {
        showAlert({
          title: "Error",
          text: `You haven't permission for project creation`,
          variant: "danger"
        })

        console.error(error.toString())
      });
  }

  const createAllProjects = (reposToBecomeProjects) => {
    axios.post("/github-projects/projects", {
      repos: reposToBecomeProjects
    })
      .then((projects) => {
        projects.data.forEach((project)=> {
          const repo = reposToBecomeProjects.find((repo) => project.repositoryId == repo.id);

          updateRepoAfterProjectCreated(repo, project);
        });

        showAlert({
          title: "All Projects created",
          text: `Successfully created`,
          variant: "success"
        })
      })
      .catch((error) => {
        showAlert({
          title: "Error",
          text: `You haven't permission for projects creation`,
          variant: "danger"
        })

        console.error(error.toString())
      })
      .finally(() => setSelectedRepos([]));
  }

  const deleteProject = (repo) => {
    axios.delete(`/github-projects/project/${repo.projectId}`)
      .then((response) => {
        updateRepoAfterProjectDeleted(repo);

        showAlert({
          title: "Project deleted",
          text: `Successfully deleted ${response.data.title}`,
          variant: "warning"
        })
      })
      .catch((error) => {
        showAlert({
          title: "Error",
          text: `You haven't permission for project deletion`,
          variant: "danger"
        })

        console.error(error.toString())
      });
  }

  const deleteAllProjects = (reposToDelete) => {
    axios.post("/github-projects/delete-projects", {
      repos: reposToDelete
    })
      .then((projects) => {
        projects.data.forEach((project) => {
          const repo = reposToDelete.find((repo) => project.repositoryId == repo.id);

          updateRepoAfterProjectDeleted(repo);
        });

        showAlert({
          title: "All Projects deleted",
          text: `Successfully deleted`,
          variant: "success"
        })
      })
      .catch((error) => {
        showAlert({
          title: "Error",
          text: `You haven't permission for projects deletion`,
          variant: "danger"
        })

        console.error(error.toString())
      })
      .finally(() => setSelectedRepos([]));
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const result = await axios.get('/github-projects/repos');
        setRepos(result.data);
      } catch (error) {
        showAlert({
          title: "Error fetching repositories",
          text: error.toString(),
          variant: "danger"
        })
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Box marginLeft={'auto'} marginRight='auto'><Loader>Loading content...</Loader></Box>

  return (
    <Box padding={8} background="neutral100" width="100%">
      {alert && (
        <div style={{position: "absolute", top: 0, left: "15%", zIndex: 10}}>
          <Alert closeLabel="Close" title={alert.title} variant={alert.variant}>
            {alert.text}
          </Alert>
        </div>
      )}
      {selectedRepos.length > 0 &&  <BulkActions
        selectedRepos={selectedRepos.map((repoId) => repos.find((repo) => repo.id == repoId))}
        createAction={createAllProjects}
        deleteAction={deleteAllProjects}
      />}
      <Table colCount={COL_COUNT} rowCount={repos.length}>
        <Thead>
          <Tr>
            <Th>
              <BaseCheckbox
                aria-label="Select all entries"
                indeterminate={isIndeterminate}
                onValueChange={value => value ? setSelectedRepos(repos.map(repo => repo.id)) : setSelectedRepos([])}
                value={allChecked} />
            </Th>
            <Th>
              <Typography variant="sigma">{
                formatMessage({
                  id: getTrad("repo.name"),
                  defaultMessage: "Name"
                })
              }</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">{
                formatMessage({
                  id: getTrad("repo.description"),
                  defaultMessage: "Description"
                })
              }</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">{
                formatMessage({
                  id: getTrad("repo.url"),
                  defaultMessage: "Url"
                })
              }</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">{
                formatMessage({
                  id: getTrad("repo.actions"),
                  defaultMessage: "Actions"
                })
              }</Typography>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {repos.map((repo) => {
            const {id, name, shortDescription, url, projectId} = repo;

            return (
              <Tr key={id}>
                <Td>
                  <Checkbox aria-label={`Select ${id}`} value={selectedRepos.includes(id)} onValueChange={(value) => {
                    const newSelectedRepose = value
                      ? [...selectedRepos, id] : selectedRepos.filter((item) => item !== id)
                    setSelectedRepos(newSelectedRepose);
                  }} />
                </Td>
                <Td>
                  <Typography textColor="neutral800">{name}</Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">{shortDescription}</Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">
                    <Link href={url} isExternal>{url}</Link>
                  </Typography>
                </Td>
                <Td>
                  {
                    projectId ?
                      (
                        <Flex>
                          <Link to={`/content-manager/collectionType/plugin::github-projects.project/${projectId}`}>
                            <IconButton onClick={() => console.log('edit')} label="Edit" borderWidth={0} icon={<Pencil />} />
                          </Link>
                          <Box paddingLeft={1}>
                            <IconButton onClick={() => setDeletingRepo(repo)} label="Delete" borderWidth={0} icon={<Trash />} />
                          </Box>
                        </Flex>
                      ) : (
                        <Box paddingLeft={1}>
                          <IconButton onClick={() => createProject(repo)} label="Add" borderWidth={0} icon={<Plus />} />
                        </Box>
                      )
                  }
                </Td>
              </Tr>
            )
        })}
        </Tbody>
      </Table>
      {deletingRepo && (
        <ConfirmationDialog
          visible={!!deletingRepo}
          message='Are you sure you want to delete this?'
          onClose={() => setDeletingRepo(undefined)}
          onConfirm={() => deleteProject(deletingRepo)}
        />
      )}
    </Box>
  )
}

export default Repo;
