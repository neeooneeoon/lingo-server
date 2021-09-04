import { google } from 'googleapis';
import * as serviceAccount from '../keys/google_service_account.json';

export class GoogleAuthorization {
  public static async authorize() {
    const scopes = [
      'https://spreadsheets.google.com/feeds',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive',
    ];
    const clientEmail = serviceAccount.client_email;
    const privateKey = serviceAccount.private_key;

    const client = new google.auth.JWT(clientEmail, null, privateKey, scopes);
    await client.authorize(async (err, token) => {
      if (err) throw err;
      if (token) {
        console.log('Authorized.');
      }
    });
    return client;
  }
}
