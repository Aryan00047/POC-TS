// import mongoose from "mongoose";
// import { GridFSBucket } from "mongodb";

// // Ensure mongoose is connected before accessing GridFS
// const db = mongoose.connection;

// let gridFSBucket: GridFSBucket;

// // Initialize GridFSBucket once the database connection is open
// db.once("open", () => {
//   gridFSBucket = new GridFSBucket(db.db, { bucketName: "resumes" });
//   console.log("GridFS initialized successfully");
// });

// export { gridFSBucket };

import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

const db = mongoose.connection;
let gridFSBucket: GridFSBucket | null = null;

// Ensure GridFS is initialized after DB connection is established
db.once("open", () => {
  gridFSBucket = new GridFSBucket(db.db, { bucketName: "resumes" });
  console.log("GridFS initialized successfully");
});

// Function to get GridFSBucket safely
export const getGridFSBucket = (): GridFSBucket => {
  if (!gridFSBucket) {
    throw new Error("GridFSBucket is not initialized yet");
  }
  return gridFSBucket;
};
