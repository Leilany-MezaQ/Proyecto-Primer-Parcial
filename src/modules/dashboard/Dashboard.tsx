import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import MenuDynamic from "./MenuDynamic"; 

const { Header, Content, Footer, Sider } = Layout;

function Dashboard() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={200}>
        <MenuDynamic />
      </Sider>

      <Layout>
        <Header>Header</Header>
        <Content style={{ margin: "24px 16px 0", padding: 24, background: "#fff", minHeight: 280 }}>
          <Outlet />
        </Content>
        <Footer>Footer</Footer>
      </Layout>
    </Layout>
  );
}

export default Dashboard;
