import { Building2, FileText, LayoutDashboard, Users } from "lucide-react";

export const navigationPages = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    name: "Clients",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    name: "Business Profile",
    href: "/dashboard/profile",
    icon: Building2,
  },
];
