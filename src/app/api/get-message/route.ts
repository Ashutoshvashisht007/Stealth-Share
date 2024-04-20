import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { responseFunction } from "@/app/utils/response";
import mongoose from "mongoose";

export async function GET(req: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const sessionUser: User = session?.user as User;
    if (!session || !session.user) {
        return responseFunction("Not Authenticated", false, 401);
    }

    const userId = new mongoose.Types.ObjectId(sessionUser._id);

    try {
        const user = await UserModel.aggregate([
            {
                $match: {
                    id: userId
                }
            },
            {
                $unwind: '$messages' // unwinds the array into objects
            },
            {
                $sort: {
                    'messages.createdAt': -1
                }
            },
            {
                $group: { // grouping on the basis of id and messages
                    _id: '$_id',
                    messages: {
                        $push: '$messages'
                    }
                }
            }
        ]);

        if (!user || user.length === 0) {
            return responseFunction("User not found", false, 401);
        }

        return Response.json({
            success: true,
            messages: user[0].messages
        },
            {
                status: 200
            })

    } catch (error) {
        console.log(error);
        return responseFunction("cannot get messages", false, 500);
    }
}