import type { Metadata } from "next";
import { DashboardView } from "../components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Manage your account, review session security, and change your password.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
