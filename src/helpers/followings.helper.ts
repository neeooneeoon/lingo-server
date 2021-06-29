import { SearchUser } from "@dto/user";

export class FollowingsHelper {

    public mapToFollowingResult(listFollowings: string[], searchUserResult: SearchUser[]) {
        const result =  searchUserResult.map(user => {
            const userId = String(user.userId);
            if (listFollowings.includes(userId)) {
                return {
                    ...user,
                    followed: true
                }
            }
            else {
                return {
                    ...user,
                    followed: false
                }
            }
        });
        return result;
    }

}