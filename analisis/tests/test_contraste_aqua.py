import csv

from analisis import contraste_aqua


def test_hora_media_aqua_descarta_relleno(tmp_path):
    ruta = tmp_path / "a.csv"
    with open(ruta, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["Date", "MYD11A2_061_Day_view_time"])
        w.writerows([("2003-01-01", 13.0), ("2003-01-09", 14.0), ("2003-01-17", 255), ("2026-01-01", 15.2)])
    assert contraste_aqua.hora_media_por_anio(ruta) == {2003: 13.5, 2026: 15.2}
