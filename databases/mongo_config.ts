import mongoose, { Mongoose } from 'mongoose';
import { errormessage, info } from '../ansi-colors-config';

async function mongoConnect() {
  try {
        await mongoose.connect(process.env.MONGODB_LOCAL_URL as string || process.env.MONGODB_SERVERLESS_URL as string, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        } as any);
        console.log(info('Connected to MongoDB!'));
        return mongoose;
    } catch (err) {
        console.error(errormessage(`'Error connecting to MongoDB: ${err}`));
        throw err;
    }
}

export { mongoConnect };
