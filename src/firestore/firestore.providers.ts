import * as admin from 'firebase-admin';
import * as path from 'path';
// import { Firestore } from '@google-cloud/firestore';

export const FirestoreDatabaseProvider = 'FIRESTORE_DB';
export const FirestoreOptionsProvider = 'FIRESTORE_OPTIONS';

export const firestoreProviders = [
  {
    provide: FirestoreDatabaseProvider,
    useFactory: () => {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(
            path.join(process.cwd(), 'firebase-adminsdk.json'),
          ),
        });
      }
      return admin.firestore();
    },
  },
];
