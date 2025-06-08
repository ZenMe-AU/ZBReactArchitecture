import { renderApp } from "@zenmechat/shared-ui/main.tsx";
import { AppRouter } from "@zenmechat/shared-ui/Router.tsx";
import { publicRoutes, protectedRoutes } from "./Router";

renderApp(<AppRouter publicRoutes={publicRoutes} protectedRoutes={protectedRoutes} />);
