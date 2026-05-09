import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";

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

const PROJECTS = [
  { id: 1, name: "Редизайн корпоративного портала", status: "active", progress: 68, lead: "Алексей М.", deadline: "15 июня", priority: "high", tasks: 24, done: 16 },
  { id: 2, name: "Внедрение CRM-системы", status: "active", progress: 42, lead: "Светлана К.", deadline: "30 июля", priority: "medium", tasks: 37, done: 15 },
  { id: 3, name: "Миграция баз данных", status: "pending", progress: 12, lead: "Дмитрий П.", deadline: "10 августа", priority: "high", tasks: 18, done: 2 },
  { id: 4, name: "Аудит информационной безопасности", status: "done", progress: 100, lead: "Ирина В.", deadline: "01 мая", priority: "low", tasks: 12, done: 12 },
  { id: 5, name: "Обновление инфраструктуры", status: "risk", progress: 55, lead: "Михаил Т.", deadline: "20 мая", priority: "high", tasks: 29, done: 16 },
];

const TASKS = [
  { id: 1, title: "Разработка UI-кита для портала", project: "Редизайн портала", assignee: "Алексей М.", status: "active", priority: "high", due: "12 мая" },
  { id: 2, title: "Настройка интеграции с 1С", project: "Внедрение CRM", assignee: "Светлана К.", status: "pending", priority: "medium", due: "18 мая" },
  { id: 3, title: "Перенос таблиц пользователей", project: "Миграция БД", assignee: "Дмитрий П.", status: "active", priority: "high", due: "15 мая" },
  { id: 4, title: "Тестирование API-эндпоинтов", project: "Внедрение CRM", assignee: "Виктор С.", status: "done", priority: "low", due: "05 мая" },
  { id: 5, title: "Составление отчёта по уязвимостям", project: "Аудит ИБ", assignee: "Ирина В.", status: "done", priority: "medium", due: "28 апр" },
  { id: 6, title: "Обновление SSL-сертификатов", project: "Инфраструктура", assignee: "Михаил Т.", status: "risk", priority: "high", due: "10 мая" },
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

const COMMENTS = [
  { id: 1, author: "Алексей М.", initials: "АМ", project: "Редизайн портала", task: "Разработка UI-кита", text: "Утвердили цветовую схему с заказчиком. Двигаемся дальше.", time: "2 часа назад" },
  { id: 2, author: "Светлана К.", initials: "СК", project: "Внедрение CRM", task: "Интеграция с 1С", text: "Обнаружена несовместимость версий API. Нужна консультация с вендором.", time: "5 часов назад" },
  { id: 3, author: "Михаил Т.", initials: "МТ", project: "Инфраструктура", task: "SSL-сертификаты", text: "Срок действия сертификата истекает 10 мая. Требуется срочное обновление!", time: "вчера" },
  { id: 4, author: "Дмитрий П.", initials: "ДП", project: "Миграция БД", task: "Перенос таблиц", text: "Первый этап миграции завершён успешно. Данные верифицированы.", time: "вчера" },
];

const HISTORY = [
  { id: 1, action: "Задача завершена", entity: "Тестирование API-эндпоинтов", user: "Виктор С.", time: "05 мая, 14:32", icon: "CheckCircle" },
  { id: 2, action: "Проект создан", entity: "Миграция баз данных", user: "Алексей М.", time: "04 мая, 09:15", icon: "FolderPlus" },
  { id: 3, action: "Пользователь добавлен", entity: "Виктор С. → Разработчик", user: "Администратор", time: "03 мая, 16:00", icon: "UserPlus" },
  { id: 4, action: "Статус изменён", entity: "Инфраструктура → Под угрозой", user: "Михаил Т.", time: "03 мая, 11:48", icon: "AlertCircle" },
  { id: 5, action: "Комментарий добавлен", entity: "Обнаружена несовместимость API", user: "Светлана К.", time: "02 мая, 17:22", icon: "MessageSquare" },
  { id: 6, action: "Задача назначена", entity: "SSL-сертификаты → Михаил Т.", user: "Алексей М.", time: "02 мая, 10:05", icon: "UserCheck" },
  { id: 7, action: "Аудит завершён", entity: "Аудит информационной безопасности", user: "Ирина В.", time: "01 мая, 18:00", icon: "ShieldCheck" },
];

const ANALYTICS_MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май"];
const ANALYTICS_TASKS = [18, 24, 20, 31, 27];
const ANALYTICS_DONE = [14, 19, 17, 26, 19];

const PRIORITY_LABELS: Record<string, string> = { high: "Высокий", medium: "Средний", low: "Низкий" };

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Активен", cls: "status-active" },
    pending: { label: "Ожидает", cls: "status-pending" },
    done: { label: "Завершён", cls: "status-done" },
    risk: { label: "Под угрозой", cls: "status-risk" },
    inactive: { label: "Неактивен", cls: "status-pending" },
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

function SectionHeader({ title, sub, btnLabel, btnIcon }: { title: string; sub?: string; btnLabel?: string; btnIcon?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        {sub && <p className="text-sm text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {btnLabel && (
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
          <Icon name={(btnIcon || "Plus") as unknown as string} size={16} />
          {btnLabel}
        </button>
      )}
    </div>
  );
}

