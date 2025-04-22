import express from "express";
import { getProperties } from "../controllers/propertyControllers";

const router = express.Router();

router.get("/", getProperties);

export default router;
