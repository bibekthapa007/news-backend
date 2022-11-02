import mongoose from 'mongoose';
import Logger from './Logger';

async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_CONNECT_URL as string, {
      // retryWrites: true,
      // w: 'majority',
    });
    Logger.info('Database Connection has been established successfully.');
  } catch (error) {
    Logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

export default connect;
