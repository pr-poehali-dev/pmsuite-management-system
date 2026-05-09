import json
import os
import psycopg2

SCHEMA = "t_p49497665_pmsuite_management_s"

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

def handler(event: dict, context) -> dict:
    """Получение и добавление комментариев PMSuite"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    body = json.loads(event.get("body") or "{}")

    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == "GET":
            cur.execute(
                f"SELECT id, author, initials, project, task_name, text, created_at FROM {SCHEMA}.comments ORDER BY created_at DESC LIMIT 50"
            )
            data = [
                {
                    "id": r[0], "author": r[1], "initials": r[2],
                    "project": r[3], "task": r[4], "text": r[5],
                    "time": str(r[6]),
                }
                for r in cur.fetchall()
            ]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False, default=str)}

        elif method == "POST":
            text = body.get("text", "").strip()
            author = body.get("author", "Администратор")
            if not text:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Текст обязателен"})}
            initials = "".join([w[0].upper() for w in author.split()[:2]])
            cur.execute(
                f"""INSERT INTO {SCHEMA}.comments (author, initials, project, task_name, text)
                    VALUES (%s, %s, %s, %s, %s) RETURNING id""",
                (author, initials, body.get("project", ""), body.get("task_name", ""), text)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return {"statusCode": 201, "headers": CORS, "body": json.dumps({"id": new_id, "success": True})}

        return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Метод не поддерживается"})}

    finally:
        cur.close()
        conn.close()
