"""Receptor local: guarda archivos que la pestaña de Figma envía por POST.
Uso: python -I receptor.py <carpeta_repo>
POST http://127.0.0.1:8765/guardar?ruta=diseno/pantallas/x.png  (cuerpo = bytes)
GET  http://127.0.0.1:8765/leer?ruta=diseno/tools/auditar-figma.js  (scripts; también lee web/assets/ y web/img/)
Solo acepta rutas bajo diseno/ o web/assets/. Escucha solo en 127.0.0.1.
Uso: python -I diseno/tools/receptor.py .
"""
import sys, os, re
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

RAIZ = os.path.abspath(sys.argv[1])
PERMITIDAS = ("diseno/", "web/assets/")

class H(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Private-Network", "true")

    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()

    def do_GET(self):
        q = parse_qs(urlparse(self.path).query)
        ruta = (q.get("ruta") or [""])[0]
        # Lectura: scripts de diseno/tools/, assets de web/assets/ e imágenes de web/img/ (solo lectura).
        lectura = ("diseno/tools/", "web/assets/", "web/img/")
        if (not re.fullmatch(r"[A-Za-z0-9_\-./]+", ruta) or ".." in ruta or not ruta.startswith(lectura)
                or not os.path.isfile(os.path.join(RAIZ, *ruta.split("/")))):
            self.send_response(404); self._cors(); self.end_headers(); return
        with open(os.path.join(RAIZ, *ruta.split("/")), "rb") as f:
            datos = f.read()
        tipos = {".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png",
                 ".jpg": "image/jpeg", ".json": "application/json"}
        self.send_response(200); self._cors()
        self.send_header("Content-Type", tipos.get(os.path.splitext(ruta)[1], "application/octet-stream")); self.end_headers()
        self.wfile.write(datos)

    def do_POST(self):
        q = parse_qs(urlparse(self.path).query)
        ruta = (q.get("ruta") or [""])[0]
        if not re.fullmatch(r"[A-Za-z0-9_\-./]+", ruta) or ".." in ruta or not ruta.startswith(PERMITIDAS):
            self.send_response(400); self._cors(); self.end_headers(); self.wfile.write(b"ruta invalida"); return
        n = int(self.headers.get("Content-Length", 0))
        datos = self.rfile.read(n)
        destino = os.path.join(RAIZ, *ruta.split("/"))
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        with open(destino, "wb") as f:
            f.write(datos)
        self.send_response(200); self._cors(); self.end_headers()
        self.wfile.write(f"ok {len(datos)}".encode())
        print("guardado", ruta, len(datos), flush=True)

HTTPServer(("127.0.0.1", 8765), H).serve_forever()
