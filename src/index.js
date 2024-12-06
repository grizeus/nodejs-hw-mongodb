import { initMongoConnection } from "./db/initMongoConnection.js";
import { setupServer } from "./server.js";


const runner = async () => {
  await initMongoConnection();
  setupServer();
};

runner();