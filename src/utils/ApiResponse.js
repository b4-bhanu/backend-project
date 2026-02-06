class ApiResponse {
    constructor(statusCode, data, message =  "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400 
        // API server has status code
        // Informational response(100 - 200)
        // Successful response(200 - 299) 
        // Redirection response(300 - 399)
        // from (400 - 499) is Client ERROR response
        // from (500 - 599) is Server ERROR response
    }
}