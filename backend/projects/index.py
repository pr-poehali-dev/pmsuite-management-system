import json
import os
import psycopg2

SCHEMA = "t_p49497665_pmsuite_management_s"

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

def handler(event: dict, context) -> dict:
    """CRUD для проектов PMSuite"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    body = json.loads(event.get("body") or "{}")
    params = event.get("queryStringParameters") or {}

    # Извлекаем id из пути /projects/123
    project_id = None
    parts = path.strip("/").split("/")
    if len(parts) >= 2 and parts[-1].isdigit():
        project_id = int(parts[-1])

    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == "GET":
            if project_id:
                cur.execute(
                    f"SELECT id, name, status, progress, lead, deadline, priority, tasks_total, tasks_done, created_at FROM {SCHEMA}.projects WHERE id = %s",
                    (project_id,)
                )
                row = cur.fetchone()
                if not row:
                    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Не найдено"})}
                data = _row_to_project(row)
            else:
                cur.execute(
                    f"SELECT id, name, status, progress, lead, deadline, priority, tasks_total, tasks_done, created_at FROM {SCHEMA}.projects ORDER BY created_at DESC"
                )
                data = [_row_to_project(r) for r in cur.fetchall()]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False, default=str)}

        elif method == "POST":
            name = body.get("name", "").strip()
            if not name:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Название обязательно"})}
            cur.execute(
                f"""INSERT INTO {SCHEMA}.projects (name, status, progress, lead, deadline, priority, tasks_total, tasks_done)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                (
                    name,
                    body.get("status", "pending"),
                    int(body.get("progress", 0)),
                    body.get("lead", ""),
                    body.get("deadline", ""),
                    body.get("priority", "medium"),
                    int(body.get("tasks_total", 0)),
                    int(body.get("tasks_done", 0)),
                )
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return {"statusCode": 201, "headers": CORS, "body": json.dumps({"id": new_id, "success": True})}

        elif method == "PUT" and project_id:
            fields = []
            vals = []
            for key in ["name", "status", "lead", "deadline", "priority"]:
                if key in body:
                    fields.append(f"{key} = %s")
                    vals.append(body[key])
            for key in ["progress", "tasks_total", "tasks_done"]:
                if key in body:
                    fields.append(f"{key} = %s")
                    vals.append(int(body[key]))
            if not fields:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нет данных для обновления"})}
            fields.append("updated_at = NOW()")
            vals.append(project_id)
            cur.execute(
                f"UPDATE {SCHEMA}.projects SET {', '.join(fields)} WHERE id = %s",
                vals
            )
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"success": True})}

        elif method == "DELETE" and project_id:
            cur.execute(f"UPDATE {SCHEMA}.projects SET status = 'archived' WHERE id = %s", (project_id,))
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"success": True})}

        return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Метод не поддерживается"})}

    finally:
        cur.close()
        conn.close()


def _row_to_project(row):
    return {
        "id": row[0],
        "name": row[1],
        "status": row[2],
        "progress": row[3],
        "lead": row[4],
        "deadline": row[5],
        "priority": row[6],
        "tasks_total": row[7],
        "tasks_done": row[8],
        "created_at": str(row[9]),
    }
