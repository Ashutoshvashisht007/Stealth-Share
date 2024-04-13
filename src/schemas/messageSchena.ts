import {z} from "zod";

export const messageSchema = z.object({
    content: z.string().min(5,{
        message: "Content must of at least 5 characters"
    }).max(300,{
        message: "Content should not be more than 300 characters"
    }),
})