# Busca la fecha de salida de cada juego en su tienda (Steam o App Store) y la guarda en data/fechas.json.
# Si una tienda no responde, ese juego se queda sin fecha y la web simplemente no la enseña.
import json
from pathlib import Path
import pandas as pd
import requests
from juegos import JUEGOS, APPSTORE


def fecha_steam(appid):
    # La tienda de Steam da la fecha en inglés, por ejemplo "6 Dec, 2024"
    r = requests.get("https://store.steampowered.com/api/appdetails",
                     params={"appids": appid, "l": "english", "cc": "us"}, timeout=30).json()
    return pd.to_datetime(r[str(appid)]["data"]["release_date"]["date"]).date().isoformat()


iconos = {}  # De paso, guardamos el icono oficial de cada juego de la App Store


def fecha_appstore(appid):
    # La App Store la da ya en formato ISO, por ejemplo "2020-09-28T07:00:00Z"
    r = requests.get("https://itunes.apple.com/lookup", params={"id": appid, "country": "us"}, timeout=30).json()["results"][0]
    iconos[APPSTORE[appid][0]] = r["artworkUrl512"]
    return r["releaseDate"][:10]


fechas = {}
for buscar, juegos in ((fecha_steam, JUEGOS), (fecha_appstore, APPSTORE)):
    for appid, datos in juegos.items():
        try:
            fechas[datos[0]] = buscar(appid)
        except Exception as error:  # Una tienda caída no debe romper la publicación
            print(f"Sin fecha para {datos[0]}: {error}")

(Path(__file__).resolve().parent.parent / "data" / "iconos.json").write_text(json.dumps(iconos, indent=1), encoding="utf-8")
destino = Path(__file__).resolve().parent.parent / "data" / "fechas.json"
destino.write_text(json.dumps(fechas, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"{len(fechas)} fechas guardadas")
