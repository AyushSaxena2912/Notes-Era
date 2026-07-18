import { NextFunction, Request, Response } from "express";
import { ModulesType } from "src/models/modules.model";
import { ReposType } from "src/models/repos.model";
import {
  getModules,
  getModulesByRepoId as getModulesById,
} from "../utils/modules.utils";
import { getRepoById, getRepos } from "../utils/repos.utils";
import { bindModulesToRepo, bindModulesToRepos } from "../utils/utils";
import { stripSensitiveModuleFields } from "../utils/sanitize.utils";

const getAllModules = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const repos = await getRepos();
    const modules = await getModules();
    const bindedModules = bindModulesToRepos(repos, modules);
    res.json({
      isErr: false,
      status: "success",
      body: stripSensitiveModuleFields(bindedModules),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      isErr: true,
      status: "error",
      message: "Internal error occured while getting modules.",
    });
    next(err);
  }
};

const getModulesByRepoId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { repoId } = req.params;
    const modules = await getModulesById(repoId);
    const repo = await getRepoById(repoId);
    if (repo) {
      const bindedModules = bindModulesToRepo(
        repo as ReposType,
        modules as ModulesType[],
      );
      res.json({
        isErr: false,
        status: "success",
        body: { data: stripSensitiveModuleFields(bindedModules) },
      });
    } else {
      res.json({
        isErr: false,
        status: "failed",
        body: {},
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      isErr: true,
      status: "error",
      message: "Internal error occured while getting modules.",
    });
    next(err);
  }
};

export { getAllModules, getModulesByRepoId };
