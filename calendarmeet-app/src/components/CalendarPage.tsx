import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Link } from "react-router-dom";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useStore } from "../store/useStore";

// 🔥 Firebase imports
import { db } from "../firebaseConfig";
import { collection, addDoc, deleteDoc, onSnapshot, doc, serverTimestamp } from "firebase/firestore";

type FirestoreEvent = {
  id: string;
  title?: string;
  date?: string;
  start?: string;
  end?: string;
  type?: string;
  time?: string;
  location?: string;
  [key: string]: unknown;
};

type CalendarForm = {
  type: string;
  time: string;
  location: string;
  subject: string;
  sport: string;
  hobby: string;
};

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<CalendarForm>({
    type: "",
    time: "",
    location: "",
    subject: "",
    sport: "",
    hobby: "",
  });
  const addNotification = useStore((s) => s.addNotification);
  const initialSyncDone = useRef(false);

  // 🗑️ Deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FirestoreEvent | null>(null);     // { id, title, date, ... }


  // ✅ Load events in real-time from Firestore
  useEffect(() => {
    // Firebase is temporarily disabled - skip Firestore operations
    if (!db) {
      console.log('Firebase Firestore is disabled - using PostgreSQL backend instead');
      return;
    }

    const eventsRef = collection(db, "events");
    const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
      const eventData = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setEvents(eventData);

      // notify on new events after initial sync
      if (initialSyncDone.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            addNotification({
              title: "New event added",
              message: data.title || "Event updated",
              type: "event",
              createdAt: Date.now(),
            });
          }
        });
      } else {
        initialSyncDone.current = true;
      }
    });
    return () => unsubscribe();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesType = filterType === "all" || event.type === filterType;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      q.length === 0 ||
      event.title?.toLowerCase().includes(q) ||
      event.location?.toLowerCase().includes(q);
    return matchesType && matchesQuery;
  });

  // ✅ When user clicks a date on the calendar
  const handleDateClick = (info: { dateStr: string }) => {
    setSelectedDate(info.dateStr);
    setShowModal(true);
  };

    // ✅ When user clicks an existing event → open delete confirm
  const handleEventClick = (clickInfo: any) => {
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
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Add event to Firestore
  const handleSubmit = async () => {
    if (!selectedDate) {
      setError("Pick a date on the calendar first.");
      return;
    }

    if (!formData.type) {
      setError("Event type is required.");
      return;
    }

    if (!formData.time) {
      setError("Time is required.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Location is required.");
      return;
    }

    if (formData.type === "studying" && !formData.subject.trim()) {
      setError("Subject is required for studying events.");
      return;
    }

    if (formData.type === "basketball" && !formData.sport.trim()) {
      setError("Sport type is required for basketball events.");
      return;
    }

    if (formData.type === "hobby" && !formData.hobby.trim()) {
      setError("Hobby name is required for hobby events.");
      return;
    }

    setError("");
    setSubmitting(true);

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
      createdAt: serverTimestamp(),
    };

    try {
      if (!db) {
        toast.error('Calendar feature temporarily disabled - Firebase migration in progress');
        return;
      }
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
      toast.success("Event created");
    } catch (error) {
      console.error("Error adding event:", error);
      setError("Failed to create event. Please try again.");
      toast.error("Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

   // Delete event from Firestore
  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id) return;
    try {
      if (!db) {
        toast.error('Calendar feature temporarily disabled - Firebase migration in progress');
        return;
      }
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
        <h1 className="text-3xl font-bold" aria-label="Event Calendar">
          Event Calendar
        </h1>
        <Link
          to="/"
          className="bg-white text-green-700 px-5 py-2 rounded-full font-semibold hover:bg-green-50 transition"
        >
          Back to Home
        </Link>
      </div>

      <div className="bg-white/20 border border-white/30 backdrop-blur-lg rounded-xl p-4 mb-4 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex items-center bg-white text-black rounded-lg px-3 py-2 shadow-sm w-full md:w-2/3">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search by title or location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-white font-semibold">Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white text-black px-3 py-2 rounded-lg shadow-sm"
          >
            <option value="all">All</option>
            <option value="studying">Studying</option>
            <option value="basketball">Basketball</option>
            <option value="hobby">Hobby</option>
          </select>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl p-6 text-black shadow-lg">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={filteredEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="80vh"
        />
      </div>

      {/* Create Event Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Create event"
        >
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

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition font-semibold w-[48%] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Adding..." : "Add Event"}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="bg-gray-300 text-black px-5 py-2 rounded-lg hover:bg-gray-400 transition font-semibold w-[48%] disabled:opacity-60 disabled:cursor-not-allowed"
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
          <div
            className="bg-white text-black p-6 rounded-xl w-96 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Delete event confirmation"
          >
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
