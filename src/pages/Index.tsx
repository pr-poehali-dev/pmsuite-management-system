import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import {
  getProjects, createProject, updateProject,
  getTasks, createTask, updateTask,
  getComments, createComment,
  type Project, type Task, type Comment,
} from "@/lib/api";

const NAV_ITEMS = [
  { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard" },
  { id: "projects", label: "Проекты", icon: "FolderKanban" },
  { id: "tasks", label: "Задачи", icon: "CheckSquare" },
  { id: "users", label: "Пользователи", icon: "Users" },
  { id: "roles", label: "Роли", icon: "Shield" },
  { id: "processes", label: "Процессы", icon: "GitBranch" },
  { id: "analytics", label: "Аналитика", icon: "BarChart3" },
  { id: "comments", label: "Комментарии", icon: "MessageSquare" },
  { id: "history", label: "История", icon: "Clock" },
];

const USERS = [
  { id: 1, name: "Алексей Морозов", role: "Руководитель проекта", department: "ИТ-отдел", projects: 3, tasks: 8, status: "active", initials: "АМ" },
  { id: 2, name: "Светлана Карпова", role: "Аналитик", department: "Бизнес-анализ", projects: 2, tasks: 12, status: "active", initials: "СК" },
  { id: 3, name: "Дмитрий Попов", role: "Разработчик", department: "ИТ-отдел", projects: 1, tasks: 6, status: "active", initials: "ДП" },
  { id: 4, name: "Ирина Волкова", role: "Тестировщик", department: "QA", projects: 2, tasks: 5, status: "inactive", initials: "ИВ" },
  { id: 5, name: "Михаил Тихонов", role: "DevOps-инженер", department: "ИТ-отдел", projects: 1, tasks: 9, status: "active", initials: "МТ" },
];

const ROLES = [
  { id: 1, name: "Администратор", users: 2, permissions: ["Полный доступ", "Управление пользователями", "Настройки системы"], color: "bg-red-100 text-red-700" },
  { id: 2, name: "Руководитель проекта", users: 4, permissions: ["Создание проектов", "Управление задачами", "Просмотр аналитики"], color: "bg-blue-100 text-blue-700" },
  { id: 3, name: "Разработчик", users: 8, permissions: ["Просмотр проектов", "Редактирование задач", "Комментарии"], color: "bg-green-100 text-green-700" },
  { id: 4, name: "Наблюдатель", users: 3, permissions: ["Только чтение", "Комментарии"], color: "bg-gray-100 text-gray-700" },
];

const PROCESSES = [
  { id: 1, name: "Согласование ТЗ", stage: "Проверка", owner: "Алексей М.", status: "active", steps: 5, current: 3 },
  { id: 2, name: "Code Review", stage: "Разработка", owner: "Дмитрий П.", status: "active", steps: 4, current: 2 },
  { id: 3, name: "Приёмка релиза", stage: "Тестирование", owner: "Ирина В.", status: "pending", steps: 6, current: 1 },
  { id: 4, name: "Деплой на прод", stage: "Деплой", owner: "Михаил Т.", status: "risk", steps: 3, current: 2 },
];

const PRIORITY_LABELS: Record<string, string> = { high: "Высокий", medium: "Средний", low: "Низкий" };

// --- UI Components ---

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Активен", cls: "status-active" },
    pending: { label: "Ожидает", cls: "status-pending" },
    done: { label: "Завершён", cls: "status-done" },
    risk: { label: "Под угрозой", cls: "status-risk" },
    inactive: { label: "Неактивен", cls: "status-pending" },
    archived: { label: "Архив", cls: "status-pending" },
  };
  const s = map[status] || { label: status, cls: "" };
  return <span className={`status-badge ${s.cls}`}>{s.label}</span>;
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = { high: "bg-red-500", medium: "bg-amber-400", low: "bg-emerald-500" };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[priority] || "bg-gray-300"}`} />;
}

function Avatar({ initials, size = "sm" }: { initials: string; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "w-10 h-10 text-sm" : "w-7 h-7 text-xs";
  return (
    <div className={`${sizeClass} rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-32">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function SectionHeader({ title, sub, btnLabel, btnIcon, onAdd }: {
  title: string; sub?: string; btnLabel?: string; btnIcon?: string; onAdd?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        {sub && <p className="text-sm text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {btnLabel && (
        <button onClick={onAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
          <Icon name={(btnIcon || "Plus") as unknown as string} size={16} />
          {btnLabel}
        </button>
      )}
    </div>
  );
}

