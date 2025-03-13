// import { createClient } from '@supabase/supabase-js';
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// dotenv.config();

// Will uncomment these later once the supabase SQL database is configured.
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;

// export const supabase = createClient(supabaseUrl, supabaseKey);


// ------------ << MONGO DATABASE for RESUMES>> --------------

// const connectDB = () => {
//   mongoose
//     .connect(process.env.MONGODB_URI, {})
//     .then(() => console.log("🏪 Connected to Mongo Resume Database."))
//     .catch((error) => {
//       console.error("❌🏪 Unable to connect to Mongo Resume Database: ", error.message);
//       process.exit(1);
//     });
// };

// export default connectDB;

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Connected to Local MongoDB"))
    .catch((error) => {
      console.error("❌ MongoDB Connection Error:", error.message);
      process.exit(1);
    });
};

export default connectDB;