import { useEffect, useState } from "react";

import "../styles/UpcomingMeetings.css";

import { getUpcomingEvents } from "../services/calendarService";

function UpcomingMeetings() {
  const [meetings, setMeetings] = useState([]);

  const loadMeetings = async () => {
    try {
      const res = await getUpcomingEvents();

      setMeetings(res.events || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      await loadMeetings();
    })();
  }, []);

  return (
    <div className="meetings">
      <div className="meeting-header">
        <h2>Upcoming Meetings</h2>
        <span>Next 5</span>
      </div>

      {meetings.length === 0 ? (
        <p className="empty-text">
          No Upcoming Meetings
        </p>
      ) : (
        meetings.map((meeting) => (
          <div className="meeting-card" key={meeting._id}>
            <div className="meeting-time">
              {meeting.time || new Date(meeting.date).toLocaleDateString("en-IN")}
            </div>

            <div className="meeting-info">
              <h4>
                {meeting.relatedLead?.customerName ||
                  meeting.relatedCustomer?.customerName ||
                  meeting.assignedTo?.fullName ||
                  meeting.title}
              </h4>
              <p>{meeting.title}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default UpcomingMeetings;
