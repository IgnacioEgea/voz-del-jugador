# Descarga reseñas de la App Store para los juegos que no están en Steam (Genshin Impact, Honkai: Star Rail).
# Usa el canal público de reseñas de Apple: 10 páginas de 50 por país. Guarda un CSV por juego, igual que descargar.py.
# Uso: python src/descargar_appstore.py

import time
from datetime import datetime
from pathlib import Path

import pandas as pd
import requests

from juegos import APPSTORE

CARPETA = Path(__file__).resolve().parent.parent / "data" / "raw"
PAISES = ["us", "gb", "ca", "au"]  # Tiendas en inglés, para que el idioma coincida con el de Steam
URL = "https://itunes.apple.com/{pais}/rss/customerreviews/page={pagina}/id={app}/sortby=mostrecent/json"
OBJETIVO = 1800


def es_latino(texto):
    # Nos quedamos con reseñas escritas sobre todo en alfabeto latino (descarta ruso, chino, etc.)
    letras = [c for c in texto if c.isalpha()]
    return bool(letras) and sum(c.isascii() for c in letras) / len(letras) > 0.9


def leer_pagina(app, pais, pagina):
    # Cada página trae hasta 50 reseñas; si no hay más, devuelve una lista vacía
    respuesta = requests.get(URL.format(pais=pais, pagina=pagina, app=app), timeout=30)
    if not respuesta.ok:
        return []
    entradas = respuesta.json().get("feed", {}).get("entry", [])
    return entradas if isinstance(entradas, list) else [entradas]


def a_fila(nombre, e):
    # Mismo formato que las reseñas de Steam: 4 o 5 estrellas cuenta como "lo recomienda"
    texto = f'{e["title"]["label"]}. {e["content"]["label"]}'
    return {"id": f'as{e["id"]["label"]}', "juego": nombre, "texto": texto,
            "recomienda": int(e["im:rating"]["label"]) >= 4, "minutos_jugados": None,
            "fecha": int(datetime.fromisoformat(e["updated"]["label"]).timestamp()),
            "votos_util": int(e.get("im:voteSum", {}).get("label", 0))}


def descargar_appstore():
    CARPETA.mkdir(parents=True, exist_ok=True)
    for app, (nombre, _, _) in APPSTORE.items():
        filas = []
        for pais in PAISES:
            for pagina in range(1, 11):
                entradas = leer_pagina(app, pais, pagina)
                if not entradas:
                    break  # Ese país no tiene más reseñas
                filas += [a_fila(nombre, e) for e in entradas if "im:rating" in e]
                time.sleep(1)  # Pausa para ser amables con Apple
        tabla = pd.DataFrame(filas).drop_duplicates("id")
        tabla = tabla[tabla["texto"].map(es_latino)].head(OBJETIVO)
        tabla.to_csv(CARPETA / f"appstore_{app}.csv", index=False)
        print(f"{nombre}: {len(tabla)} reseñas de la App Store")


if __name__ == "__main__":
    descargar_appstore()
