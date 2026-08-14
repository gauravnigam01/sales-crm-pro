import { useContext } from "react";

import { DashboardFilterContext } from "../context/dashboardFilterCtx";

export function useDashboardFilter() {
  return useContext(DashboardFilterContext);
}
