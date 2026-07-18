import Modules, { ModulesType } from "../models/modules.model";
import { normalizeDriveFileId } from "./drive.utils";

const getModules = async (): Promise<ModulesType[]> => {
  const modules = await Modules.find({});
  return modules;
};

const getModulesByRepoId = async (
  repoId: string,
): Promise<ModulesType[] | Record<string, never>> => {
  const modules = await Modules.find({ repoId: repoId });
  return modules;
};

const getAmount = async (slug: string) => {
  const result = await Modules.findOne(
    { slug: slug },
    { softCopyPrice: 1, hardCopyPrice: 1 },
  );
  return {
    softCopyPrice: result?.softCopyPrice,
    hardCopyPrice: result?.hardCopyPrice,
  };
};

const getFileId = async (productId: string) => {
  const result = await Modules.findOne({ slug: productId });
  return normalizeDriveFileId(result?.fileId);
};

export { getModules, getModulesByRepoId, getAmount, getFileId };
