import { z } from "zod";

// Validation du mot de passe selon les critères de sécurité recommandés par l'ANSSI et la CNIL
const motDePasseSchema = z.string()
  .refine((val) => val.length <= 128, {
    message: "Le mot de passe ne doit pas dépasser 128 caractères",
  })
  .refine((val) => val.length >= 12, {
    message: "Le mot de passe doit faire au moins 12 caractères",
  })
  .refine((val) => /[A-Z]/.test(val), {
    message: "Il faut au moins une lettre majuscule",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Il faut au moins une lettre minuscule",
  })
  .refine((val) => /[0-9]/.test(val), {
    message: "Il faut au moins un chiffre",
  })
  .refine((val) => /[^a-zA-Z0-9]/.test(val), {
    message: "Il faut au moins un symbole (!, @, #, etc.)",
  });

// Inscription et activation de compte
export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email({ message: "L'e-mail n'est pas valide" })),
  password: motDePasseSchema,
});

// Connexion
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email({ message: "L'e-mail n'est pas valide" })),
  password: z.string().min(1, { message: "Le mot de passe est obligatoire" }),
});

// Le Manager ajoute un collaborateur de son équipe
export const inviteCollaboratorSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email({ message: "L'e-mail du collaborateur n'est pas valide" })),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type InviteCollaboratorInput = z.infer<typeof inviteCollaboratorSchema>;