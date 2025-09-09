"use client";

import { logout } from "@/actions/logout";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";

const SettingsPage = () => {
  const user = useCurrentUser();

  const onClick = () => {
    logout();
  };

  return (
    <div>
      {JSON.stringify(user)}
      <form>
        <Button onClick={onClick} type="button">
          Sign out
        </Button>
      </form>
    </div>
  );
};

export default SettingsPage;
