import { z } from "zod";

export const SignInAuthCredentialsValidator = z.object({
	email: z.string().email(),
	password: z.string().min(8, {
		message: "Password must be at least 8 characters long.",
	}),
});

export type TSignInAuthCredentialsValidator = z.infer<
	typeof SignInAuthCredentialsValidator
>;

export const SignUpAuthCredentialsValidator = z.object({
	fullName: z.string().min(1, {
		message: "Name must not be empty",
	}),
	email: z.string().email(),
	password: z.string().min(8, {
		message: "Password must be at least 8 characters long.",
	}),
});

export type TSignUpAuthCredentialsValidator = z.infer<
	typeof SignUpAuthCredentialsValidator
>;
