import { Resend } from "resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";


export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifycode: string
) : Promise<ApiResponse>{
    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Stealth Share |||| Verification code",
            react: VerificationEmail({username,otp: verifycode})
        })

        return {
            success: true,
            message: "Verification email sent successfully"
        }
    } catch (error) {
        console.log("Email doesn't sent successfully",error);
        return {
            success: false,
            message: "Failed to send verification email"
        }
    }
}