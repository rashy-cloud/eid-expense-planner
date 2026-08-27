import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});


// Attach access token to every request
API.interceptors.request.use(
    (config) => {
        const accessToken =
            localStorage.getItem(
                "accessToken"
            );

        if (accessToken) {
            config.headers.Authorization =
                `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Automatically refresh expired access token
API.interceptors.response.use(
    (response) => {
        return response;
    },

    async (error) => {
        const originalRequest =
            error.config;

        const status =
            error.response?.status;

        const refreshToken =
            localStorage.getItem(
                "refreshToken"
            );


        // Only try refreshing once
        if (
            (status === 401 ||
                status === 403) &&
            refreshToken &&
            !originalRequest._retry
        ) {
            originalRequest._retry =
                true;

            try {
                const response =
                    await axios.post(
                        "http://127.0.0.1:8000/api/accounts/refresh/",
                        {
                            refresh:
                                refreshToken,
                        }
                    );

                const newAccessToken =
                    response.data.access;


                // Save new access token
                localStorage.setItem(
                    "accessToken",
                    newAccessToken
                );


                // Update request header
                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;


                // Retry original request
                return API(
                    originalRequest
                );

            } catch (
                refreshError
            ) {
                console.error(
                    "Token refresh failed:",
                    refreshError
                );


                // Refresh token has also expired
                localStorage.removeItem(
                    "accessToken"
                );

                localStorage.removeItem(
                    "refreshToken"
                );


                // Send user back to login
                window.location.href =
                    "/login";


                return Promise.reject(
                    refreshError
                );
            }
        }


        return Promise.reject(
            error
        );
    }
);


export default API;