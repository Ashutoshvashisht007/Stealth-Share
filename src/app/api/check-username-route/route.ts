import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/singUpSchema";
import { responseFunction } from "@/app/utils/response";

const usernameQuerySchema = z.object({
    username: usernameValidation
});

export async function GET(req: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const queryParam = {
            username: searchParams.get('username')
        }
        const res = usernameQuerySchema.safeParse(queryParam);
        console.log(res);

        if (!res.success) {
            const usernameErrors = res.error.format().username?._errors || [];
            const err = usernameErrors?.length > 0 ? usernameErrors.join(',') : "Invalid query parameters";
            return responseFunction(err,false,400);
        }

        const verifiedUserExists = await UserModel.findOne({
            username: res.data.username,
            isVerified: true
        });

        if(verifiedUserExists){
            return responseFunction("Username is already taken",false,400);
        }

        return responseFunction("Username is available",true,200);
    } catch (error) {
        console.log("Error in checking username", error);
        return responseFunction("Error in checking username ", false, 500);
    }
}