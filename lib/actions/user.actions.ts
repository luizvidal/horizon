"use server";

import { SESSION_NAME } from "@/constants";
import { log } from "console";
import { cookies } from "next/headers";
import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { parseStringify } from "../utils";

export const signIn = async ({ email, password }: signInProps) => {
	try {
		const { account } = await createAdminClient();
		const session = await account.createEmailPasswordSession(email, password);

		cookies().set(SESSION_NAME, session.secret, {
			path: "/",
			httpOnly: true,
			sameSite: "strict",
			secure: true,
		});

		return parseStringify(session);
	} catch (error) {
		console.log(error);
	}
};

export const signUp = async (userData: SignUpParams) => {
	try {
		const { account } = await createAdminClient();

		const { firstName, lastName, email, password } = userData;

		const newUserAccount = await account.create(
			ID.unique(),
			email,
			password,
			`${firstName} ${lastName}`
		);

		const session = await account.createEmailPasswordSession(email, password);

		cookies().set(SESSION_NAME, session.secret, {
			path: "/",
			httpOnly: true,
			sameSite: "strict",
			secure: true,
		});

		return parseStringify(newUserAccount);
	} catch (error) {
		console.log(error);
	}
};

export async function getLoggedInUser() {
	try {
		const { account } = await createSessionClient();

		const result = await account.get();

		return parseStringify(result);
	} catch (error) {
		console.log(error);
		return null;
	}
}

export const logoutAccount = async () => {
	try {
		const { account } = await createSessionClient();

		cookies().delete(SESSION_NAME);

		await account.deleteSession("current");
	} catch (error) {
		log(error);
		return null;
	}
};
