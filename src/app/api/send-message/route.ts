import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { responseFunction } from "@/app/utils/response";
import { Message } from "@/model/User";

export async function POST(req:Request) {
    await dbConnect();

    const {username, content} = await req.json();

    try {

        const user = await UserModel.findOne({username});
        if(!user){
            return responseFunction("User not Found",false,404);
        }

        if(!user.isAcceptingMessage){
            return responseFunction("User not accepting messages",false,403);
        };

        const newMessage = {
            content,
            createdAt: new Date()
        }

        user.messages.push(newMessage as Message);
        await user.save();

        return responseFunction("Message sent successfully",true,200);
        
    } catch (error) {
        console.log(error);

        return responseFunction("Internal Server error ",false,500);
    }
}