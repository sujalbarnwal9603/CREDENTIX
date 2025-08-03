import ApiError from "../utils/ApiError.js";

const authorizeRoles=(...allowedRoles)=>{
    return (req, res, next)=>{
        const userRole= req.user?.role?.name; // Assuming req.user is populated with user data
        if(!userRole){
            throw new ApiError(402, "User role is not defined");
        }

        if(!allowedRoles.includes(userRole)){
            throw new ApiError(403, "Access denied. Insufficient Role permissions.");
        }

        next();
    };
};


export default authorizeRoles;

