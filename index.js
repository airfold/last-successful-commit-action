const core = require("@actions/core");
const github = require("@actions/github");

try {
  const octokit = github.getOctokit(core.getInput("github_token"));
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
  const branch = core.getInput("branch") || process.env.GITHUB_BASE_REF || process.env.GITHUB_REF_NAME || 'main'
  const params = {
    owner,
    repo,
    workflow_id: core.getInput("workflow_id"),
    status: "success",
    branch,
  }
  const event = core.getInput("workflow_event")
  if (event) {
    params.event = event
  }
  octokit.rest.actions
    .listWorkflowRuns(params)
    .then((res) => {
      const lastSuccessCommitHash =
        res.data.workflow_runs.length > 0
          ? res.data.workflow_runs[0].head_commit.id
          : "";
      core.setOutput("commit_hash", lastSuccessCommitHash);
    })
    .catch((e) => {
      core.setFailed(e.message);
    });
} catch (e) {
  core.setFailed(e.message);
}
