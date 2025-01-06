import 'express-session';

declare module 'express-session' {
    interface SessionData {
        pendingRegistration: {
            username: string;
            email: string;
            password: string;
            state: string;
        };
    }
}