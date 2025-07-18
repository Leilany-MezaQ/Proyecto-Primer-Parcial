import type { JSX } from 'react';
import OrdersTable from '../modules/order/OrderTable';
import UserForm from '../modules/user/UserForm';
import UsersTable from '../modules/user/UserTable';
import ProductsTable from '../modules/product/ProductTable';

export interface AppRoute{
    path: string;
    element: JSX.Element;
    label?: string;
    icon?: string;
    allowedRoles?: string[];
    //roleIds?: string[];
    //hidden?: boolean;
}

const routes: AppRoute[] = [
  {
    path: '/dashboard',
    element: <UserForm />,
    label: 'Inicio',
    icon: 'HomeOutlined',
    allowedRoles: ['admin', 'usuario']
  },
  {
    path: '/users',
    element: <UsersTable />,
    label: 'Usuarios',
    icon: 'UserOutlined',
    allowedRoles: ['admin']
  },
  {
    path: '/products',
    element: <ProductsTable />,
    label: 'Productos',
    icon: 'UserOutlined',
    allowedRoles: ['admin', 'editor']
  },
  {
    path: '/orders',
    element: <OrdersTable />,
    label: 'Órdenes',
    icon: 'UserOutlined',
    allowedRoles: ['admin', 'editor']
  },
  {
    path: '/report',
    element: <UserForm />,
    label: 'Reportes',
    icon: 'UserOutlined',
    allowedRoles: ['usuario']
  }
];

export default routes;