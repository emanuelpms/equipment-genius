import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Login });

function Login() {
  return <Navigate to="/admin" />;
}
