import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    const mongoUrl = process.env.MONGO_URI || "mongodb://mongo:AeZZCvNEMrPtjhVqUKbvAZgtXbdWPDeP@nozomi.proxy.rlwy.net:16114";
  try {
    await mongoose.connect(mongoUrl);
    console.log('MongoDB connectado correctamente');
  } catch (error) {
    console.error('Error al conectar mongo:', error);
  }
};

export default connectDB
