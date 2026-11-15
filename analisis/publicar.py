"""Copia la salida de data/salida/ a web/data/ (carpeta de Prog. B). Solo copia los archivos del contrato.

  python -m analisis.publicar          # revisa antes con git diff web/data
Úsalo en un PR aparte, avisando a Prog. B (la carpeta web/ no es de analisis/).
"""
import shutil

from analisis.descargar import RAIZ

ARCHIVOS = ["indicadores.json", "zonas.geojson", "zonas_tendencias.json"]


def main():
    for nombre in ARCHIVOS:
        origen, destino = RAIZ / "data" / "salida" / nombre, RAIZ / "web" / "data" / nombre
        if not origen.exists():
            raise SystemExit(f"Falta {origen}; corre python -m analisis.exportar y python -m analisis.zonas")
        shutil.copyfile(origen, destino)
        print(f"{origen.name} -> {destino}")


if __name__ == "__main__":
    main()
