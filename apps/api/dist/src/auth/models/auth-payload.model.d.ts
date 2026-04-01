import { UserModel } from './user.model';
export declare class AuthPayloadModel {
    accessToken: string;
    permissions: string[];
    user: UserModel;
}
