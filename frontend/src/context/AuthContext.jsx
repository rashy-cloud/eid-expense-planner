import {
    createContext,
    useContext,
    useState,
} from "react";

import API from "../services/api";

const AuthContext = createContext();


export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);


    const login = async (
        username,
        password
    ) => {
        const response = await API.post(
            "/accounts/login/",
            {
                username,
                password,
            }
        );

        const access =
            response.data.access;

        const refresh =
            response.data.refresh;


        if (!access) {
            throw new Error(
                "No access token returned by Django."
            );
        }


        localStorage.setItem(
            "accessToken",
            access
        );


        if (refresh) {
            localStorage.setItem(
                "refreshToken",
                refresh
            );
        }


        setUser({
            username,
        });


        return response.data;
    };


    const logout = () => {
        localStorage.removeItem(
            "accessToken"
        );

        localStorage.removeItem(
            "refreshToken"
        );

        setUser(null);
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    return useContext(
        AuthContext
    );
}