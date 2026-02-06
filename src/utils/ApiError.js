class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        // this message does not specify any thing that went wrong in particular, quite useless,
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false 
        this.errors = errors
    }
}