import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { responseFunction } from "@/app/utils/response";

export async function POST(req: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const sessionUser: User = session?.user as User;
    if (!session || !session.user) {
        return responseFunction("Not Authenticated", false, 401);
    }

    const userId = sessionUser._id;
    const { acceptMessages } = await req.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                isAcceptingMessage: acceptMessages
            },
            {
                new: true
            }
        );

        if (!updatedUser) {
            return responseFunction("failed to update user status to accept messages", false, 401);
        }

        return Response.json({
            success: true,
            message: "Message Acceptance status updated successfully",
            updatedUser,
        },
            {
                status: 200
            })
    } catch (error) {
        console.log(error);

        return responseFunction("failed to update user status to accept messages", false, 500);
    }
}

export async function GET(req: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const sessionUser: User = session?.user as User;
    if (!session || !session.user) {
        return responseFunction("Not Authenticated", false, 401);
    }

    const userId = sessionUser._id;
    try {
        const user = await UserModel.findById(userId);

        if (!user) {
            return responseFunction("failed to found the user", false, 401);
        }

        return Response.json({
            success: true,
            isAcceptingMessages: user.isAcceptingMessage
        },
            {
                status: 200
            })
    } catch (error) {
        console.log(error);
        return responseFunction("Error in getting message acceptence", false, 500);
    }
}