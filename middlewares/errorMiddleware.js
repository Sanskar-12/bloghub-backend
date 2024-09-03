const ErrorMiddleware=(error,req,res,next)=>{
    error.statusCode=error.statusCode || 500
    error.message=error.message || "Internal Server Error"

    return res.status(error.statusCode).json({
        success:false,
        message:error.message
    })
}

export default ErrorMiddleware