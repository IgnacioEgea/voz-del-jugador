# Descarga reseñas de Steam de varios juegos y las guarda en un CSV por juego.
# Si se corta internet, al volver a ejecutarlo sigue donde lo dejó.
# Uso: python src/descargar.py        (los 6 juegos)
#      python src/descargar.py 440    (solo un juego, para probar)

import json
import sys
import time
from pathlib import Path

import pandas as pd
import requests

# Los juegos que estudiamos: su número en Steam (appid) y su nombre
JUEGOS = {2767030: "Marvel Rivals", 2357570: "Overwatch 2", 1172470: "Apex Legends",
          2073850: "THE FINALS", 440: "Team Fortress 2", 444090: "Paladins"}
OBJETIVO = 1800       # Cuántas reseñas queremos de cada juego
IDIOMA = "english"
CARPETA = Path(__file__).resolve().parent.parent / "data" / "raw"
URL = "https://api.steampowered.com/IUserReviewsService/GetAppReviews/v1/"


def pedir_pagina(appid, cursor):
    # Pedimos a Steam 100 reseñas cada vez, como pasar páginas de un libro
    # (filter 1 = las más recientes; purchase_type 1 = compradas en Steam y fuera)
    peticion = {"appid": appid, "filter": 1, "languages": [IDIOMA],
                "purchase_type": 1, "num_per_page": 100, "cursor": cursor}
    respuesta = requests.get(URL, params={"input_json": json.dumps(peticion)}, timeout=30)
    respuesta.raise_for_status()
    return respuesta.json()["response"]


def a_filas(appid, resenas):
    # De cada reseña nos quedamos solo con lo que vamos a usar
    return [{"id": r["recommendationid"], "juego": JUEGOS[appid], "texto": r["review"],
             "recomienda": r["voted_up"],
             "minutos_jugados": r["author"].get("playtime_at_review", 0),
             "fecha": r["timestamp_created"], "votos_util": r["votes_up"]}
            for r in resenas]


def descargar(appid):
    csv = CARPETA / f"{appid}.csv"
    marca = CARPETA / f"{appid}.cursor"
    # Si ya habíamos empezado, contamos lo que hay y buscamos la página donde paramos
    hechas = len(pd.read_csv(csv)) if csv.exists() else 0
    cursor = marca.read_text() if marca.exists() else "*"

    while hechas < OBJETIVO:
        datos = pedir_pagina(appid, cursor)
        resenas = datos.get("reviews", [])
        if not resenas:
            break  # Ya no quedan más reseñas
        # Añadimos la página al final del CSV, sin borrar lo anterior
        pd.DataFrame(a_filas(appid, resenas)).to_csv(
            csv, mode="a", header=not csv.exists(), index=False)
        hechas += len(resenas)
        # Apuntamos por qué página vamos, como un marcapáginas
        cursor = datos["cursor"]
        marca.write_text(cursor)
        time.sleep(1)  # Pausa corta para ser amables con Steam

    print(f"{JUEGOS[appid]}: {hechas} reseñas")


if __name__ == "__main__":
    CARPETA.mkdir(parents=True, exist_ok=True)
    # Si escribimos un appid al lanzar el script, solo baja ese juego
    elegidos = [int(a) for a in sys.argv[1:]] or JUEGOS
    for appid in elegidos:
        descargar(appid)
