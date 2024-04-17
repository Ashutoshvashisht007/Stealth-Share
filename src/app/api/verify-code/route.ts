import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { responseFunction } from "@/app/utils/response";

export async function POST(req:Request) {
    await dbConnect();

    try {
        const {username,code} = await req.json();

        const user = await UserModel.findOne({
            username
        });

        if(!user){
            return responseFunction("User not found",false,404);
        }

        const isCodeCorrect = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if(!isCodeCorrect) {
            return responseFunction("Invalid Code", false, 500);
        }
        if(!isCodeNotExpired) {
            return responseFunction("Code Expired. please signup again to get a new code", false, 500);
        }
        user.isVerified = true;
        await user.save();
        return responseFunction("Account verfied successfully",true,200);

    } catch (error) {
        console.log("Error in verifying user", error);
        return responseFunction("Error in verifying user ", false, 500);
    }
}
