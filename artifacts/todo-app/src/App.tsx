import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "./components/layout";
import { HomePage } from "./pages/home";
import { StatsPage } from "./pages/stats";
import { CalendarPage } from "./pages/calendar";
import { LoginPage } from "./pages/login";
import { RegisterPage } from "./pages/register";
import { AuthProvider } from "./context/auth-context";
import { ProtectedRoute, PublicOnlyRoute } from "./components/protected-route";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/login">
          {() => <PublicOnlyRoute component={LoginPage} />}
        </Route>
        <Route path="/register">
          {() => <PublicOnlyRoute component={RegisterPage} />}
        </Route>
        <Route path="/">
          {() => <ProtectedRoute component={HomePage} />}
        </Route>
        <Route path="/stats">
          {() => <ProtectedRoute component={StatsPage} />}
        </Route>
        <Route path="/calendar">
          {() => <ProtectedRoute component={CalendarPage} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
