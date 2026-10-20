import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { authRepo } from "./auth.repo";
import { RegisterInput, LoginInput, InviteCollaboratorInput } from "./auth.validators";

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || "cle_secrete_access_pour_le_dev_moodly_123456";
const prisma = new PrismaClient();

export const authService = {
  // Le Manager souhaite inviter un collaborateur

  async addCollaborator(managerId: string, input: InviteCollaboratorInput) {
    const existing = await authRepo.findByEmail(input.email);
    if (existing) {
      throw new Error("Cet e-mail est déjà enregistré dans l'entreprise");
    }

    // Checker de quelle entreprise vient le manager (companyId)
    const manager = await authRepo.findByEmail(managerId) || await prisma.user.findUnique({ where: { id: managerId } });
    if (!manager) {
      throw new Error("Manager introuvable");
    }

    // Crée le collaborateur lié à la même entreprise
    const collaboratorInput = input as InviteCollaboratorInput & {
      firstName?: string;
      lastName?: string;
    };

    const newCollaborator = await authRepo.createUser({
      email: input.email,
      passwordHash: "EN_ATTENTE_ACTIVATION", // Marqueur temporaire
      firstName: collaboratorInput.firstName || "Collaborateur",
      lastName: collaboratorInput.lastName || "Moodly",
      companyId: manager.companyId,
      role: "COLLABORATEUR",
    });

    return {
      message: "Collaborateur ajouté avec succès",
      email: newCollaborator.email,
    };
  },

  // Le collaborateur active son compte en définissant son mot de passe

  async register(input: RegisterInput) {
    const user = await authRepo.findByEmail(input.email);

    // Si le mail n'a jamais été pré-enregistré par un manager
    if (!user) {
      throw new Error("Votre adresse e-mail n'est pas autorisée. Demandez à votre manager de vous ajouter.");
    }

    // Vérification de l'activation :
    // Le compte est considéré comme déjà activé s'il a un mot de passe différent du marqueur temporaire
    if (user.passwordHash && user.passwordHash !== "EN_ATTENTE_ACTIVATION") {
      throw new Error("Ce compte a déjà été activé. Veuillez vous connecter.");
    }

    // Hachage du vrai mot de passe et mise à jour
    const hash = await argon2.hash(input.password);
    const updatedUser = await authRepo.updateUser(input.email, {
      passwordHash: hash,
    });

    return {
      message: "Compte activé avec succès !",
      email: updatedUser?.email,
      role: updatedUser?.role,
    };
  },

  // Connexion (renvoie automatiquement le rôle connu en base)

  async login(input: LoginInput) {
    const user = await authRepo.findByEmail(input.email);

    if (!user || !user.passwordHash) {
      throw new Error("Identifiants incorrects");
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, input.password);
      if (!isPasswordValid) {
      throw new Error("Identifiants incorrects");
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return {
      token,
        user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  },
};