function Dashboard() {
  const kpis = [
    { label: "Активных проектов", value: "4", delta: "+1 за месяц", icon: "FolderKanban", color: "text-blue-600" },
    { label: "Задач выполнено", value: "61", delta: "из 120 всего", icon: "CheckSquare", color: "text-emerald-600" },
    { label: "Сотрудников", value: "5", delta: "в 3 отделах", icon: "Users", color: "text-violet-600" },
    { label: "Под угрозой", value: "2", delta: "требуют внимания", icon: "AlertTriangle", color: "text-red-600" },
  ];
  const maxTasks = Math.max(...ANALYTICS_TASKS);

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
          <div className="space-y-4">
            {PROJECTS.filter(p => p.status !== "done").map((p) => (
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
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Задачи по месяцам</h3>
          <div className="flex items-end gap-2" style={{ height: "120px" }}>
            {ANALYTICS_MONTHS.map((m, i) => (
              <div key={m} className="flex-1 flex flex-col items-center gap-1 h-full">
                <div className="w-full flex flex-col justify-end h-full gap-px">
                  <div className="w-full bg-blue-200 rounded-t-sm" style={{ height: `${((ANALYTICS_TASKS[i] - ANALYTICS_DONE[i]) / maxTasks) * 90}%` }} />
                  <div className="w-full bg-blue-600 rounded-b-sm" style={{ height: `${(ANALYTICS_DONE[i] / maxTasks) * 90}%` }} />
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
          <span className="text-xs text-blue-600 cursor-pointer hover:underline">Все задачи →</span>
        </div>
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
            {TASKS.slice(0, 4).map((t) => (
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
      </div>
    </div>
  );
}

function ProjectsPage() {
  return (
    <div className="animate-fade-in">
      <SectionHeader title="Проекты" sub={`${PROJECTS.length} проектов в системе`} btnLabel="Новый проект" />
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {["Проект", "Руководитель", "Прогресс", "Задачи", "Дедлайн", "Статус"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROJECTS.map((p) => (
              <tr key={p.id} className="table-row-hover border-b border-slate-50 last:border-0 cursor-pointer">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2"><PriorityDot priority={p.priority} /><span className="font-medium text-slate-800">{p.name}</span></div>
                </td>
                <td className="px-5 py-3.5 text-slate-600">{p.lead}</td>
                <td className="px-5 py-3.5 w-44">
                  <div className="flex items-center gap-2"><Progress value={p.progress} className="h-1.5 flex-1" /><span className="text-xs font-mono text-slate-400">{p.progress}%</span></div>
                </td>
                <td className="px-5 py-3.5 text-slate-500 text-xs"><span className="font-semibold text-slate-700">{p.done}</span>/{p.tasks}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{p.deadline}</td>
                <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TasksPage() {
  return (
    <div className="animate-fade-in">
      <SectionHeader title="Задачи" sub={`${TASKS.length} задач в системе`} btnLabel="Новая задача" />
      <div className="flex gap-2 mb-4">
        {["Все", "Активные", "Ожидают", "Завершены"].map((f, i) => (
          <button key={f} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${i === 0 ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>{f}</button>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {["#", "Задача", "Проект", "Исполнитель", "Приоритет", "Срок", "Статус"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TASKS.map((t) => (
              <tr key={t.id} className="table-row-hover border-b border-slate-50 last:border-0 cursor-pointer">
                <td className="px-4 py-3.5 text-slate-300 text-xs font-mono">{t.id}</td>
                <td className="px-4 py-3.5 font-medium text-slate-800">{t.title}</td>
                <td className="px-4 py-3.5 text-slate-500 text-xs">{t.project}</td>
                <td className="px-4 py-3.5 text-slate-600">{t.assignee}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5"><PriorityDot priority={t.priority} /><span className="text-xs text-slate-500">{PRIORITY_LABELS[t.priority]}</span></div>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-slate-400">{t.due}</td>
                <td className="px-4 py-3.5"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

function AnalyticsPage() {
  const maxVal = Math.max(...ANALYTICS_TASKS);
  return (
    <div className="animate-fade-in">
      <SectionHeader title="Аналитика" sub="Сводные показатели за 2026 год" />
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "Завершаемость задач", value: "78%", sub: "Выполнено 61 из 78", color: "text-emerald-600" },
          { label: "Среднее время задачи", value: "4.2 дня", sub: "За последние 30 дней", color: "text-blue-600" },
          { label: "Просрочено задач", value: "7", sub: "3 критических", color: "text-red-600" },
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
          {ANALYTICS_MONTHS.map((m, i) => (
            <div key={m} className="flex-1 flex flex-col items-center gap-1 h-full">
              <div className="text-xs text-slate-400 font-mono">{ANALYTICS_TASKS[i]}</div>
              <div className="w-full flex flex-col justify-end flex-1 gap-px">
                <div className="w-full bg-blue-200 rounded-t-sm" style={{ height: `${((ANALYTICS_TASKS[i] - ANALYTICS_DONE[i]) / maxVal) * 100}%` }} />
                <div className="w-full bg-blue-600 rounded-b-sm" style={{ height: `${(ANALYTICS_DONE[i] / maxVal) * 100}%` }} />
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
        <div className="space-y-3">
          {PROJECTS.map((p) => (
            <div key={p.id} className="flex items-center gap-4">
              <div className="w-52 text-sm text-slate-700 truncate">{p.name}</div>
              <div className="flex-1"><Progress value={p.progress} className="h-2" /></div>
              <div className="w-10 text-right text-xs font-mono text-slate-400">{p.progress}%</div>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommentsPage() {
  return (
    <div className="animate-fade-in">
      <SectionHeader title="Комментарии" sub={`${COMMENTS.length} последних комментария`} />
      <div className="space-y-3 mb-4">
        {COMMENTS.map((c) => (
          <div key={c.id} className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <Avatar initials={c.initials} size="md" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 text-sm">{c.author}</span>
                    <span className="text-slate-200">·</span>
                    <span className="text-xs text-slate-500">{c.project}</span>
                    <span className="text-slate-200">·</span>
                    <span className="text-xs text-slate-400 italic">{c.task}</span>
                  </div>
                  <span className="text-xs text-slate-400 ml-4 whitespace-nowrap">{c.time}</span>
                </div>
                <p className="text-sm text-slate-700">{c.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <textarea className="w-full text-sm text-slate-700 resize-none outline-none placeholder:text-slate-400" rows={3} placeholder="Добавить комментарий..." />
        <div className="flex justify-end mt-2 border-t border-slate-100 pt-2">
          <button className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">Отправить</button>
        </div>
      </div>
    </div>
  );
}

function HistoryPage() {
  return (
    <div className="animate-fade-in">
      <SectionHeader title="История изменений" sub="Хронология всех действий в системе" />
      <div className="bg-white rounded-lg border border-slate-200">
        {HISTORY.map((h, i) => (
          <div key={h.id} className={`flex items-start gap-4 px-5 py-4 table-row-hover ${i < HISTORY.length - 1 ? "border-b border-slate-50" : ""}`}>
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
                <span className="text-xs font-mono text-slate-400 ml-4 whitespace-nowrap">{h.time}</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <Icon name="User" size={11} className="text-slate-300" />
                {h.user}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PAGE_MAP: Record<string, React.FC> = {
  dashboard: Dashboard,
  projects: ProjectsPage,
  tasks: TasksPage,
  users: UsersPage,
  roles: RolesPage,
  processes: ProcessesPage,
  analytics: AnalyticsPage,
  comments: CommentsPage,
  history: HistoryPage,
};

export default function Index() {
  const [active, setActive] = useState("dashboard");
  const PageComponent = PAGE_MAP[active] || Dashboard;

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
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`sidebar-nav-item w-full text-left ${active === item.id ? "active" : ""}`}
            >
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
            <div className="relative">
              <Icon name="Search" size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="bg-slate-100 rounded-md pl-8 pr-3 py-1.5 text-sm text-slate-700 outline-none w-44 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Поиск..." />
            </div>
            <div className="relative cursor-pointer">
              <Icon name="Bell" size={18} className="text-slate-500 hover:text-blue-600 transition-colors" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">3</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <PageComponent />
        </main>
      </div>
    </div>
  );
}