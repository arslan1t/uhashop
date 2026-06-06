"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { getEvents, deleteEvent, createEvent, updateEvent, type LeagueEvent } from "@/lib/firebase/leagueEvents";

export default function AdminLeaguePage() {
  const [events, setEvents] = useState<LeagueEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<LeagueEvent>>({
    name: "",
    date: "",
    city: "",
    prizePool: 0,
    availableSlots: 0,
    registeredTeams: 0,
    maxTeams: 0,
    status: "upcoming",
    description: "",
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date) return;

    try {
      if (editingId) {
        await updateEvent(editingId, formData);
      } else {
        await createEvent(formData as Omit<LeagueEvent, "id" | "createdAt" | "updatedAt">);
      }
      setFormData({
        name: "",
        date: "",
        city: "",
        prizePool: 0,
        availableSlots: 0,
        registeredTeams: 0,
        maxTeams: 0,
        status: "upcoming",
      });
      setEditingId(null);
      setShowForm(false);
      loadEvents();
    } catch (err) {
      console.error("Failed to save event:", err);
    }
  };

  const handleEdit = (event: LeagueEvent) => {
    setFormData(event);
    setEditingId(event.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить событие?")) return;
    try {
      await deleteEvent(id);
      loadEvents();
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Управление Событиями Лиги</h1>
        <button
          onClick={() => {
            setFormData({
              name: "",
              date: "",
              city: "",
              prizePool: 0,
              availableSlots: 0,
              registeredTeams: 0,
              maxTeams: 0,
              status: "upcoming",
            });
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--accent))] text-white rounded-lg font-semibold hover:bg-[rgb(var(--accent-hover))] transition-colors"
        >
          <Plus className="w-5 h-5" /> Новое Событие
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSave}
          className="p-6 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Название события"
              value={formData.name || ""}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[rgb(var(--accent))]"
            />
            <input
              type="date"
              value={formData.date || ""}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-white focus:outline-none focus:border-[rgb(var(--accent))]"
            />
            <input
              type="text"
              placeholder="Город"
              value={formData.city || ""}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              className="px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[rgb(var(--accent))]"
            />
            <input
              type="number"
              placeholder="Призовой фонд (USD)"
              value={formData.prizePool || ""}
              onChange={e => setFormData({ ...formData, prizePool: Number(e.target.value) })}
              className="px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[rgb(var(--accent))]"
            />
            <input
              type="number"
              placeholder="Макс команд"
              value={formData.maxTeams || ""}
              onChange={e => setFormData({ ...formData, maxTeams: Number(e.target.value) })}
              className="px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[rgb(var(--accent))]"
            />
            <input
              type="number"
              placeholder="Зарег. команд"
              value={formData.registeredTeams || ""}
              onChange={e => setFormData({ ...formData, registeredTeams: Number(e.target.value) })}
              className="px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[rgb(var(--accent))]"
            />
            <select
              value={formData.status || "upcoming"}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              className="px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-white focus:outline-none focus:border-[rgb(var(--accent))]"
            >
              <option value="upcoming">Предстоящее</option>
              <option value="live">Live</option>
              <option value="completed">Завершено</option>
            </select>
          </div>
          <textarea
            placeholder="Описание"
            value={formData.description || ""}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[rgb(var(--accent))] h-24"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-[rgb(var(--accent))] text-white font-semibold rounded-lg hover:bg-[rgb(var(--accent-hover))] transition-colors"
            >
              {editingId ? "Сохранить" : "Создать"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] text-white font-semibold rounded-lg hover:bg-[rgb(var(--surface-2))] transition-colors"
            >
              Отмена
            </button>
          </div>
        </motion.form>
      )}

      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[rgb(var(--border))]">
            <tr className="text-left text-gray-400">
              <th className="px-4 py-3 font-semibold">Событие</th>
              <th className="px-4 py-3 font-semibold">Дата</th>
              <th className="px-4 py-3 font-semibold">Город</th>
              <th className="px-4 py-3 font-semibold">Призовой Фонд</th>
              <th className="px-4 py-3 font-semibold">Команды</th>
              <th className="px-4 py-3 font-semibold">Статус</th>
              <th className="px-4 py-3 font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id} className="border-b border-[rgb(var(--border))] hover:bg-[rgb(var(--surface))] transition-colors">
                <td className="px-4 py-3 font-semibold">{event.name}</td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(event.date).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-4 py-3 text-gray-400">{event.city}</td>
                <td className="px-4 py-3 text-gray-400">${event.prizePool.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-400">
                  {event.registeredTeams} / {event.maxTeams}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    event.status === "upcoming" ? "bg-blue-500/20 text-blue-400" :
                    event.status === "live" ? "bg-red-500/20 text-red-400" :
                    "bg-green-500/20 text-green-400"
                  }`}>
                    {event.status === "upcoming" ? "Предстоящее" :
                     event.status === "live" ? "Live" :
                     "Завершено"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 hover:bg-[rgb(var(--surface))] rounded transition-colors text-blue-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => event.id && handleDelete(event.id)}
                    className="p-2 hover:bg-[rgb(var(--surface))] rounded transition-colors text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>Нет событий. Создайте первое!</p>
        </div>
      )}
    </div>
  );
}
