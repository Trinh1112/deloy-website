import * as React from "react";
import {
  ChefHat,
  Command,
  LandPlot,
  ListOrdered,
  SquareMenu,
  Table,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "User Management",
      url: "/admin/users",
      icon: Users,
      isActive: true,
    },
    {
      title: "Menu Management",
      url: "/admin/menus",
      icon: SquareMenu,
    },
    {
      title: "Table Management",
      url: "/admin/tables",
      icon: Table,
    },
    {
      title: "Product Management",
      url: "/admin/products",
      icon: ChefHat,
    },
    {
      title: "Reservation Management",
      url: "/admin/reservations",
      icon: LandPlot,
    },
    {
      title: "Order Management",
      url: "/admin/orders",
      icon: ListOrdered,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navItems = data.navMain.map((item) => ({
    ...item,
    isActive: location.pathname === item.url,
  }));

  return (
    <Sidebar 
      variant="inset" 
      className=""
      {...props}
    >
      <SidebarHeader className="bg-purple-800/30 border-b border-purple-600/50 ">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              asChild
              className="hover:bg-purple-600/30 transition-all duration-300 rounded-xl"
            >
              <a href="#">
                <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-purple-500  shadow-lg">
                  <Command className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-4">
                  <span className="truncate font-bold text-white">Coffee Shop</span>
                  <span className="truncate text-xs text-purple-200">Admin</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="py-3">
        <NavMain 
          items={navItems.map(item => ({
            ...item,
            className: `hover:bg-purple-600/20 hover:text-purple-100 transition-all duration-300 rounded-lg mx-3 py-2 ${
              item.isActive ? 'bg-purple-600/30 text-purple-100 shadow-sm' : 'text-purple-300'
            }`
          }))} 
        />
      </SidebarContent>
      <SidebarFooter className="bg-purple-800/30 border-t border-purple-600/50 p-4">
        <NavUser 
          user={data.user} 
        />
      </SidebarFooter>
    </Sidebar>
  );
}