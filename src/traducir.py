# Traduce al español las reseñas que se enseñan en la web (las "voces reales" y las del explorador).
# Guarda cada traducción en data/traducciones.json para no volver a pagar (en cuota) la misma frase.
# Uso: python src/traducir.py   (después, resumir.py ya añade las traducciones a la web)

import json
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

from resumir import resumir

RAIZ = Path(__file__).resolve().parent.parent
CACHE = RAIZ / "data" / "traducciones.json"
URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent"
LOTE = 25
INSTRUCCIONES = (
    "Traduce al español de España estas reseñas de videojuegos. Tono natural, como hablaría un jugador. "
    "Mantén la jerga habitual en inglés (skins, ranked, lag, pay-to-win, battle pass) y los nombres propios. "
    'Responde SOLO con un JSON: [{"n": 0, "es": "..."}, ...] con el mismo número "n" de cada reseña.\n\n')


def pedir_traduccion(textos):
    # Mandamos el lote numerado y recibimos las traducciones con su número
    cuerpo = {"contents": [{"parts": [{"text": INSTRUCCIONES + json.dumps(
                  [{"n": i, "texto": t} for i, t in enumerate(textos)], ensure_ascii=False)}]}],
              "generationConfig": {"responseMimeType": "application/json", "temperature": 0}}
    for _ in range(3):
        respuesta = requests.post(URL, json=cuerpo, timeout=180,
                                  headers={"x-goog-api-key": os.environ["GEMINI_API_KEY"]})
        if respuesta.status_code not in (429, 503):
            break
        time.sleep(60)  # Límite gratuito superado: esperamos un minuto
    respuesta.raise_for_status()
    salida = json.loads(respuesta.json()["candidates"][0]["content"]["parts"][0]["text"])
    return {textos[x["n"]]: x["es"] for x in salida if isinstance(x, dict) and x.get("n") in range(len(textos))}


def traducir():
    load_dotenv(RAIZ / ".env")
    resumir()  # Generamos los datos de la web para saber qué textos se enseñan
    web = json.loads((RAIZ / "web" / "data.json").read_text(encoding="utf-8"))
    explorador = json.loads((RAIZ / "web" / "resenas.json").read_text(encoding="utf-8"))
    textos = {a["voz"]["texto"] for j in web["juegos"] for a in j["aspectos"].values() if a}
    textos |= {r["t"] for r in explorador}

    # Solo traducimos lo que aún no está en la caché
    cache = json.loads(CACHE.read_text(encoding="utf-8")) if CACHE.exists() else {}
    pendientes = sorted(textos - cache.keys())
    print(f"{len(pendientes)} textos por traducir ({len(cache)} ya traducidos)")
    for inicio in range(0, len(pendientes), LOTE):
        try:
            cache.update(pedir_traduccion(pendientes[inicio:inicio + LOTE]))
        except (json.JSONDecodeError, KeyError):
            print("Lote con respuesta rara: se queda en inglés y se reintenta la próxima vez")
        # Guardamos después de cada lote: si se corta, no se pierde nada
        CACHE.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
        time.sleep(5)
    resumir()  # Volvemos a generar la web, ya con las traducciones


if __name__ == "__main__":
    traducir()
