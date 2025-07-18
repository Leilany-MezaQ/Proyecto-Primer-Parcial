import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, UserOutlined, BarChartOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { useAuth } from '@/auth/AuthContext';

const Icons = {
  DashboardOutlined,
  UserOutlined,
  BarChartOutlined,
};

interface MenuItem {
  _id: string;
  title: string;
  path: string;
  icon: keyof typeof Icons;
  roles: { type: string }[];
}

const MenuDynamic = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getMenusByRoleUrl = import.meta.env.VITE_MENU_ROL;

  useEffect(() => {
    const fetchMenus = async () => {
      if (!user?.roles || user.roles.length === 0) return;

      const roles = user.roles.map(role => role.type); // ["admin", "editor"]

      try {
        const response = await fetch(`${getMenusByRoleUrl}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ roles })
        });

        if (!response.ok) {
          console.error("Error al obtener menús:", await response.text());
          return;
        }

        const menuList: MenuItem[] = await response.json();
        setMenuItems(menuList);
      } catch (error) {
        console.error("Error al obtener menús por roles:", error);
      }
    };

    fetchMenus();
  }, [user]);

  const renderMenu = () => {
    return menuItems.map(item => {
      const IconComponent = Icons[item.icon];
      return {
        key: item.path,
        icon: IconComponent ? <IconComponent /> : null,
        label: item.title,
      };
    });
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      onClick={({ key }) => navigate(key)}
      items={renderMenu()}
      style={{ height: '100%', borderRight: 0 }}
    />
  );
};

export default MenuDynamic;
