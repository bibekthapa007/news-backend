import 'dotenv/config';
import app from './app';
import Logger from './utils/Logger';
import connect from './utils/mongodb';

const port = process.env.port;
app.listen(port, async () => {
  Logger.info(`Server started running on port ${port}`);
  await connect();
});

process.on('uncaughtException', error => {
  Logger.error('uncaughtException', error);
});

process.on('unhandledRejection', error => {
  Logger.error('unhandledRejection', error);
});
