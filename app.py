from mimetypes import guess_type
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FILES = {
    "/": "index.html",
    "/index.html": "index.html",
    "/index.css": "index.css",
    "/index.js": "index.js",
}
PHOTOS = {"kazuki.jpg", "joanna.jpg", "vitoria.jpg", "laura.jpg", "felipe.jpg", "icon.webp"}

async def app(scope, receive, send):
    if scope["type"] != "http":
        return

    method = scope.get("method", "GET")
    path = scope.get("path", "/")
    photo = path.removeprefix("/fotos/") if path.startswith("/fotos/") else None
    filename = FILES.get(path)
    if photo in PHOTOS:
        filename = str(Path("fotos") / photo)

    if method not in {"GET", "HEAD"}:
        status, body, content_type = 405, b"Method not allowed", "text/plain; charset=utf-8"
    elif filename is None or not (ROOT / filename).is_file():
        status, body, content_type = 404, b"Not found", "text/plain; charset=utf-8"
    else:
        body = (ROOT / filename).read_bytes()
        content_type = guess_type(filename)[0] or "application/octet-stream"
        if filename.endswith((".html", ".css", ".js")):
            content_type += "; charset=utf-8"
        status = 200

    await send({
        "type": "http.response.start",
        "status": status,
        "headers": [(b"content-type", content_type.encode("latin-1"))],
    })
    await send({"type": "http.response.body", "body": b"" if method == "HEAD" else body})

