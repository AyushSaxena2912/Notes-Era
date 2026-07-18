import { NextFunction, Request, Response } from "express";
import { addFileId, createUser, findUser } from "../utils/purchase.utils.js";
import { getData, getFiles, getSubjects } from "../utils/premiums.utils.js";
import { addPermission } from "../utils/drive.utils.js";
import { stripSensitiveModuleFields } from "../utils/sanitize.utils";

const getPremium = async (_: Request, res: Response) => {
  res.status(200).json({
    isErr: false,
    message: "Hi",
    status: "success",
  });
};

const handleGetData = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getData();
    res.json({
      isErr: false,
      body: {
        data: stripSensitiveModuleFields(data),
      },
      status: "success",
    });
  } catch (err) {
    console.error("Error occured in handleGetData.");
    res.status(500).json({
      isErr: true,
      message: "Internal Error occured getting data.",
      status: "error",
    });
    next(err);
  }
};

const handleAddUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, fileId } = req.body;
  if (!email || !fileId) {
    res.json({
      isErr: true,
      message: "Email or FileId can not be null or undefined",
      status: "error",
    });
    return;
  }

  try {
    await addPermission(email, fileId);
    res.status(200).json({
      isErr: false,
      message: `User ${email} added successfully.`,
      status: "success",
    });
  } catch (err) {
    console.error("Error occured in handleAddUser.");
    res.status(500).json({
      isErr: true,
      message: "Internal Error occured while adding user",
      status: "error",
    });
    next(err);
  }
  try {
    const user = await findUser(email);
    if (!user) {
      await createUser(email, fileId);
    } else {
      await addFileId(email, fileId);
    }
  } catch (err) {
    console.error("Error occured in handleAddUser.");
    next(err);
  }
};

const handleGetSubjects = async (
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getSubjects();

    res.status(200).json({
      isErr: false,
      body: {
        structure: result,
      },
      status: "success",
    });
  } catch (err) {
    console.error("Error Occured in handleGetStructure.");
    res.status(500).json({
      isErr: true,
      staus: "error",
      message: "Internal Error occured while getting structure.",
    });
    next(err);
  }
};

const handleGetFiles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { year, programme, branch, subject } = req.query;
    if (!year || !programme || !branch || !subject) {
      res.status(400).json({
        isErr: true,
        message:
          "year, programme, branch and subject can not be null, empty or undefined.",
        status: "error",
      });
      return;
    }

    const numberedYear = Array.isArray(year) ? +year[0] : +year;
    const stringProgramme = Array.isArray(programme) ? programme[0] : programme;
    const stringBranch = Array.isArray(branch) ? branch[0] : branch;
    const stringSubject = Array.isArray(subject) ? subject[0] : subject;

    const files = await getFiles(
      numberedYear,
      stringProgramme as string,
      stringBranch as string,
      stringSubject as string,
    );

    res.status(200).json({
      isErr: false,
      body: {
        files: stripSensitiveModuleFields(files),
      },
      status: "success",
    });
  } catch (err) {
    console.error("Error occured in handleGetFiles.");
    res.status(500).json({
      isErr: true,
      status: "error",
      message: "Internal Error occured while getting files.",
    });
    next(err);
  }
};

export {
  getPremium,
  handleAddUser,
  handleGetData,
  handleGetFiles,
  handleGetSubjects,
};
