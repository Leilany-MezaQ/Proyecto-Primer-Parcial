import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    const mongoUrl = process.env.MONGO_URI || 'mongodb://mongo:NXUPizclafGNyPxxldKqkYoYMFqiMtcS@centerbeam.proxy.rlwy.net:43919';
  try {
    await mongoose.connect(mongoUrl);
    console.log('MongoDB connectado correctamente');
  } catch (error) {
    console.error('Error al conectar mongo:', error);
  }
};

export default connectDB