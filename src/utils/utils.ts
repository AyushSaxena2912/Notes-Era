import { createHmac } from "crypto";
import jwt from "jsonwebtoken";
import { ModulesType } from "../models/modules.model";
import { ReposType } from "../models/repos.model";

interface PayloadType {
  [key: string]: string | number | boolean | string[] | undefined;
}

const bindModulesToRepo = (repo: ReposType, modules: ModulesType[]) => ({
  ...repo,
  modules: modules.filter((module) => module.repoId === repo.repoId),
});

const bindModulesToRepos = (repos: ReposType[], modules: ModulesType[]) => {
  const reposWithModules = repos.map((repo) =>
    bindModulesToRepo(repo, modules),
  );
  return reposWithModules;
};

const generateHMAC = (
  data: string,
  secret: string = process.env.HMAC_SECRET!,
) => {
  const hmac = createHmac("sha256", secret);
  hmac.update(data);
  return hmac.digest("hex");
};

const generateJWT = (
  payload: PayloadType,
  secret: string = process.env.JWT_SECRET!,
) => {
  return jwt.sign(payload, secret);
};

const verifyJWT = (token: string, secret: string = process.env.JWT_SECRET!) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    console.error(`JWT verification failed; token=${token}.`, err);
    return null;
  }
};

export {
  bindModulesToRepo,
  bindModulesToRepos,
  generateHMAC,
  generateJWT,
  verifyJWT,
};
