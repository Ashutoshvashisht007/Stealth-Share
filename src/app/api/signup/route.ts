import { responseFunction } from "@/app/utils/response";
import dbConnect from "@/lib/dbConnect";
import { sendVerificationEmail } from "@/lib/resend";
import UserModel from "@/model/User";
import { ApiResponse } from "@/types/ApiResponse";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const { username, email, password } = await req.json();
        const isUserExistVerfiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        });

        if (isUserExistVerfiedByUsername) {
            return responseFunction("Username is already taken", false, 400);
        }

        const existingUserByEmail = await UserModel.findOne({
            email
        });

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserByEmail) {
            if(existingUserByEmail.isVerified){
                return responseFunction("User already exist with this email",false,400);
            }
            else {
                const updatedHashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = updatedHashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

                await existingUserByEmail.save();
            }
        }
        else {
            const passwordHashed = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: passwordHashed,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: [],
            });

            await newUser.save();
        }
        //send verification email

        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        );

        if (!emailResponse.success) {
            return responseFunction(emailResponse.message,false,500);
        }

        return responseFunction("User Registered Successfully, Please Verify your email",true, 201);

    } catch (error) {
        console.log("Signup unsuccessfull", error);
        return responseFunction("Signup unsuccessfull",false,500);
    }
}