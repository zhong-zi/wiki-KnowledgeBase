import { useAppVersion } from "@/features/workspace/queries/workspace-query.ts";
import { isCloud } from "@/lib/config.ts";
import classes from "@/components/settings/settings.module.css";
import { Text } from "@mantine/core";
import React from "react";

export default function AppVersion() {
  const { data: appVersion } = useAppVersion(!isCloud());
  const version = appVersion?.currentVersion || "1.0.0";

  return (
    <div className={classes.text}>
      <Text size="sm" c="dimmed" mr={45}>
        v{version}
      </Text>
    </div>
  );
}
