import { useState } from "react";

import { DashboardFilterContext } from "./dashboardFilterCtx";

export function DashboardFilterProvider({ children }) {
  const [days, setDays] = useState(30);

  return (
    <DashboardFilterContext.Provider value={{ days, setDays }}>
      {children}
    </DashboardFilterContext.Provider>
  );
}
