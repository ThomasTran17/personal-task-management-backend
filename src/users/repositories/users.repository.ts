import { Injectable, Inject } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class UsersRepository {
  private readonly collectionName = 'users';

  constructor(@Inject('FIRESTORE_DB') private db: Firestore) {}

  /**
   * Create a new user
   */
  async create(userData: Omit<IUser, 'id'>): Promise<IUser> {
    const docRef = this.db.collection(this.collectionName).doc();
    const userWithTimestamp = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await docRef.set(userWithTimestamp);
    return { id: docRef.id, ...userWithTimestamp };
  }

  /**
   * Get all users
   */
  async findAll(): Promise<IUser[]> {
    const snapshot = await this.db.collection(this.collectionName).get();
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as IUser,
    );
  }

  /**
   * Get user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    const doc = await this.db.collection(this.collectionName).doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...doc.data(),
    } as IUser;
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as IUser;
  }

  /**
   * Update user
   */
  async update(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    const docRef = this.db.collection(this.collectionName).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    const updateData = {
      ...userData,
      updatedAt: new Date(),
    };

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as IUser;
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    const docRef = this.db.collection(this.collectionName).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return false;
    }

    await docRef.delete();
    return true;
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const snapshot = await this.db
      .collection(this.collectionName)
      .where('email', '==', email)
      .limit(1)
      .get();

    return !snapshot.empty;
  }
}
