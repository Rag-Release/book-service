import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";
import { Book } from "../entities/Book";
import { Author } from "../entities/Author";
import { Payment } from "../entities/Payment";
import { Feedback } from "../entities/Feedback";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "book_service",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [Book, Author, Payment, Feedback],
  migrations: [path.join(__dirname, "../migrations/**/*.{ts,js}")],
  subscribers: [path.join(__dirname, "../subscribers/**/*.{ts,js}")],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};
