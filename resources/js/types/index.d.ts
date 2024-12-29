export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
}

export interface AppInfo {
    canLogin: boolean;
    canRegister: boolean;
    laravelVersion: string | null;
    phpVersion: string | null;
}

export interface PageProps {
    auth: {
        user: User | null;
    };
    currentRoute?: string;
    appInfo: AppInfo;
}
