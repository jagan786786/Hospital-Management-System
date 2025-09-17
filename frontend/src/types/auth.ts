// Payload sent to login endpoint
export interface LoginPayload {
    identifier: string; // email or phone
    password: string;
}

// Response received from login endpoint
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    role: string;
    name: string;
    type: "employee" | "patient";
}
