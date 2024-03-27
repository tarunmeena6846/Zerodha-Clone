// src/app.ts
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import protfolioRoute from "./routes/portfoliRoute";
import authRoutes from "./routes/authRoutes";

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URL || "", {
    dbName: "stockExchange",
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use("/auth", authRoutes);
app.use("/portfolio", protfolioRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
