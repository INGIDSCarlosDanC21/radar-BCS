import csv

from analisis import hora_paso


def test_media_por_anio_descarta_relleno(tmp_path):
    ruta = tmp_path / "h.csv"
    with open(ruta, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["Date", "MOD11A2_061_Day_view_time"])
        w.writerows([("2001-01-01", 10.0), ("2001-01-09", 11.0), ("2001-01-17", 255), ("2002-01-01", 9.0)])
    assert hora_paso.media_por_anio(ruta) == {2001: 10.5, 2002: 9.0}
