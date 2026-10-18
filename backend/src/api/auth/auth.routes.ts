// Le panneau d'aiguillage des adresses URL (/register, /login, etc.)

import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authController } from "./auth.controllers";

const CLE_SECRETE = process.env.JWT_ACCESS_SECRET || "cle_secrete_access_pour_le_dev_moodly_123456";

// Vigile 1 : Vérifie si la personne a un token JWT valide
const verifierConnexion = (req: Request, res: Response, next: NextFunction) => {
  const enteteAuth = req.headers.authorization;

  if (!enteteAuth || !enteteAuth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Vous devez être connecté pour accéder à cette page" });
    return;
  }

  const token = enteteAuth.split(" ")[1];

  try {
    const payload = jwt.verify(token, CLE_SECRETE) as NonNullable<Request["user"]>;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Session expirée ou invalide, reconnectez-vous" });
  }
};

// Vigile 2 : Bloque l'accès si la personne n'est pas Manager
const seulementPourManager = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "MANAGER") {
    res.status(403).json({ error: "Accès refusé : réservé aux managers" });
    return;
  }
  next();
};

const router = Router();

// Routes publiques
router.post("/register", authController.register);
router.post("/login", authController.login);

// Route d'invitation réservée au Manager
router.post(
  "/collaborators",
  verifierConnexion,
  seulementPourManager,
  authController.addCollaborator as any
);

// Routes de test protégées
router.get("/mon-profil", verifierConnexion, (req: Request, res: Response) => {
  res.json({ message: "Voici votre profil", session: req.user });
});

router.get("/espace-manager", verifierConnexion, seulementPourManager, (req: Request, res: Response) => {
  res.json({ message: "Bienvenue dans l'espace manager !" });
});

export default router;