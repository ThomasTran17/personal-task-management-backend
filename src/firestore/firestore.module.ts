import { Module } from '@nestjs/common';
import { firestoreProviders } from './firestore.providers';

@Module({
  providers: [...firestoreProviders],
  exports: [...firestoreProviders],
})
export class FirestoreModule {}
