const freelanceSignupValidationRules = [
	{ field: "nom", message: "Le champ nom est requis." },
	{ field: "prenom", message: "Le champ prénom est requis." },
	{ field: "tel", message: "Le numeros téléphone est requis." },
	{ field: "email", message: "L'email n'est pas valide." },
	{
		field: "password",
		message:
			"Le champ mot de passe est requis. Le mot de passe doit avoir au moins 8 caractères et contenir au moins un chiffre.",
	},
	{
		field: "isPasswordConfirmed",
		message: "Le mot de passe est incorrect",
	},
	{ field: "dateDeNaissance", message: "La date de naissance est  requis." },
	{ field: "adresse", message: "L'adresse est  requis." },
	{
		field: "informationsBancaires",
		message: "L'informations bancaires est  requis.",
	},
	{
		field: "nomRepresentant",
		message: "Le nom du réprésentant est  requis.",
	},
	{
		field: "prenomRepresentant",
		message: "Le prenom du réprésentant est  requis.",
	},
	{
		field: "emailRepresentant",
		message: "L'email du réprésentant est  requis.",
	},
	{
		field: "telRepresentant",
		message: "Le numeros téléphone du réprésentant est  requis.",
	},
	{
		field: "adresseRepresentant",
		message: "L'adresse du réprésentant est  requis.",
	},
	{
		field: "raisonSocial",
		message: "La raison social est  requis.",
	},
	{
		field: "adresseEntreprise",
		message: "L'adresse de l'entreprise est  requis.",
	},
	{
		field: "numeroIdentificationFiscale",
		message: "L'adresse de l'entreprise est  requis.",
	},
	{
		field: "idPlacement",
		message: "Le placement n'est pas définie",
	},
	{
		field: "nbrDeJours",
		message: "Le nombre de jours n'est pas définie",
	},
	{
		field: "tjm",
		message: "Le taux journalier n'est pas définie",
	},
];

const companySignupValidationRules = [
	{
		field: "representantNom",
		message: "Le nom du représentant est requis.",
	},
	{
		field: "representantPrenom",
		message: "Le prénom du représentant est requis.",
	},
	{
		field: "representantEmail",
		message: "L'email du représentant est requis.",
	},
	{
		field: "representantTel",
		message: "Le numéro de téléphone du représentant est requis.",
	},
	{
		field: "representantCodePostal",
		message: "Le code postal du représentant est requis.",
	},
	{
		field: "representantAdresse",
		message: "L'adresse du représentant est requise.",
	},
	{
		field: "representantVille",
		message: "La ville du représentant est requise.",
	},
	{
		field: "raisonSociale",
		message: "La raison sociale est requise.",
	},
	{
		field: "entrepriseVille",
		message: "La ville de l'entreprise est requise.",
	},
	{
		field: "entrepriseAdresse",
		message: "L'adresse de l'entreprise est requise.",
	},
	{
		field: "entrepriseCodePostal",
		message: "Le code postal de l'entreprise est requis.",
	},
];

export {
	freelanceSignupValidationRules,
	companySignupValidationRules,
	adminSignupValidationRules,
};
