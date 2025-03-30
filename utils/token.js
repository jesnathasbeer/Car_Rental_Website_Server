import jwt from 'jsonwebtoken'

export const generateToken = (id,role)=>{
    try {

        const token  = jwt.sign({id,role},process.env.JWT_SECRET_KEY) // 7days expiry in resetting password
        return token

        
    } catch (error) {
        console.log(error);
        
        
    }
}

// //✅ Verify Token (for password reset & authentication)
// export const verifyToken = (token) => {
//     try {
//         return jwt.verify(token, process.env.JWT_SECRET_KEY);
//     } catch (error) {
//         return null; // Return null if token is invalid or expired
//     }
// };

// id  and role ======  dkflahdkfaldfodisfklfsodlkhogsodksldkglkdghslkgslkdghskldgskdhgs