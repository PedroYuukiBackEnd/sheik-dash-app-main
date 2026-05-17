import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile/MobileShell";
import { requireAuth } from "@/lib/auth";

export const Route = createFileRoute("/mecanico")({
  beforeLoad: () => requireAuth(),
  component: () => (
    <MobileShell>
      <Outlet />
    </MobileShell>
  ),
});