// --- Modal ---
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Icon name="X" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-800 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
const selectCls = inputCls;

// --- Pages ---

function Dashboard({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
  const active = projects.filter(p => p.status === "active").length;
  const done = tasks.filter(t => t.status === "done").length;
  const risk = projects.filter(p => p.status === "risk").length;

  const kpis = [
    { label: "Активных проектов", value: String(active), delta: `${projects.length} всего`, icon: "FolderKanban", color: "text-blue-600" },
    { label: "Задач выполнено", value: String(done), delta: `из ${tasks.length} всего`, icon: "CheckSquare", color: "text-emerald-600" },
    { label: "Сотрудников", value: "5", delta: "в 3 отделах", icon: "Users", color: "text-violet-600" },
    { label: "Под угрозой", value: String(risk), delta: "требуют внимания", icon: "AlertTriangle", color: "text-red-600" },
  ];

  const maxTasks = 31;
  const months = ["Янв", "Фев", "Мар", "Апр", "Май"];
  const allTasks = [18, 24, 20, 31, tasks.length || 27];
  const doneTasks = [14, 19, 17, 26, done || 19];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-0.5">Персональный дашборд</h2>
        <p className="text-sm text-slate-500">9 мая 2026 — Добрый день, Администратор</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="kpi-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{k.label}</span>
              <Icon name={k.icon as unknown as string} size={18} className={k.color} />
            </div>
            <div className={`text-3xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-xs text-slate-400 mt-1">{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Прогресс проектов</h3>
          {projects.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Нет проектов</p>
          ) : (
            <div className="space-y-4">
              {projects.filter(p => p.status !== "done").slice(0, 5).map((p) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700 truncate max-w-xs">{p.name}</span>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <StatusBadge status={p.status} />
                      <span className="text-xs font-mono text-slate-500">{p.progress}%</span>
                    </div>
                  </div>
                  <Progress value={p.progress} className="h-1.5" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Задачи по месяцам</h3>
          <div className="flex items-end gap-2" style={{ height: "120px" }}>
            {months.map((m, i) => (
              <div key={m} className="flex-1 flex flex-col items-center gap-1 h-full">
                <div className="w-full flex flex-col justify-end h-full gap-px">
                  <div className="w-full bg-blue-200 rounded-t-sm" style={{ height: `${((allTasks[i] - doneTasks[i]) / maxTasks) * 90}%` }} />
                  <div className="w-full bg-blue-600 rounded-b-sm" style={{ height: `${(doneTasks[i] / maxTasks) * 90}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 mt-1">{m}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-blue-600 rounded-sm" /><span className="text-[11px] text-slate-500">Выполнено</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-blue-200 rounded-sm" /><span className="text-[11px] text-slate-500">В работе</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Последние задачи</h3>
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Нет задач</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Задача</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Проект</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Исполнитель</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Срок</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Статус</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 5).map((t) => (
                <tr key={t.id} className="table-row-hover border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-700">
                    <div className="flex items-center gap-2"><PriorityDot priority={t.priority} />{t.title}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{t.project}</td>
                  <td className="px-4 py-3 text-slate-600">{t.assignee}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{t.due}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ProjectsPage({ projects, onRefresh }: { projects: Project[]; onRefresh: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: "", status: "pending", lead: "", deadline: "", priority: "medium", progress: 0 });
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setForm({ name: "", status: "pending", lead: "", deadline: "", priority: "medium", progress: 0 }); setEditItem(null); setShowModal(true); };
  const openEdit = (p: Project) => { setForm({ name: p.name, status: p.status, lead: p.lead, deadline: p.deadline, priority: p.priority, progress: p.progress }); setEditItem(p); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (editItem) {
      await updateProject(editItem.id, form);
    } else {
      await createProject(form);
    }
    setSaving(false);
    setShowModal(false);
    onRefresh();
  };

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Проекты" sub={`${projects.length} проектов в системе`} btnLabel="Новый проект" onAdd={openCreate} />
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {projects.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Icon name="FolderOpen" size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Нет проектов. Создайте первый!</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["Проект", "Руководитель", "Прогресс", "Дедлайн", "Статус", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="table-row-hover border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2"><PriorityDot priority={p.priority} /><span className="font-medium text-slate-800">{p.name}</span></div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{p.lead}</td>
                  <td className="px-5 py-3.5 w-44">
                    <div className="flex items-center gap-2"><Progress value={p.progress} className="h-1.5 flex-1" /><span className="text-xs font-mono text-slate-400">{p.progress}%</span></div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{p.deadline}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => openEdit(p)} className="text-xs text-blue-600 hover:underline">Изменить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editItem ? "Редактировать проект" : "Новый проект"} onClose={() => setShowModal(false)}>
          <Field label="Название проекта">
            <input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Введите название..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Статус">
              <select className={selectCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Ожидает</option>
                <option value="active">Активен</option>
                <option value="risk">Под угрозой</option>
                <option value="done">Завершён</option>
              </select>
            </Field>
            <Field label="Приоритет">
              <select className={selectCls} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </Field>
          </div>
          <Field label="Руководитель">
            <input className={inputCls} value={form.lead} onChange={e => setForm({ ...form, lead: e.target.value })} placeholder="Имя руководителя" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Дедлайн">
              <input className={inputCls} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} placeholder="15 июня" />
            </Field>
            <Field label="Прогресс (%)">
              <input className={inputCls} type="number" min={0} max={100} value={form.progress} onChange={e => setForm({ ...form, progress: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">Отмена</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60">
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function TasksPage({ tasks, projects, onRefresh }: { tasks: Task[]; projects: Project[]; onRefresh: () => void }) {
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: "", project_name: "", assignee: "", status: "pending", priority: "medium", due_date: "" });
  const [saving, setSaving] = useState(false);

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  const openCreate = () => { setForm({ title: "", project_name: "", assignee: "", status: "pending", priority: "medium", due_date: "" }); setEditItem(null); setShowModal(true); };
  const openEdit = (t: Task) => { setForm({ title: t.title, project_name: t.project, assignee: t.assignee, status: t.status, priority: t.priority, due_date: t.due }); setEditItem(t); setShowModal(true); };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    if (editItem) {
      await updateTask(editItem.id, form);
    } else {
      await createTask(form);
    }
    setSaving(false);
    setShowModal(false);
    onRefresh();
  };

  const filters = [
    { key: "all", label: "Все" },
    { key: "active", label: "Активные" },
    { key: "pending", label: "Ожидают" },
    { key: "done", label: "Завершены" },
    { key: "risk", label: "Под угрозой" },
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Задачи" sub={`${tasks.length} задач в системе`} btnLabel="Новая задача" onAdd={openCreate} />
      <div className="flex gap-2 mb-4">
        {filters.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === f.key ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Icon name="CheckSquare" size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Нет задач</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["#", "Задача", "Проект", "Исполнитель", "Приоритет", "Срок", "Статус", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="table-row-hover border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3.5 text-slate-300 text-xs font-mono">{t.id}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{t.title}</td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{t.project}</td>
                  <td className="px-4 py-3.5 text-slate-600">{t.assignee}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5"><PriorityDot priority={t.priority} /><span className="text-xs text-slate-500">{PRIORITY_LABELS[t.priority]}</span></div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-400">{t.due}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => openEdit(t)} className="text-xs text-blue-600 hover:underline">Изменить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editItem ? "Редактировать задачу" : "Новая задача"} onClose={() => setShowModal(false)}>
          <Field label="Название задачи">
            <input className={inputCls} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Введите название..." />
          </Field>
          <Field label="Проект">
            <select className={selectCls} value={form.project_name} onChange={e => setForm({ ...form, project_name: e.target.value })}>
              <option value="">— выберите проект —</option>
              {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Исполнитель">
            <input className={inputCls} value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} placeholder="Имя исполнителя" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Статус">
              <select className={selectCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Ожидает</option>
                <option value="active">Активна</option>
                <option value="risk">Под угрозой</option>
                <option value="done">Завершена</option>
              </select>
            </Field>
            <Field label="Приоритет">
              <select className={selectCls} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </Field>
          </div>
          <Field label="Срок">
            <input className={inputCls} value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} placeholder="15 мая" />
          </Field>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">Отмена</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60">
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function UsersPage() {
  return (
    <div className="animate-fade-in">
      <SectionHeader title="Пользователи" sub={`${USERS.length} сотрудников в системе`} btnLabel="Добавить" btnIcon="UserPlus" />
      <div className="grid grid-cols-3 gap-4">
        {USERS.map((u) => (
          <div key={u.id} className="bg-white rounded-lg border border-slate-200 p-5 hover:border-blue-300 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <Avatar initials={u.initials} size="md" />
              <div>
                <div className="font-semibold text-slate-800 text-sm">{u.name}</div>
                <div className="text-xs text-slate-500">{u.role}</div>
              </div>
            </div>
            <div className="text-xs text-slate-400 mb-3">{u.department}</div>
            <div className="flex items-center justify-between">
              <div className="flex gap-3 text-xs text-slate-500">
                <span><strong className="text-slate-700">{u.projects}</strong> проекта</span>
                <span><strong className="text-slate-700">{u.tasks}</strong> задач</span>
              </div>
              <StatusBadge status={u.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RolesPage() {
  return (
    <div className="animate-fade-in">
      <SectionHeader title="Роли и права доступа" sub={`${ROLES.length} роли настроены`} btnLabel="Новая роль" />
      <div className="grid grid-cols-2 gap-4">
        {ROLES.map((r) => (
          <div key={r.id} className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="Shield" size={18} className="text-blue-600" />
                <span className="font-semibold text-slate-800">{r.name}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.color}`}>{r.users} польз.</span>
            </div>
            <div className="space-y-1.5">
              {r.permissions.map((p) => (
                <div key={p} className="flex items-center gap-2 text-sm text-slate-600">
                  <Icon name="Check" size={14} className="text-emerald-500 shrink-0" />
                  {p}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
              <button className="text-xs text-blue-600 hover:underline">Редактировать</button>
              <span className="text-slate-200">·</span>
              <button className="text-xs text-slate-400 hover:underline">Назначить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessesPage() {
  return (
    <div className="animate-fade-in">
      <SectionHeader title="Процессы" sub={`${PROCESSES.length} активных процесса`} btnLabel="Новый процесс" />
      <div className="space-y-4">
        {PROCESSES.map((p) => (
          <div key={p.id} className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Icon name="GitBranch" size={18} className="text-blue-600" />
                <div>
                  <div className="font-semibold text-slate-800">{p.name}</div>
                  <div className="text-xs text-slate-400">Этап: {p.stage} · Ответственный: {p.owner}</div>
                </div>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div className="flex items-center gap-0">
              {Array.from({ length: p.steps }).map((_, i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i < p.current ? "bg-blue-600 text-white" : i === p.current ? "bg-blue-100 text-blue-600 ring-2 ring-blue-400" : "bg-slate-100 text-slate-400"}`}>
                    {i < p.current ? "✓" : i + 1}
                  </div>
                  {i < p.steps - 1 && <div className={`flex-1 h-0.5 ${i < p.current - 1 ? "bg-blue-500" : "bg-slate-200"}`} />}
                </div>
              ))}
              <span className="text-xs text-slate-400 ml-3 whitespace-nowrap">Шаг {p.current} из {p.steps}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsPage({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
  const done = tasks.filter(t => t.status === "done").length;
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
  const maxVal = 31;
  const months = ["Янв", "Фев", "Мар", "Апр", "Май"];
  const allTasks = [18, 24, 20, 31, tasks.length || 27];
  const doneTasks = [14, 19, 17, 26, done || 19];

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Аналитика" sub="Сводные показатели за 2026 год" />
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "Завершаемость задач", value: `${pct}%`, sub: `Выполнено ${done} из ${tasks.length}`, color: "text-emerald-600" },
          { label: "Активных проектов", value: String(projects.filter(p => p.status === "active").length), sub: `из ${projects.length} всего`, color: "text-blue-600" },
          { label: "Под угрозой", value: String(projects.filter(p => p.status === "risk").length), sub: "Требуют внимания", color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="kpi-card">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{s.label}</div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-5">Задачи по месяцам — 2026</h3>
        <div className="flex items-end gap-4" style={{ height: "160px" }}>
          {months.map((m, i) => (
            <div key={m} className="flex-1 flex flex-col items-center gap-1 h-full">
              <div className="text-xs text-slate-400 font-mono">{allTasks[i]}</div>
              <div className="w-full flex flex-col justify-end flex-1 gap-px">
                <div className="w-full bg-blue-200 rounded-t-sm" style={{ height: `${((allTasks[i] - doneTasks[i]) / maxVal) * 100}%` }} />
                <div className="w-full bg-blue-600 rounded-b-sm" style={{ height: `${(doneTasks[i] / maxVal) * 100}%` }} />
              </div>
              <span className="text-xs text-slate-400">{m}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-600 rounded-sm" /><span className="text-xs text-slate-500">Выполнено</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-200 rounded-sm" /><span className="text-xs text-slate-500">В работе</span></div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Статус проектов</h3>
        {projects.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Нет проектов</p>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center gap-4">
                <div className="w-52 text-sm text-slate-700 truncate">{p.name}</div>
                <div className="flex-1"><Progress value={p.progress} className="h-2" /></div>
                <div className="w-10 text-right text-xs font-mono text-slate-400">{p.progress}%</div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentsPage({ comments, onRefresh }: { comments: Comment[]; onRefresh: () => void }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    await createComment({ text, author: "Администратор" });
    setText("");
    setSending(false);
    onRefresh();
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffH = Math.round((now.getTime() - d.getTime()) / 3600000);
      if (diffH < 1) return "только что";
      if (diffH < 24) return `${diffH} ч назад`;
      return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
    } catch { return iso; }
  };

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Комментарии" sub={`${comments.length} комментариев`} />
      <div className="space-y-3 mb-4">
        {comments.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 text-center py-10 text-slate-400">
            <Icon name="MessageSquare" size={28} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Пока нет комментариев</p>
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="bg-white rounded-lg border border-slate-200 p-5">
              <div className="flex items-start gap-3">
                <Avatar initials={c.initials || c.author.slice(0, 2).toUpperCase()} size="md" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 text-sm">{c.author}</span>
                      {c.project && <><span className="text-slate-200">·</span><span className="text-xs text-slate-500">{c.project}</span></>}
                    </div>
                    <span className="text-xs text-slate-400 ml-4 whitespace-nowrap">{formatTime(c.time)}</span>
                  </div>
                  <p className="text-sm text-slate-700">{c.text}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <textarea
          className="w-full text-sm text-slate-700 resize-none outline-none placeholder:text-slate-400"
          rows={3}
          placeholder="Добавить комментарий..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="flex justify-end mt-2 border-t border-slate-100 pt-2">
          <button onClick={handleSend} disabled={sending || !text.trim()} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
            {sending ? "Отправка..." : "Отправить"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryPage({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
  const events = [
    ...projects.map(p => ({ id: `p-${p.id}`, action: "Проект создан", entity: p.name, user: p.lead || "Система", time: p.created_at || "", icon: "FolderPlus" })),
    ...tasks.map(t => ({ id: `t-${t.id}`, action: "Задача создана", entity: t.title, user: t.assignee || "Система", time: t.created_at || "", icon: "CheckSquare" })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 20);

  const formatTime = (iso: string) => {
    try { return new Date(iso).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
    catch { return iso; }
  };

  return (
    <div className="animate-fade-in">
      <SectionHeader title="История изменений" sub="Хронология всех действий в системе" />
      <div className="bg-white rounded-lg border border-slate-200">
        {events.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Icon name="Clock" size={28} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">История пуста</p>
          </div>
        ) : (
          events.map((h, i) => (
            <div key={h.id} className={`flex items-start gap-4 px-5 py-4 table-row-hover ${i < events.length - 1 ? "border-b border-slate-50" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                <Icon name={h.icon as unknown as string} size={15} className="text-blue-600" fallback="Clock" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-800">{h.action}</span>
                    <span className="text-slate-300">—</span>
                    <span className="text-sm text-slate-600">{h.entity}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400 ml-4 whitespace-nowrap">{formatTime(h.time)}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <Icon name="User" size={11} className="text-slate-300" />
                  {h.user}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- App ---

export default function Index() {
  const [active, setActive] = useState("dashboard");
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [p, t, c] = await Promise.all([getProjects(), getTasks(), getComments()]);
    setProjects(p);
    setTasks(t);
    setComments(c);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const refreshProjects = useCallback(async () => { const p = await getProjects(); setProjects(p); }, []);
  const refreshTasks = useCallback(async () => { const t = await getTasks(); setTasks(t); }, []);
  const refreshComments = useCallback(async () => { const c = await getComments(); setComments(c); }, []);

  const renderPage = () => {
    if (loading) return <Spinner />;
    switch (active) {
      case "dashboard": return <Dashboard projects={projects} tasks={tasks} />;
      case "projects": return <ProjectsPage projects={projects} onRefresh={refreshProjects} />;
      case "tasks": return <TasksPage tasks={tasks} projects={projects} onRefresh={refreshTasks} />;
      case "users": return <UsersPage />;
      case "roles": return <RolesPage />;
      case "processes": return <ProcessesPage />;
      case "analytics": return <AnalyticsPage projects={projects} tasks={tasks} />;
      case "comments": return <CommentsPage comments={comments} onRefresh={refreshComments} />;
      case "history": return <HistoryPage projects={projects} tasks={tasks} />;
      default: return <Dashboard projects={projects} tasks={tasks} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <aside className="w-56 shrink-0 flex flex-col h-full" style={{ background: "var(--pm-sidebar)" }}>
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center">
              <Icon name="Layers" size={15} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm tracking-tight">PMSuite</div>
              <div className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(147,197,253,0.6)" }}>Enterprise</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => setActive(item.id)}
              className={`sidebar-nav-item w-full text-left ${active === item.id ? "active" : ""}`}>
              <Icon name={item.icon as unknown as string} size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: "rgba(59,130,246,0.3)", color: "rgba(147,197,253,1)" }}>АД</div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">Администратор</div>
              <div className="text-[10px]" style={{ color: "rgba(147,197,253,0.5)" }}>Полный доступ</div>
            </div>
            <Icon name="Settings" size={14} className="cursor-pointer" style={{ color: "rgba(147,197,253,0.4)" } as React.CSSProperties} />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 bg-white border-b border-slate-200 flex items-center px-6 gap-4 shrink-0">
          <div className="flex-1 flex items-center gap-1.5 text-xs text-slate-400">
            <span>PMSuite</span>
            <Icon name="ChevronRight" size={12} />
            <span className="text-slate-700 font-medium">{NAV_ITEMS.find(n => n.id === active)?.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadAll} className="text-slate-400 hover:text-blue-600 transition-colors" title="Обновить данные">
              <Icon name="RefreshCw" size={15} />
            </button>
            <div className="relative">
              <Icon name="Search" size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="bg-slate-100 rounded-md pl-8 pr-3 py-1.5 text-sm text-slate-700 outline-none w-44 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Поиск..." />
            </div>
            <div className="relative cursor-pointer">
              <Icon name="Bell" size={18} className="text-slate-500 hover:text-blue-600 transition-colors" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
