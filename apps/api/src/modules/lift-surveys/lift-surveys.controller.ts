import { Request, Response, NextFunction } from 'express';
import prisma from '../../database/client';
import { logAudit } from '../../middleware/audit';

export class LiftSurveysController {
  // GET /admin/lift-surveys (List all building surveys)
  static async getSurveys(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, page = 1, limit = 50 } = req.query;
      const where: any = {};

      if (status && typeof status === 'string') {
        where.status = status;
      }

      if (search && typeof search === 'string') {
        const s = search.trim();
        where.OR = [
          { surveyNumber: { contains: s, mode: 'insensitive' } },
          { projectName: { contains: s, mode: 'insensitive' } },
          { clientName: { contains: s, mode: 'insensitive' } },
          { siteLocation: { contains: s, mode: 'insensitive' } },
          { buildingName: { contains: s, mode: 'insensitive' } },
        ];
      }

      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
      const limitNum = Math.max(1, parseInt(String(limit), 10) || 50);
      const skip = (pageNum - 1) * limitNum;

      const [total, items] = await Promise.all([
        prisma.liftSurvey.count({ where }),
        prisma.liftSurvey.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          items,
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /admin/lift-surveys/:id (Get single building survey by ID)
  static async getSurveyById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const survey = await prisma.liftSurvey.findUnique({
        where: { id },
      });

      if (!survey) {
        return res.status(404).json({
          success: false,
          message: 'Lift Survey Report not found',
        });
      }

      return res.json({
        success: true,
        data: survey,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/lift-surveys (Create new survey)
  static async createSurvey(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        projectName,
        clientName,
        siteLocation,
        buildingName,
        date,
        numberOfLifts = 1,
        numberOfStops = 6,
        floorNames = ['B', 'G', '1', '2', '3', '4'],
        status = 'DRAFT',
        liftsData,
        observations = [],
        surveyorName,
        surveyorSignDate,
        directorName,
        directorSignDate,
        notes,
      } = req.body;

      if (!projectName || !projectName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Project name is required',
        });
      }

      const surveyNumber = `BSR-${Date.now().toString().slice(-6)}`;
      const user = (req as any).user;

      const survey = await prisma.liftSurvey.create({
        data: {
          surveyNumber,
          projectName: projectName.trim(),
          clientName: clientName?.trim() || null,
          siteLocation: siteLocation?.trim() || null,
          buildingName: buildingName?.trim() || null,
          date: date || new Date().toISOString().split('T')[0],
          numberOfLifts: Number(numberOfLifts) || 1,
          numberOfStops: Number(numberOfStops) || 6,
          floorNames: Array.isArray(floorNames) ? floorNames : ['B', 'G', '1', '2', '3', '4'],
          status: status || 'DRAFT',
          liftsData: liftsData || [],
          observations: observations || [],
          surveyorName: surveyorName?.trim() || null,
          surveyorSignDate: surveyorSignDate || null,
          directorName: directorName?.trim() || null,
          directorSignDate: directorSignDate || null,
          notes: notes?.trim() || null,
          createdById: user?.id || null,
        },
      });

      await logAudit({
        userId: user?.id,
        action: 'LIFT_SURVEY_CREATED',
        entityType: 'LiftSurvey',
        entityId: survey.id,
        details: {
          surveyNumber,
          projectName: survey.projectName,
          numberOfLifts: survey.numberOfLifts,
          numberOfStops: survey.numberOfStops,
        },
      });

      return res.status(201).json({
        success: true,
        data: survey,
        message: 'Building Survey Report created successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  // PUT /admin/lift-surveys/:id (Update survey)
  static async updateSurvey(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const {
        projectName,
        clientName,
        siteLocation,
        buildingName,
        date,
        numberOfLifts,
        numberOfStops,
        floorNames,
        status,
        liftsData,
        observations,
        surveyorName,
        surveyorSignDate,
        directorName,
        directorSignDate,
        notes,
      } = req.body;

      const existing = await prisma.liftSurvey.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Lift Survey Report not found',
        });
      }

      const updated = await prisma.liftSurvey.update({
        where: { id },
        data: {
          projectName: projectName !== undefined ? projectName.trim() : undefined,
          clientName: clientName !== undefined ? clientName?.trim() || null : undefined,
          siteLocation: siteLocation !== undefined ? siteLocation?.trim() || null : undefined,
          buildingName: buildingName !== undefined ? buildingName?.trim() || null : undefined,
          date: date !== undefined ? date : undefined,
          numberOfLifts: numberOfLifts !== undefined ? Number(numberOfLifts) : undefined,
          numberOfStops: numberOfStops !== undefined ? Number(numberOfStops) : undefined,
          floorNames: Array.isArray(floorNames) ? floorNames : undefined,
          status: status !== undefined ? status : undefined,
          liftsData: liftsData !== undefined ? liftsData : undefined,
          observations: observations !== undefined ? observations : undefined,
          surveyorName: surveyorName !== undefined ? surveyorName?.trim() || null : undefined,
          surveyorSignDate: surveyorSignDate !== undefined ? surveyorSignDate : undefined,
          directorName: directorName !== undefined ? directorName?.trim() || null : undefined,
          directorSignDate: directorSignDate !== undefined ? directorSignDate : undefined,
          notes: notes !== undefined ? notes?.trim() || null : undefined,
        },
      });

      const user = (req as any).user;
      await logAudit({
        userId: user?.id,
        action: 'LIFT_SURVEY_UPDATED',
        entityType: 'LiftSurvey',
        entityId: id,
        details: {
          surveyNumber: updated.surveyNumber,
          projectName: updated.projectName,
        },
      });

      return res.json({
        success: true,
        data: updated,
        message: 'Building Survey Report updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /admin/lift-surveys/:id (Delete survey)
  static async deleteSurvey(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const existing = await prisma.liftSurvey.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Lift Survey Report not found',
        });
      }

      await prisma.liftSurvey.delete({ where: { id } });

      const user = (req as any).user;
      await logAudit({
        userId: user?.id,
        action: 'LIFT_SURVEY_DELETED',
        entityType: 'LiftSurvey',
        entityId: id,
        details: {
          surveyNumber: existing.surveyNumber,
          projectName: existing.projectName,
        },
      });

      return res.json({
        success: true,
        message: `Building Survey Report ${existing.surveyNumber} deleted successfully`,
      });
    } catch (err) {
      next(err);
    }
  }
}
