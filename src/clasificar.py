# Pide a la IA de Google (Gemini) que lea cada reseña y diga de qué aspectos habla y si bien o mal.
# Envía las reseñas de 20 en 20 y guarda cada lote al momento: si se corta, sigue donde lo dejó.
# Uso: python src/clasificar.py       (todas)
#      python src/clasificar.py 20    (solo 20, para probar)

import json
import os
import sys
import time
from pathlib import Path

import pandas as pd
import requests
from dotenv import load_dotenv

RAIZ = Path(__file__).resolve().parent.parent
ENTRADA = RAIZ / "data" / "resenas.csv"
SALIDA = RAIZ / "data" / "resenas_clasificadas.csv"
PROMPT = (RAIZ / "src" / "prompt.txt").read_text(encoding="utf-8")
ASPECTOS = ["jugabilidad", "monetizacion", "bugs_rendimiento", "contenido_actualizaciones",
            "graficos_arte", "comunidad_toxicidad", "matchmaking_balance"]
MODELO = "gemini-flash-latest"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODELO}:generateContent"
LOTE = 20
ESPERA = 6  # Segundos entre llamadas, para no pasarnos del límite gratuito por minuto


def preguntar_ia(lote):
    # Juntamos las instrucciones y las 20 reseñas (recortadas si son muy largas) en un mensaje
    resenas = lote[["id", "texto"]].assign(texto=lote["texto"].str[:1500])
    cuerpo = {"contents": [{"parts": [{"text": PROMPT + resenas.to_json(orient="records")}]}],
              "generationConfig": {"responseMimeType": "application/json", "temperature": 0}}
    while True:
        try:
            respuesta = requests.post(URL, json=cuerpo, timeout=300,
                                      headers={"x-goog-api-key": os.environ["GEMINI_API_KEY"]})
        except requests.Timeout:
            continue  # Gemini se ha quedado pensando demasiado: se lo pedimos otra vez
        if respuesta.status_code not in (429, 503):
            break
        time.sleep(60)  # Límite superado o Gemini saturado: esperamos un minuto y repetimos
    if not respuesta.ok:
        sys.exit(f"Gemini respondió {respuesta.status_code}: {respuesta.text[:500]}")
    return json.loads(respuesta.json()["candidates"][0]["content"]["parts"][0]["text"])


def a_tabla(clasificadas):
    # Una fila por reseña y una columna por aspecto (vacía si la reseña no habla de él)
    return pd.DataFrame([{"id": str(c["id"]), **{a: c["aspectos"].get(a, "") for a in ASPECTOS}}
                         for c in clasificadas])


def clasificar(limite=None):
    load_dotenv(RAIZ / ".env")
    df = pd.read_csv(ENTRADA, dtype={"id": str})
    # Saltamos las reseñas que ya se clasificaron en otra ejecución
    if SALIDA.exists():
        df = df[~df["id"].isin(pd.read_csv(SALIDA, dtype={"id": str})["id"])]
    df = df[:limite]

    for inicio in range(0, len(df), LOTE):
        tabla = a_tabla(preguntar_ia(df[inicio:inicio + LOTE]))
        tabla.to_csv(SALIDA, mode="a", header=not SALIDA.exists(), index=False)
        print(f"{min(inicio + LOTE, len(df))} / {len(df)}")
        time.sleep(ESPERA)


if __name__ == "__main__":
    clasificar(int(sys.argv[1]) if len(sys.argv) > 1 else None)
