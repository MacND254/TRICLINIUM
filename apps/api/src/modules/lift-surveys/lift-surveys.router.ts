import { Router } from 'express';
import { LiftSurveysController } from './lift-surveys.controller';
import { authenticate } from '../../middleware/auth';

export const liftSurveysRouter = Router();

// ================= ADMIN LIFT SURVEY ROUTES =================
liftSurveysRouter.get(
  '/admin/lift-surveys',
  authenticate,
  LiftSurveysController.getSurveys
);

liftSurveysRouter.get(
  '/admin/lift-surveys/:id',
  authenticate,
  LiftSurveysController.getSurveyById
);

liftSurveysRouter.post(
  '/admin/lift-surveys',
  authenticate,
  LiftSurveysController.createSurvey
);

liftSurveysRouter.put(
  '/admin/lift-surveys/:id',
  authenticate,
  LiftSurveysController.updateSurvey
);

liftSurveysRouter.delete(
  '/admin/lift-surveys/:id',
  authenticate,
  LiftSurveysController.deleteSurvey
);
