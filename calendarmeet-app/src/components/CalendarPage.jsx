import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Link } from "react-router-dom";

// 🔥 Firebase imports
import { db } from "../firebaseConfig";
import { collection, addDoc, deleteDoc, onSnapshot, doc } from "firebase/firestore";

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [formData, setFormData] = useState({
    type: "",
    time: "",
    location: "",
    subject: "",
    sport: "",
    hobby: "",
  });

  // 🗑️ Deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);     // { id, title, date, ... }


  // ✅ Load events in real-time from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const eventData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventData);
    });
    return () => unsubscribe();
  }, []);

  // ✅ When user clicks a date on the calendar
  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setShowModal(true);
  };

    // ✅ When user clicks an existing event → open delete confirm
  const handleEventClick = (clickInfo) => {
    const e = clickInfo.event;
    // Build a clean object with the fields we store
    const formatted = {
      id: e.id,
      title: e.title,
      date: e.startStr, // dayGrid month uses all-day dates
      ...e.extendedProps, // time, location, type, etc.
    };
    setSelectedEvent(formatted);
    setShowDeleteModal(true);
  };

  // ✅ Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Add event to Firestore
  const handleSubmit = async () => {
    let title = formData.type;

    // Build the title based on type
    if (formData.type === "studying" && formData.subject)
      title += ` - ${formData.subject}`;
    if (formData.type === "basketball" && formData.sport)
      title += ` - ${formData.sport}`;
    if (formData.type === "hobby" && formData.hobby)
      title += ` - ${formData.hobby}`;

    const newEvent = {
      title,
      date: selectedDate,
      time: formData.time,
      location: formData.location,
      type: formData.type,
    };

    try {
      await addDoc(collection(db, "events"), newEvent);
      setShowModal(false);
      // reset form
      setFormData({
        type: "",
        time: "",
        location: "",
        subject: "",
        sport: "",
        hobby: "",
      });
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

   // Delete event from Firestore
  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id) return;
    try {
      await deleteDoc(doc(db, "events", selectedEvent.id));
      setShowDeleteModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-700 to-yellow-500 p-8 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Event Calendar</h1>
        <Link
          to="/"
          className="bg-white text-green-700 px-5 py-2 rounded-full font-semibold hover:bg-green-50 transition"
        >
          Back to Home
        </Link>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl p-6 text-black shadow-lg">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="80vh"
        />
      </div>

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl w-96 shadow-xl">
            <h2 className="text-2xl font-bold mb-5 text-center text-green-700">
              Create Event for {selectedDate}
            </h2>

            <div className="space-y-4">
              {/* Event Type */}
              <div>
                <label className="block font-semibold mb-1">Event Type:</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                >
                  <option value="">Select</option>
                  <option value="studying">Studying</option>
                  <option value="basketball">Basketball</option>
                  <option value="hobby">Hobby</option>
                </select>
              </div>

              {/* Conditional fields */}
              {formData.type === "studying" && (
                <div>
                  <label className="block font-semibold mb-1">Subject:</label>
                  <input
                    name="subject"
                    type="text"
                    placeholder="e.g. Math 1300"
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                  />
                </div>
              )}

              {formData.type === "basketball" && (
                <div>
                  <label className="block font-semibold mb-1">Sport Type:</label>
                  <input
                    name="sport"
                    type="text"
                    placeholder="e.g. Pickup Game"
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                  />
                </div>
              )}

              {formData.type === "hobby" && (
                <div>
                  <label className="block font-semibold mb-1">Hobby:</label>
                  <input
                    name="hobby"
                    type="text"
                    placeholder="e.g. Painting, Gaming"
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                  />
                </div>
              )}

              {/* Time */}
              <div>
                <label className="block font-semibold mb-1">Time:</label>
                <input
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block font-semibold mb-1">Location:</label>
                <input
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Library, Gym"
                  className="border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition font-semibold w-[48%]"
                >
                  Add Event
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 text-black px-5 py-2 rounded-lg hover:bg-gray-400 transition font-semibold w-[48%]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl w-96 shadow-xl">
            <h3 className="text-xl font-bold text-red-600 mb-3">Delete Event?</h3>
            <p className="text-sm text-gray-700 mb-4">
              <span className="font-semibold">{selectedEvent.title}</span>
              <br />
              {selectedEvent.date}
              {selectedEvent.time ? ` • ${selectedEvent.time}` : ""}
              {selectedEvent.location ? ` • ${selectedEvent.location}` : ""}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteEvent}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold flex-1"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedEvent(null);
                }}
                className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 transition font-semibold flex-1"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Tip: You can delete any event by clicking it on the calendar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
