// frontend/src/services/auth/register.js
import api from "./client";

export const register = ({
                             email,
                             password,
                             firstname,
                             lastname,
                             phone,
                             sector,
                         }) => {
    return api
        .post("/api/auth/register", {
            email,
            password,
            firstname,
            lastname,
            phone,
            sector,
        })
        .then((res) => res.data);
};
