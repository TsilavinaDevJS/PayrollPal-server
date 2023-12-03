import UserFreelancerRepository from "../../databases/repository/userFreelancerRepository.js";
import UserEntrepriseRepository from "../../databases/repository/userEntrepriseRepository.js";
import PlacementRepository from "../../databases/repository/placementRepository.js";
import UserAdminRepository from "../../databases/repository/userAdminRepository.js";
import User from "../../databases/models/user_Admin.js";
import { generateAuthToken } from "../utils/auth.validationUtils.js";
import { getUserByEmail } from "../authentification/example/handler.example.js";
import { sendCodeAndHTTPInValidationMailForUpdateCompany } from "../../service/admin.mailer.js";
import { generateUniqueToken } from "../utils/auth.validationUtils.js";
import { ObjectId } from "mongoose";

const userFreelancerRepository = new UserFreelancerRepository();
const userEntrepriseRepository = new UserEntrepriseRepository();
const userAdminRepository = new UserAdminRepository();
const placementRepository = new PlacementRepository();

const getUserWithFilter = async () => {
	const allUsers = [];
	try {
		const usersEntreprise = await userEntrepriseRepository.getAllUsers();
		const usersFreelance =
			await userFreelancerRepository.getAdminValidatedUsers();

		allUsers.push(...usersEntreprise, ...usersFreelance);
		return allUsers;
	} catch (error) {
		throw new Error(error);
	}
};
const deleteUserHandler = async (userId, userRoles) => {
	try {
		let userModel;
		if (userRoles === "ROLES_FREELANCE") {
			userModel = userFreelancerRepository;
		} else {
			userModel = userEntrepriseRepository;
		}
		const result = await userModel.deleteUser(userId);
		if (!result) {
			throw new Error("Utilisateur non trouvé");
		}
		return "Utilisateur supprimé avec succès";
	} catch (error) {
		throw new Error(error);
	}
};

const getFreelanceAllUsersHandler = async () => {
	const allFreelanceUsersHandler = [];
	try {
		const freelanceUsers =
			await userFreelancerRepository.getAdminValidatedUsers();

		allFreelanceUsersHandler.push(...freelanceUsers);
		return allFreelanceUsersHandler;
	} catch (error) {
		throw new Error(error);
	}
};
const geCompanyAllUsersHandler = async () => {
	const allCompanyUsersHandler = [];
	try {
		const companyUsers = await userEntrepriseRepository.getAllUsers();

		allCompanyUsersHandler.push(...companyUsers);
		return allCompanyUsersHandler;
	} catch (error) {
		throw new Error(error);
	}
};

const getUnvalidatedFreelancersHandler = async () => {
	const allUnvalidatedFreelancersUsersHandler = [];
	try {
		const unvalidatedFreelancersUser =
			await userFreelancerRepository.getAdminNotValidatedUsers();
		allUnvalidatedFreelancersUsersHandler.push(...unvalidatedFreelancersUser);
		return allUnvalidatedFreelancersUsersHandler;
	} catch (error) {
		throw new Error(error);
	}
};
const validateFreelancersHandler = async (userId) => {
	try {
		const validateFreelancersUser =
			await userFreelancerRepository.getAdminNotValidatedUsersAndId(userId);

		if (!validateFreelancersUser) {
			throw new Error("Cet utilisatuer n'existe plus ");
		}
		const user = validateFreelancersUser[0];
		user.adminValidate = true;
		await user.save();
		return user;
	} catch (error) {
		throw new Error(error);
	}
};
const deleteFreelancersWaitHandler = async (userId) => {
	try {
		const validateFreelancersWaitUser =
			await userFreelancerRepository.deleteUser(userId);
		return validateFreelancersWaitUser;
	} catch (error) {
		throw new Error(error);
	}
};
const convertPlacementDataHandler = async (placement) => {
	const freelanceTypeArray =
		await userFreelancerRepository.getAdminValidatedUsersAndId(
			placement.idFreelance
		);
	if (freelanceTypeArray.length === 0) {
		return;
	}
	const freelanceChasseurTypeArray =
		await userFreelancerRepository.getAdminValidatedUsersAndId(
			placement.idFreelanceChasseur
		);
	if (freelanceChasseurTypeArray.length === 0) {
		return;
	}
	const entrepriseTypeArray = await userEntrepriseRepository.getUserWithId(
		placement.idEntreprise
	);
	if (entrepriseTypeArray.length === 0) {
		return;
	}
	const freelanceChasseur = freelanceChasseurTypeArray[0];
	const entreprise = entrepriseTypeArray[0];
	const freelance = freelanceTypeArray[0];
	const convertedData = {
		_id: placement._id,
		Freelance: {
			id: placement.idFreelance,
			nom: freelance?.nom,
			prenom: freelance?.prenom,
			tel: freelance?.tel,
		},
		FreelanceChasseur: {
			id: placement.idFreelanceChasseur,
			nom: freelanceChasseur?.nom,
			prenom: freelanceChasseur?.prenom,
			tel: freelanceChasseur?.tel,
		},
		entreprise: {
			id: placement.idEntreprise,
			raisonSocial: entreprise?.raisonSocial,
		},
		revenuMensuelFreelanceChasseur: placement.revenuMensuelFreelanceChasseur,
	};
	return convertedData;
};

