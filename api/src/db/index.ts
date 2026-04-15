import mongoose from 'mongoose';
import { DB_NAME, MONGO_URI } from '#config';

try {
  const client = await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log(`Connected to MongoDB @ ${client.connection.host} - ${client.connection.name}`);
} catch (error) {
  console.log(error);
  process.exit(1);
}
