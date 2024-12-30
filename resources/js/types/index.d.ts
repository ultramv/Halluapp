export interface Role {
    id: number;
    name: string;
    slug: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    roles: Role[];
}

export interface AppInfo {
    canLogin: boolean;
    canRegister: boolean;
    laravelVersion: string | null;
    phpVersion: string | null;
}

export interface Auth {
    user: User;
}

export interface PageProps {
    auth: Auth;
    currentRoute?: string;
    appInfo: AppInfo;
}