const createPlacementHandler = async (data) => {
	const {
		idFreelance,
		idFreelanceChasseur,
		idEntreprise,
		revenuMensuelFreelanceChasseur,
	} = data;
	try {
		const isPlacementExist =
			await placementRepository.getPlacementWidthIdFreelanceAndIdEntreprise(
				idFreelance,
				idEntreprise
			);
		if (isPlacementExist.length !== 0) {
			throw new Error("Le placement a été déjà effectuer");
		}
		const isFreelanceValid =
			await userFreelancerRepository.getAdminValidatedUsersAndId(idFreelance);
		if (isFreelanceValid.length === 0) {
			throw new Error("Le freelance n'est pas valide.");
		}

		const isChasseurValid =
			await userFreelancerRepository.getAdminValidatedUsersAndId(
				idFreelanceChasseur
			);
		if (isChasseurValid.length === 0) {
			throw new Error("Le freelance chasseur n'est pas valide.");
		}

		const isEntrepriseValid = await userEntrepriseRepository.getUserWithId(
			idEntreprise
		);
		if (isEntrepriseValid.length === 0) {
			throw new Error("L'entreprise n'est pas valide.");
		}

		const result = await placementRepository.createPlacement(data);
		const response = await convertPlacementDataHandler(result);

		return response;
	} catch (error) {
		throw error;
	}
};

const updatePlacementHandler = async (placementId, placementData) => {
	const { idFreelance, idFreelanceChasseur, idEntreprise } = placementData;
	try {
		const isPlacementValid = await placementRepository.getPlacementWithId(
			placementId
		);
		if (isPlacementValid.length === 0) {
			throw new Error("Le placement n'est pas valide");
		}
		const isFreelanceValid =
			await userFreelancerRepository.getAdminValidatedUsersAndId(idFreelance);
		if (isFreelanceValid.length === 0) {
			throw new Error("Le freelance n'est pas valide.");
		}

		const isChasseurValid =
			await userFreelancerRepository.getAdminValidatedUsersAndId(
				idFreelanceChasseur
			);
		if (isChasseurValid.length === 0) {
			throw new Error("Le freelance chasseur n'est pas valide.");
		}

		const isEntrepriseValid = await userEntrepriseRepository.getUserWithId(
			idEntreprise
		);
		if (isEntrepriseValid.length === 0) {
			throw new Error("L'entreprise n'est pas valide.");
		}

		const result = await placementRepository.updatePlacement(
			placementId,
			placementData
		);
		const convertedResult = await convertPlacementDataHandler(result);

		return convertedResult;
	} catch (error) {
		throw error;
	}
};

