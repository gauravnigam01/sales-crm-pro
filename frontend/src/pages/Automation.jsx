import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  MdBolt,
  MdRocketLaunch,
  MdChatBubble,
  MdDelete,
  MdWarning,
  MdPersonPinCircle,
  MdNotificationsActive,
  MdAdd,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

import {
  getAutomationSettings,
  getAutomationStats,
  toggleRoundRobin,
  updateInactivityDays,
  addSourceRule,
  toggleSourceRule,
  deleteSourceRule,
  addTriggerRule,
  toggleTriggerRule,
  deleteTriggerRule,
  getInactiveLeads,
} from "../services/automationService";
import { getAllUsers } from "../services/userService";
import ConfirmDialog from "../components/ConfirmDialog";

import "../styles/Automation.css";

const SOURCES = [
  "Meta Ads",
  "Google Ads",
  "Website",
  "WhatsApp",
  "Referral",
  "Manual",
];

const TRIGGER_LABELS = {
  newLead: "New Lead Added",
  hotLead: "Lead Becomes Hot",
};

const ACTION_LABELS = {
  whatsapp: "Send WhatsApp",
  managerAlert: "Manager Alert",
};

function Automation() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState({
    activeRulesCount: 0,
    totalTriggered: 0,
    waSentCount: 0,
  });
  const [callers, setCallers] = useState([]);
  const [inactiveLeads, setInactiveLeads] = useState([]);

  const [inactivityDays, setInactivityDays] = useState(3);
  const [savingDays, setSavingDays] = useState(false);
  const [togglingRR, setTogglingRR] = useState(false);

  const [newSource, setNewSource] = useState(SOURCES[0]);
  const [newAssignee, setNewAssignee] = useState("");
  const [addingRule, setAddingRule] = useState(false);

  const [showAddAutomation, setShowAddAutomation] = useState(false);
  const [newAutomation, setNewAutomation] = useState({
    name: "",
    trigger: "newLead",
    action: "whatsapp",
    messageTemplate: "",
  });
  const [addingAutomation, setAddingAutomation] = useState(false);

  const [loading, setLoading] = useState(true);

  const [confirmModal, setConfirmModal] = useState(null);

  const loadAll = async () => {
    try {
      const [settingsRes, statsRes, usersRes, inactiveRes] =
        await Promise.all([
          getAutomationSettings(),
          getAutomationStats(),
          getAllUsers(),
          getInactiveLeads(),
        ]);

      setSettings(settingsRes.settings);
      setStats(statsRes.stats);
      setInactivityDays(settingsRes.settings.inactivityDays);

      setCallers(
        usersRes.users.filter(
          (u) => u.role === "caller" && u.status === "active"
        )
      );

      setInactiveLeads(inactiveRes.leads);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await loadAll();
    })();
  }, []);

  const refreshStats = async () => {
    try {
      const res = await getAutomationStats();
      setStats(res.stats);
    } catch (error) {
      console.log(error);
    }
  };

  const handleToggleRoundRobin = async () => {
    setTogglingRR(true);

    try {
      const res = await toggleRoundRobin();
      setSettings((prev) => ({
        ...prev,
        roundRobinEnabled: res.roundRobinEnabled,
      }));
      await refreshStats();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Update");
    }

    setTogglingRR(false);
  };

  const handleSaveInactivityDays = async (e) => {
    e.preventDefault();

    setSavingDays(true);

    try {
      const res = await updateInactivityDays(Number(inactivityDays));
      setSettings((prev) => ({
        ...prev,
        inactivityDays: res.inactivityDays,
      }));

      const inactiveRes = await getInactiveLeads();
      setInactiveLeads(inactiveRes.leads);

      toast.success("Inactivity Threshold Updated");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Update");
    }

    setSavingDays(false);
  };

  const handleAddRule = async (e) => {
    e.preventDefault();

    if (!newAssignee) {
      toast.error("Select a caller to assign this source to");
      return;
    }

    setAddingRule(true);

    try {
      const res = await addSourceRule(newSource, newAssignee);
      setSettings(res.settings);
      setNewAssignee("");
      await refreshStats();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Add Rule");
    }

    setAddingRule(false);
  };

  const handleToggleRule = async (ruleId) => {
    try {
      await toggleSourceRule(ruleId);

      const res = await getAutomationSettings();
      setSettings(res.settings);
      await refreshStats();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Update Rule");
    }
  };

  const handleDeleteRule = (ruleId) => {
    setConfirmModal({
      title: "Delete Assignment Rule",
      message: "Are you sure you want to delete this assignment rule?",
      onConfirm: async () => {
        try {
          await deleteSourceRule(ruleId);

          const res = await getAutomationSettings();
          setSettings(res.settings);
          await refreshStats();
        } catch (error) {
          console.log(error);
          toast.error(error.response?.data?.message || "Failed to Delete Rule");
        }

        setConfirmModal(null);
      },
    });
  };

  const handleAddAutomation = async (e) => {
    e.preventDefault();

    if (!newAutomation.name || !newAutomation.messageTemplate) {
      toast.error("Name and Message Template are Required");
      return;
    }

    setAddingAutomation(true);

    try {
      const res = await addTriggerRule(
        newAutomation.name,
        newAutomation.trigger,
        newAutomation.action,
        newAutomation.messageTemplate
      );

      setSettings(res.settings);
      setNewAutomation({
        name: "",
        trigger: "newLead",
        action: "whatsapp",
        messageTemplate: "",
      });
      setShowAddAutomation(false);
      await refreshStats();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Add Automation");
    }

    setAddingAutomation(false);
  };

  const handleToggleAutomation = async (ruleId) => {
    try {
      await toggleTriggerRule(ruleId);

      const res = await getAutomationSettings();
      setSettings(res.settings);
      await refreshStats();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to Update Automation");
    }
  };

  const handleDeleteAutomation = (ruleId) => {
    setConfirmModal({
      title: "Delete Automation",
      message: "Are you sure you want to delete this automation?",
      onConfirm: async () => {
        try {
          await deleteTriggerRule(ruleId);

          const res = await getAutomationSettings();
          setSettings(res.settings);
          await refreshStats();
        } catch (error) {
          console.log(error);
          toast.error(error.response?.data?.message || "Failed to Delete Automation");
        }

        setConfirmModal(null);
      },
    });
  };

  if (loading || !settings) {
    return (
      <div className="automation-page">
        <p>Loading Automation Settings...</p>
      </div>
    );
  }

  return (
    <div className="automation-page">
      <div className="page-header">
        <h1>
          <MdBolt /> Automation
        </h1>
        <p>Automatically handle leads — assignment, alerts, WhatsApp.</p>
      </div>

      {/* Stats */}
      <div className="auto-stats-row">
        <div className="auto-stat-card green">
          <MdBolt className="auto-stat-icon" />
          <h2>{stats.activeRulesCount}</h2>
          <span>Active Rules</span>
        </div>

        <div className="auto-stat-card blue">
          <MdRocketLaunch className="auto-stat-icon" />
          <h2>{stats.totalTriggered}</h2>
          <span>Total Triggered</span>
        </div>

        <div className="auto-stat-card purple">
          <MdChatBubble className="auto-stat-icon" />
          <h2>{stats.waSentCount}</h2>
          <span>WA Sent</span>
        </div>
      </div>

      {/* How It Works */}
      <div className="how-it-works">
        <h3>
          <MdBolt /> How It Works
        </h3>

        <div className="flow-row">
          <span className="flow-chip">Lead Comes In 👆</span>
          <span className="flow-arrow">&rarr;</span>
          <span className="flow-chip">Trigger 🎯</span>
          <span className="flow-arrow">&rarr;</span>
          <span className="flow-chip">Action ⚡</span>
          <span className="flow-arrow">&rarr;</span>
          <span className="flow-chip">WhatsApp 💬</span>
          <span className="flow-arrow">&rarr;</span>
          <span className="flow-chip">Alert 🔔</span>
        </div>
      </div>

      {/* Trigger Automations */}
      <div className="section-header">
        <h2>Smart Automations</h2>
        <button
          className="add-btn"
          onClick={() => setShowAddAutomation(!showAddAutomation)}
        >
          <MdAdd /> Add Automation
        </button>
      </div>

      {showAddAutomation && (
        <form className="automation-add-card" onSubmit={handleAddAutomation}>
          <div className="automation-add-grid">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="e.g. New Lead - Instant WhatsApp"
                value={newAutomation.name}
                onChange={(e) =>
                  setNewAutomation({ ...newAutomation, name: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Trigger</label>
              <select
                value={newAutomation.trigger}
                onChange={(e) =>
                  setNewAutomation({
                    ...newAutomation,
                    trigger: e.target.value,
                  })
                }
              >
                <option value="newLead">New Lead Created</option>
                <option value="hotLead">Lead Becomes Hot (High Priority)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Action</label>
              <select
                value={newAutomation.action}
                onChange={(e) =>
                  setNewAutomation({
                    ...newAutomation,
                    action: e.target.value,
                  })
                }
              >
                <option value="whatsapp">WhatsApp Message Ready</option>
                <option value="managerAlert">Manager Alert</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Message Template (use {"{name}"} and {"{budget}"})</label>
            <textarea
              rows={2}
              placeholder="Hi {name}! ..."
              value={newAutomation.messageTemplate}
              onChange={(e) =>
                setNewAutomation({
                  ...newAutomation,
                  messageTemplate: e.target.value,
                })
              }
            />
          </div>

          <button type="submit" className="save-btn" disabled={addingAutomation}>
            {addingAutomation ? "Adding..." : "Save Automation"}
          </button>
        </form>
      )}

      <div className="automation-cards-list">
        {settings.triggerRules.length === 0 && (
          <p className="empty-note">
            No automations yet. Click "Add Automation" to create one.
          </p>
        )}

        {settings.triggerRules.map((rule) => (
          <div
            className={`trigger-card ${rule.active ? "active" : "inactive"}`}
            key={rule._id}
          >
            <div className="trigger-card-header">
              <div className="trigger-title">
                <h3>{rule.name}</h3>
                <span
                  className={`status-pill ${rule.active ? "on" : "off"}`}
                >
                  {rule.active ? "Active" : "Paused"}
                </span>
                <span className="count-pill">{rule.triggerCount}x</span>
              </div>

              <div className="trigger-card-actions">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={rule.active}
                    onChange={() => handleToggleAutomation(rule._id)}
                  />
                  <span className="slider"></span>
                </label>

                <button
                  className="icon-btn danger"
                  onClick={() => handleDeleteAutomation(rule._id)}
                >
                  <MdDelete />
                </button>
              </div>
            </div>

            <div className="trigger-flow">
              <span className="flow-pill trigger">
                {TRIGGER_LABELS[rule.trigger] || rule.trigger}
              </span>
              <span className="flow-arrow">&rarr;</span>
              <span className="flow-pill action">
                {ACTION_LABELS[rule.action] || rule.action}
              </span>
            </div>

            <div className="message-preview">
              "{rule.messageTemplate}"
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Rules */}
      <div className="automation-grid">
        <div className="automation-card">
          <h2>
            <MdPersonPinCircle /> Round Robin Assignment
          </h2>
          <p className="subtitle">
            Automatically distribute new leads evenly across all active
            callers, in rotation.
          </p>

          <div className="rr-toggle-row">
            <span
              className={`rr-status ${
                settings.roundRobinEnabled ? "on" : "off"
              }`}
            >
              {settings.roundRobinEnabled ? "Enabled" : "Disabled"}
            </span>

            <label className="switch">
              <input
                type="checkbox"
                checked={settings.roundRobinEnabled}
                onChange={handleToggleRoundRobin}
                disabled={togglingRR}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="automation-divider"></div>

          <h2>
            <MdNotificationsActive /> Inactivity Alerts
          </h2>
          <p className="subtitle">
            Flag leads that haven't been touched in this many days.
          </p>

          <form className="inline-form" onSubmit={handleSaveInactivityDays}>
            <input
              type="number"
              min="1"
              value={inactivityDays}
              onChange={(e) => setInactivityDays(e.target.value)}
            />
            <span>days</span>
            <button type="submit" className="save-btn" disabled={savingDays}>
              {savingDays ? "Saving..." : "Save"}
            </button>
          </form>
        </div>

        <div className="automation-card">
          <h2>Source-Based Assignment Rules</h2>
          <p className="subtitle">
            Override round robin — always send leads from a specific source
            to a specific caller.
          </p>

          <form className="inline-form rule-form" onSubmit={handleAddRule}>
            <select
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <span>&rarr;</span>

            <select
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
            >
              <option value="">Select Caller</option>
              {callers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fullName}
                </option>
              ))}
            </select>

            <button type="submit" className="save-btn" disabled={addingRule}>
              {addingRule ? "Adding..." : "Add Rule"}
            </button>
          </form>

          <div className="rules-list">
            {settings.sourceRules.length === 0 && (
              <p className="empty-note">
                No source rules yet. Round robin will apply to all leads.
              </p>
            )}

            {settings.sourceRules.map((rule) => (
              <div className="rule-row" key={rule._id}>
                <div className="rule-info">
                  <span className="rule-source">{rule.source}</span>
                  <span className="rule-arrow">&rarr;</span>
                  <span className="rule-assignee">
                    {rule.assignTo?.fullName || "Unknown"}
                  </span>
                  <span className="count-pill small">
                    {rule.triggerCount}x
                  </span>
                </div>

                <div className="rule-actions">
                  <label className="switch small">
                    <input
                      type="checkbox"
                      checked={rule.active}
                      onChange={() => handleToggleRule(rule._id)}
                    />
                    <span className="slider"></span>
                  </label>

                  <button
                    className="icon-btn danger"
                    onClick={() => handleDeleteRule(rule._id)}
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inactive Leads */}
        <div className="automation-card wide">
          <h2>
            <MdWarning className="warn-icon" /> Inactive Leads (
            {inactiveLeads.length})
          </h2>
          <p className="subtitle">
            Leads with no update in the last {settings.inactivityDays} day
            {settings.inactivityDays === 1 ? "" : "s"}.
          </p>

          {inactiveLeads.length === 0 ? (
            <p className="empty-note">
              No inactive leads right now. Everything's being worked on.
            </p>
          ) : (
            <table className="inactive-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {inactiveLeads.map((lead) => (
                  <tr
                    key={lead._id}
                    onClick={() => navigate(`/leads/${lead._id}`)}
                  >
                    <td>{lead.customerName}</td>
                    <td>{lead.phone}</td>
                    <td>{lead.status}</td>
                    <td>{lead.assignedTo?.fullName || "Unassigned"}</td>
                    <td>
                      {new Date(lead.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        onConfirm={confirmModal?.onConfirm}
        onClose={() => setConfirmModal(null)}
      />
    </div>
  );
}

export default Automation;
