import express from 'express';
import { login, getTimeToken, updateToken } from '../controllers/auth.controller';
import { getAllUsers, saveUsers, updateUser, deleteUser } from '../controllers/usercrud';
import { getAllProducts, saveProduct, updateProduct, deleteProduct } from '../controllers/productos';
import { crearOrden, obtenerOrdenes, obtenerOrdenPorId, actualizarOrden, eliminarOrden } from '../controllers/orderController';
import { getRoles, createRole } from '../controllers/roles';
import { getMenus, getMenuByRol, createMenu, updateMenu, deleteMenu } from '../controllers/menuController';

const routes = express.Router();

routes.post('/login', login as express.RequestHandler);
routes.get('/getTimeToken', getTimeToken as express.RequestHandler);
routes.patch('/updateToken/:userId', updateToken as express.RequestHandler);
routes.get('/users', getAllUsers);
routes.post('/users', saveUsers);
routes.put('/updateUser/:id', updateUser);
routes.delete('/deleteU/:id', deleteUser);

// Productos
routes.get('/getProducts', getAllProducts);
routes.post('/products', saveProduct);
routes.put('/updateProduct/:id', updateProduct);
routes.delete('/deleteProduct/:id', deleteProduct);

// Ordenes
routes.get('/orders', obtenerOrdenes);
routes.post('/orders', crearOrden);
routes.get('/order/:id', obtenerOrdenPorId);
routes.put('/updateOrder/:id', actualizarOrden);
routes.delete('/deleteOrder/:id', eliminarOrden);

// Roles
routes.get("/roles", getRoles);
routes.post("/roles", createRole);

// Menus
routes.get("/menus", getMenus);
routes.post("/menusbyrol", getMenuByRol);
routes.post("/menus", createMenu);
routes.put("/menus/:id", updateMenu);
routes.delete("/menu/:id", deleteMenu);


export default routes;