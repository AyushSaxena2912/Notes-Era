import { NextFunction, Request, Response } from "express";

const upstreamBase = () =>
  (
    process.env.FREE_NOTES_UPSTREAM ||
    "https://notesera-back-end.onrender.com"
  ).replace(/\/$/, "");

const proxyGet = async (path: string) => {
  const url = `${upstreamBase()}${path}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upstream ${response.status}: ${text.slice(0, 200)}`);
  }
  return response.json();
};

const handleProxy = async (
  req: Request,
  res: Response,
  next: NextFunction,
  path: string,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        isErr: true,
        status: "error",
        message: "Authentication required.",
      });
    }
    const data = await proxyGet(path);
    return res.json(data);
  } catch (err) {
    console.error(err);
    next(err);
    return res.status(502).json({
      isErr: true,
      status: "error",
      message: "Could not load free notes data.",
    });
  }
};

const getColleges = (req: Request, res: Response, next: NextFunction) =>
  handleProxy(req, res, next, "/data/all/colleges");

const getYears = (req: Request, res: Response, next: NextFunction) =>
  handleProxy(req, res, next, `/data/all/${req.params.college}/years`);

const getTypes = (req: Request, res: Response, next: NextFunction) =>
  handleProxy(
    req,
    res,
    next,
    `/data/all/${req.params.college}/${req.params.year}/types`,
  );

const getSubjects = (req: Request, res: Response, next: NextFunction) =>
  handleProxy(
    req,
    res,
    next,
    `/data/all/${req.params.college}/${req.params.year}/${req.params.type}/subjects`,
  );

const getLinks = (req: Request, res: Response, next: NextFunction) =>
  handleProxy(
    req,
    res,
    next,
    `/data/all/${req.params.college}/${req.params.year}/${req.params.type}/${req.params.subject}/links`,
  );

export { getColleges, getYears, getTypes, getSubjects, getLinks };
