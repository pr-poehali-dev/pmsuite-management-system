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
    """CRUD для задач PMSuite"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    body = json.loads(event.get("body") or "{}")

    task_id = None
    parts = path.strip("/").split("/")
    if len(parts) >= 2 and parts[-1].isdigit():
        task_id = int(parts[-1])

    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == "GET":
            if task_id:
                cur.execute(
                    f"SELECT id, title, project_name, assignee, status, priority, due_date, created_at FROM {SCHEMA}.tasks WHERE id = %s",
                    (task_id,)
                )
                row = cur.fetchone()
                if not row:
                    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Не найдено"})}
                data = _row_to_task(row)
            else:
                cur.execute(
                    f"SELECT id, title, project_name, assignee, status, priority, due_date, created_at FROM {SCHEMA}.tasks ORDER BY created_at DESC"
                )
                data = [_row_to_task(r) for r in cur.fetchall()]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False, default=str)}

        elif method == "POST":
            title = body.get("title", "").strip()
            if not title:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Название обязательно"})}
            cur.execute(
                f"""INSERT INTO {SCHEMA}.tasks (title, project_name, assignee, status, priority, due_date)
                    VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
                (
                    title,
                    body.get("project_name", ""),
                    body.get("assignee", ""),
                    body.get("status", "pending"),
                    body.get("priority", "medium"),
                    body.get("due_date", ""),
                )
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return {"statusCode": 201, "headers": CORS, "body": json.dumps({"id": new_id, "success": True})}

        elif method == "PUT" and task_id:
            fields = []
            vals = []
            for key in ["title", "project_name", "assignee", "status", "priority", "due_date"]:
                if key in body:
                    fields.append(f"{key} = %s")
                    vals.append(body[key])
            if not fields:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нет данных для обновления"})}
            fields.append("updated_at = NOW()")
            vals.append(task_id)
            cur.execute(
                f"UPDATE {SCHEMA}.tasks SET {', '.join(fields)} WHERE id = %s",
                vals
            )
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"success": True})}

        elif method == "DELETE" and task_id:
            cur.execute(f"UPDATE {SCHEMA}.tasks SET status = 'done' WHERE id = %s", (task_id,))
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"success": True})}

        return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Метод не поддерживается"})}

    finally:
        cur.close()
        conn.close()


def _row_to_task(row):
    return {
        "id": row[0],
        "title": row[1],
        "project": row[2],
        "assignee": row[3],
        "status": row[4],
        "priority": row[5],
        "due": row[6],
        "created_at": str(row[7]),
    }
