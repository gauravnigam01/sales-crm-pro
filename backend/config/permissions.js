// ======================================
// Permission Categories (for UI grouping)
// ======================================

export const PERMISSION_CATEGORIES = [
  {
    key: "leads",
    label: "Leads",
    permissions: [
      { key: "viewLeads", label: "View Leads" },
      { key: "createLead", label: "Add Lead" },
      { key: "editLead", label: "Edit Lead" },
      { key: "deleteLead", label: "Delete Lead" },
    ],
  },
  {
    key: "customers",
    label: "Customers",
    permissions: [
      { key: "viewCustomers", label: "View Customers" },
      { key: "createCustomer", label: "Add Customer" },
      { key: "editCustomer", label: "Edit Customer" },
      { key: "deleteCustomer", label: "Delete Customer" },
    ],
  },
  {
    key: "deals",
    label: "Deals",
    permissions: [
      { key: "viewDeals", label: "View Deals" },
      { key: "createDeal", label: "Add Deal" },
      { key: "editDeal", label: "Edit Deal" },
      { key: "deleteDeal", label: "Delete Deal" },
    ],
  },
  {
    key: "tasks",
    label: "Tasks",
    permissions: [
      { key: "viewTasks", label: "View Tasks" },
      { key: "createTask", label: "Add Task" },
      { key: "editTask", label: "Edit Task" },
      { key: "deleteTask", label: "Delete Task" },
    ],
  },
  {
    key: "documents",
    label: "Documents",
    permissions: [
      { key: "viewDocuments", label: "View Documents" },
      { key: "uploadDocument", label: "Upload Document" },
      { key: "deleteDocument", label: "Delete Document" },
    ],
  },
  {
    key: "calendar",
    label: "Calendar",
    permissions: [
      { key: "viewCalendar", label: "View Calendar" },
      { key: "manageCalendar", label: "Manage Events" },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    permissions: [{ key: "viewReports", label: "View Reports" }],
  },
  {
    key: "users",
    label: "Users",
    permissions: [{ key: "manageUsers", label: "Manage Users" }],
  },
];

export const PERMISSION_KEYS = PERMISSION_CATEGORIES.flatMap((cat) =>
  cat.permissions.map((p) => p.key)
);

// ======================================
// Role Templates
// ======================================

const allTrueExcept = (falseKeys) =>
  Object.fromEntries(
    PERMISSION_KEYS.map((key) => [key, !falseKeys.includes(key)])
  );

const onlyTrue = (trueKeys) =>
  Object.fromEntries(
    PERMISSION_KEYS.map((key) => [key, trueKeys.includes(key)])
  );

export const ROLE_TEMPLATES = {
  "Manager (Full Access)": {
    role: "manager",
    permissions: allTrueExcept(["manageUsers"]),
  },

  "Manager (Standard)": {
    role: "manager",
    permissions: allTrueExcept([
      "deleteLead",
      "deleteCustomer",
      "deleteDeal",
      "deleteTask",
      "deleteDocument",
      "manageUsers",
    ]),
  },

  // Note: Deals/Pipeline, Reports/Analytics and Team/Users are hard-blocked
  // for the caller role at the route level regardless of these toggles —
  // they're intentionally left out of both caller templates below so the
  // permissions UI doesn't imply they're grantable.
  "Caller (Standard)": {
    role: "caller",
    permissions: onlyTrue([
      "viewLeads",
      "createLead",
      "viewCustomers",
      "createCustomer",
      "viewTasks",
      "viewDocuments",
      "uploadDocument",
      "viewCalendar",
      "manageCalendar",
    ]),
  },

  "Caller (View Only)": {
    role: "caller",
    permissions: onlyTrue([
      "viewLeads",
      "viewCustomers",
      "viewTasks",
      "viewDocuments",
      "viewCalendar",
    ]),
  },
};

// ======================================
// Default Permissions By Role (used on user creation)
// ======================================

export const getDefaultPermissions = (role) => {
  if (role === "admin") {
    return onlyTrue(PERMISSION_KEYS);
  }

  if (role === "manager") {
    return ROLE_TEMPLATES["Manager (Standard)"].permissions;
  }

  return ROLE_TEMPLATES["Caller (Standard)"].permissions;
};
