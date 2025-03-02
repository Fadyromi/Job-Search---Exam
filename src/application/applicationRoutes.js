import express from 'express';
import { Router } from "express";
import { createApplication } from '../controllers/applicationController.js';

const applicationRouter = Router();

// Application routes
applicationRouter.post('/create', createApplication);

export default applicationRouter;