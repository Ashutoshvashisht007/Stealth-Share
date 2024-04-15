
export const responseFunction = (message: string, success: boolean, status?: number) => {
    return Response.json({
        success,
        message,
    },
        {
            status
        })
}