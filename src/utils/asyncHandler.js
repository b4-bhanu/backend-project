// wrapper function that is going to be used everywhere.
const asyncHandler = (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).
        catch((err) => next(err));
    }
}


export {asyncHandler};


/* same code with async await instead of promises
higher order function, with a function as an input,

1>const asyncHandler = () => {}
2>const asyncHandler = (func) => {() => {}}
not just remove the {} ,so we have finally,
3>const asyncHandler = (func) => () => {}
if you want to make it async, it'll be
const asyncHandler = (func) => async() => {}
*/

// const asyncHandler = (fn) => async(req,res,next) => {
//     try {
//         await fn(req,res,next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })        
//     }
// }


