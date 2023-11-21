import {
	SignInAuthCredentialsValidator,
	SignUpAuthCredentialsValidator,
} from "../lib/validators/account-credentials-validator";
import { publicProcedure, router } from "./trpc";
import { getPayloadClient } from "../get-payload";
import { stripe } from "../lib/stripe";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const authRouter = router({
	createPayloadUser: publicProcedure
		.input(SignUpAuthCredentialsValidator)
		.mutation(async ({ input }) => {
			const { email, password, fullName } = input;
			const payload = await getPayloadClient();

			// check if user already exists
			const { docs: users } = await payload.find({
				collection: "users",
				where: {
					email: {
						equals: email,
					},
				},
			});

			if (users.length !== 0) throw new TRPCError({ code: "CONFLICT" });

			// Create Stripe Customer and assign ID

			const customer = await stripe.customers.create({
				name: fullName,
				email: email,
			});

			await payload.create({
				collection: "users",
				data: {
					full_name: fullName,
					email,
					password,
					stripe_customer_id: customer.id,
					role: "user",
				},
			});

			return { success: true, sentToEmail: email };
		}),

	verifyEmail: publicProcedure
		.input(z.object({ token: z.string() }))
		.query(async ({ input }) => {
			const { token } = input;

			const payload = await getPayloadClient();

			const isVerified = await payload.verifyEmail({
				collection: "users",
				token,
			});

			if (!isVerified) throw new TRPCError({ code: "UNAUTHORIZED" });

			return { success: true };
		}),

	signIn: publicProcedure
		.input(SignInAuthCredentialsValidator)
		.mutation(async ({ input, ctx }) => {
			const { email, password } = input;
			const { res } = ctx;

			const payload = await getPayloadClient();

			try {
				await payload.login({
					collection: "users",
					data: {
						email,
						password,
					},
					res,
				});

				return { success: true };
			} catch (err) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
		}),
});
