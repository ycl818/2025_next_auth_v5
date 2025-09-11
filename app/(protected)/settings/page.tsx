"use client";

import { useCurrentUser } from "@/hooks/use-current-user";

const SettingsPage = () => {
  const user = useCurrentUser();

  return <div>{JSON.stringify(user)}</div>;
};

export default SettingsPage;