const deletePlacementHandler = async (placementId) => {
	try {
		const result = await placementRepository.deletePlacement(placementId);
		return result;
	} catch (error) {
		throw error;
	}
};
const getPlacementHandler = async () => {
	try {
		const result = await placementRepository.getAllPlacement();
		if (result.length === 0) {
			return [];
		}
		const response = result.map((placement) => {
			return convertPlacementDataHandler(placement);
		});

		const nonUndefinedOrNullResponse = response.filter(
			(item) => item !== undefined && item !== null
		);

		if (nonUndefinedOrNullResponse.length === 0) {
			return [];
		}

		const convertedResult = await Promise.all(nonUndefinedOrNullResponse);

		const filteredResult = convertedResult.filter(
			(item) => item && Object.keys(item).length > 0
		);

		return filteredResult;
	} catch (error) {
		throw error;
	}
};

const updateProfilHandler = async (data) => {
	const { nom, prenom, email } = data;

	try {
		const isFreelanceValid = await userFreelancerRepository.getUserByEmail(
			email
		);
		if (isFreelanceValid) {
			throw new Error("Cet email existe déjà");
		}
		const isEntrepriseValid = await userEntrepriseRepository.getUserByEmail(
			email
		);
		if (isEntrepriseValid) {
			throw new Error("Cet email existe déjà");
		}
		const isAdminValid = await userAdminRepository.getUserByEmail(email);
		const user = await User.findById(data._id);
		if (!user) {
			throw new Error("Utilisateur non trouvé");
		}

		if (user.email !== email && isAdminValid) {
			throw new Error("Cet email existe déjà ");
		}

		user.nom = nom;
		user.prenom = prenom;
		user.email = email;
		await user.save();
		const authToken = generateAuthToken(user);
		return { user, authToken };
	} catch (error) {
		throw error;
	}
};

const createAccountCompanyHandler = async (userData) => {
	try {
		const existingUser = await getUserByEmail(userData.emailRepresentant);
		if (existingUser) {
			return "Cet email est déjà utilisé.";
		}
		const user = await userEntrepriseRepository.createUser(userData);

		return {
			success: true,
			user,
		};
	} catch (error) {
		throw error;
	}
};

const getAllCompanyNotConditionHandler = async () => {
	try {
		const user = await userEntrepriseRepository.getAllUsersNotCondition();
		return user;
	} catch (error) {
		throw error;
	}
};

const updatedCompanyUserHandler = async (userId, userData) => {
	try {
		const existingUser = await getUserByEmail(userData.emailRepresentant);
		if (existingUser && existingUser?._id.equals(new ObjectId(userId))) {
			return "Cet email est déjà utilisé.";
		}

		const user = await userEntrepriseRepository.getUserById(userId);

		if (user.emailRepresentant !== userData.emailRepresentant) {
			user.isEmailConfirmed = false;
			user.emailRepresentant = userData.emailRepresentant;
			user.emailVerificationCode = generateUniqueToken();
			await sendCodeAndHTTPInValidationMailForUpdateCompany(
				user.emailRepresentant,
				user.emailVerificationCode
			);
		}
		user.nomRepresentant = userData.nomRepresentant;
		user.prenomRepresentant = userData.prenomRepresentant;
		user.raisonSocial = userData.raisonSocial;
		user.adresseEntreprise = userData.adresseEntreprise;
		user.adresseRepresentant = userData.adresseRepresentant;
		user.numeroIdentificationFiscale = userData.numeroIdentificationFiscale;
		user.telRepresentant = userData.telRepresentant;
		await user.save();
		return {
			succes: true,
			user,
		};
	} catch (error) {
		throw error;
	}
};

export {
	getUserWithFilter,
	deleteUserHandler,
	geCompanyAllUsersHandler,
	getFreelanceAllUsersHandler,
	getUnvalidatedFreelancersHandler,
	validateFreelancersHandler,
	deleteFreelancersWaitHandler,
	createPlacementHandler,
	updatePlacementHandler,
	deletePlacementHandler,
	getPlacementHandler,
	updateProfilHandler,
	createAccountCompanyHandler,
	getAllCompanyNotConditionHandler,
	updatedCompanyUserHandler,
	convertPlacementDataHandler,
};
