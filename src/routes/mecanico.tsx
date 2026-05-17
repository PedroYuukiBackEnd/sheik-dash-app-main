import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile/MobileShell";

export const Route = createFileRoute("/mecanico")({
  component: () => (
    <MobileShell>
      <Outlet />
    </MobileShell>
  ),
});
