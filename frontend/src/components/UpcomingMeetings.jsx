import "../styles/UpcomingMeetings.css";

const meetings = [
  {
    id: 1,
    time: "10:00 AM",
    client: "Rahul Sharma",
    type: "Insurance Discussion",
  },
  {
    id: 2,
    time: "01:30 PM",
    client: "Mohit Kumar",
    type: "Investment Planning",
  },
  {
    id: 3,
    time: "04:00 PM",
    client: "Aman Singh",
    type: "Loan Follow-up",
  },
];

function UpcomingMeetings() {
  return (
    <div className="meetings">
      <h2>Upcoming Meetings</h2>

      {meetings.map((meeting) => (
        <div className="meeting-card" key={meeting.id}>
          <div className="meeting-time">
            {meeting.time}
          </div>

          <div className="meeting-info">
            <h4>{meeting.client}</h4>
            <p>{meeting.type}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UpcomingMeetings;