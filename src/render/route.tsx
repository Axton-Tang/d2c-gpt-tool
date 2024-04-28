import { HomeOutlined, SettingOutlined, BookOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Home from "./pages/home";
import Configuration from "./pages/configuration";
import Document from "./pages/document";

const routes = [
  {
    path: "/",
    icon: <HomeOutlined rev={undefined} />,
    label: <Link to="/">首页</Link>,
    element: <Home />,
  },
  {
    path: "/document",
    icon: <BookOutlined rev={undefined} />,
    label: <Link to="/document">文档</Link>,
    element: <Document />,
  },
]

export default routes