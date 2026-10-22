import { Request, Response } from "express";
import { authService } from "./auth.services";
import { registerSchema, loginSchema, inviteCollaboratorSchema } from "./auth.validators";

// Interface pour typer la requête contenant l'utilisateur connecté
type AuthenticatedRequest = Request & {
  user?: NonNullable<Request["user"]> & { sub: string };
};

export const authController = {
  // Inscription et activation du compte par le collaborateur
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // 2. Connexion
  async login(req: Request, res: Response): Promise<void> {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      res.status(200).json({ message: "Connexion réussie", ...result });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  },

  // Action réservée au Manager (inviter/ajouter un collaborateur)
  async addCollaborator(req: any, res: Response) {
    try {
      const managerId = req.user?.sub;
      if (!managerId) {
        res.status(401).json({ error: "Session invalide ou utilisateur introuvable" });
        return;
      }

      const result = await authService.addCollaborator(managerId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};