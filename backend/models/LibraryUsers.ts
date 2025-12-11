/***********************
 * LibraryUsers.ts - Library User Model
 * Represents a library user
 * Includes methods to hash and check passwords and load the library user from the database
 ***********************/
import bcrypt from "bcrypt";
import db from "../config/database";

// Class representing a library user
export class LibraryUser {
  // Class variables
  id: number;
  name: string;
  email: string;
  password: string;
  userRole: string;

  // Constructor to initialize a LibraryUser
  constructor(
    id: number,
    name: string,
    email: string,
    password: string,
    userRole: string
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.userRole = userRole; // default role
  }

  // Method to hash the user's password
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Method to check if a given password matches the stored hashed password
  async checkPassword(plain: string) {
    return bcrypt.compare(plain, this.password);
  }

  /***********************
   * Load function to get LibraryUser by ID
   * @param userId
   * @returns LibraryUser
   **********************/
static async load(userId: number) {
  const result = await db.query("SELECT * FROM library_users WHERE user_id=$1", [
    userId,
  ]);

  const row = result.rows[0];
  if (!row) {
    // No user found
    return null;
  }

  return new LibraryUser(
    row.user_id,
    row.full_name,
    row.email,
    row.password_hash,
    row.user_role
  );
}
};