type PictureDataType = {
    height: number;
    is_silhouette: boolean;
    url: string;
    width: number;
}

export class FacebookProfile {
    id: string;
    last_name: string;
    picture: {
        data: PictureDataType
    };
    first_name: string;
    name: string;
    email: string;
}