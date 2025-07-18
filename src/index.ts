import express from 'express';
import morgan from 'morgan';
import routes from './routes/routes';
import connectDB from './config/bd';
import cors from 'cors';

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// Configuración de CORS:
//  - origin: permite sólo los orígenes que declares
//  - credentials: true si vas a enviar cookies / cabeceras de autenticación
const corsOptions: cors.CorsOptions = {
  origin: [
    'https://front-production-09a4.up.railway.app',
    'http://front-production-09a4.up.railway.app',
  ],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));
app.use('/app', routes);

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
