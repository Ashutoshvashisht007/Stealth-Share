import { Document } from "mongoose";
import { Types } from "mongoose";
import { User } from "next-auth"

export const responseFunction = (message: string, success: boolean, status?: number) => {
    return Response.json({
        success,
        message,
    },
        {
            status
        })
}
