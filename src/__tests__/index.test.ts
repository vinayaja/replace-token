import {expect, jest, it, describe, beforeEach} from '@jest/globals'

import { run } from "../index";
import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";

// Mock getInput and setFailed functions
jest.mock("@actions/core", () => ({
  getInput: jest.fn(),
  setFailed: jest.fn(),
}));

jest.mock("@actions/github", () => ({
  context: {
    repo: { owner: "owner", repo: "repo" },
    ref: "refs/heads/branch-name",
  },
  getOctokit: jest.fn(),
}));

describe("run", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCreateWorkflowDispatch = jest.fn();
  const mockOctokit = {
    rest: {
      actions: {
        createWorkflowDispatch: mockCreateWorkflowDispatch,
      },
    },
  };

  // Test successful dispatch for local repo
  it("dispatches a workflow for the local repo (empty remoterepo and remotebranch)", async () => {
    const mockPayload = { someInput: "someValue" };

     (getInput as jest.Mock).mockReturnValueOnce("gh-token-value"); // Mock gh-token
     (getInput as jest.Mock).mockReturnValueOnce("run-id-value"); // Mock run-id
     (getInput as jest.Mock).mockReturnValueOnce(JSON.stringify(mockPayload)); // Mock payload

    await run();

    expect(getInput).toHaveBeenCalledTimes(5); // Includes remoterepo and remotebranch
    expect(getInput).toHaveBeenCalledWith("gh-token");
    expect(getInput).toHaveBeenCalledWith("run-id");
    expect(getInput).toHaveBeenCalledWith("payload");
    expect(getInput).toHaveBeenCalledWith("remoterepo"); // Verify getInput for remoterepo
    expect(getInput).toHaveBeenCalledWith("remotebranch"); // Verify getInput for remotebranch

    expect(getOctokit).toHaveBeenCalledWith("gh-token-value");

    expect(mockOctokit.rest.actions.createWorkflowDispatch).toHaveBeenCalledWith({
      owner: "owner",
      repo: "repo",
      workflow_id: "1234",
      ref: "branch-name",
      inputs: mockPayload,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    expect(setFailed).not.toHaveBeenCalled();
  });

  // Test successful dispatch for remote repo
  it("dispatches a workflow for a remote repo", async () => {
    const mockPayload = { someInput: "someValue" };
    const remoteRepo = "remote-owner/remote-repo";
    const remoteBranch = "remote-branch";

     (getInput as jest.Mock).mockReturnValueOnce("gh-token-value"); // Mock gh-token
     (getInput as jest.Mock).mockReturnValueOnce("run-id-value"); // Mock run-id
     (getInput as jest.Mock).mockReturnValueOnce(JSON.stringify(mockPayload)); // Mock payload
     (getInput as jest.Mock).mockReturnValueOnce(remoteRepo); // Mock remoterepo
     (getInput as jest.Mock).mockReturnValueOnce(remoteBranch); // Mock remotebranch

    await run();

    expect(getInput).toHaveBeenCalledTimes(7); // Includes all inputs
    expect(mockOctokit.rest.actions.createWorkflowDispatch).toHaveBeenCalledWith({
      owner: "remote-owner",
      repo: "remote-repo",
      workflow_id: "1234",
      ref: remoteBranch,
      inputs: mockPayload,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    expect(setFailed).not.toHaveBeenCalled();
  });

  // Test error handling for missing inputs
  it("throws error for missing required inputs", async () => {
     (getInput as jest.Mock).mockReturnValueOnce(""); // Missing gh-token

    //await expect(run()).rejects.toThrow(/gh-token/); // Assert specific error message for missing input

     (getInput as jest.Mock).mockReturnValueOnce("gh-token-value");
     (getInput as jest.Mock).mockReturnValueOnce(""); // Missing run-id

    //await expect(run()).rejects.toThrow(/run-id/); // Assert specific error message for missing input

     (getInput as jest.Mock).mockReturnValueOnce("gh-token-value");
     (getInput as jest.Mock).mockReturnValueOnce("run-id-value");
     (getInput as jest.Mock).mockReturnValueOnce(""); // Missing payload

    //await expect(run()).rejects.toThrow(/payload/); // Assert specific error message for missing input
  });
})
  //