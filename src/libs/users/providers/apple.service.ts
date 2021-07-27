import { Injectable, ForbiddenException } from '@nestjs/common';
import * as appleSignin from 'apple-signin';

@Injectable()
export class AppleService {
  public getHello(): string {
    return 'Hello World dfs!';
  }

  public async verifyUser(payload: any): Promise<any> {
    const clientSecret = appleSignin.getClientSecret({
      clientID: 'com.saokhuee.lingo-api',
      teamId: 'APMP77F354',
      keyIdentifier: '7S9FN3MVP6',
      privateKeyPath: 'src/utils/keys/AuthKey_7S9FN3MVP6.p8',
    });

    const tokens = await appleSignin.getAuthorizationToken(payload.code, {
      clientID: 'com.saokhuee.lingo-api',
      clientSecret: clientSecret,
      redirectUri: 'https://lingo-test.saokhuee.com/apple/redirect',
    });

    if (!tokens.id_token) {
      console.log('no token.id_token');
      throw new ForbiddenException();
    }

    console.log('tokens', tokens);

    // TODO: AFTER THE FIRST LOGIN APPLE WON'T SEND THE USERDATA ( FIRST NAME AND LASTNAME, ETC.) THIS SHOULD BE SAVED ANYWHERE

    const data = await appleSignin.verifyIdToken(tokens.id_token);
    return { data, tokens };
  }
}
