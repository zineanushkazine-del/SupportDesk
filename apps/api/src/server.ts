import { env } from "./env";
import app from "./app";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`SupportDesk API is running on http://localhost:${PORT}`);
  console.log("Database URL:", env.DATABASE_URL ? "Loaded" : "Missing");
});