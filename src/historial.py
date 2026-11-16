# Descarga el historial oficial de valoraciones de Steam de cada juego (votos a favor y en contra por mes)
# y lo guarda en data/historial.json. Con esto la web dibuja si un juego mejora o empeora con el tiempo.
# La App Store no publica este historial, así que Genshin y Honkai no lo tienen.
import json
from datetime import datetime, timezone
from pathlib import Path

import requests
from juegos import JUEGOS

URL = "https://store.steampowered.com/appreviewhistogram/{}"
MESES = 36  # Enseñamos como mucho los últimos 3 años


def historial(appid):
    datos = requests.get(URL.format(appid), params={"l": "english", "review_score_preference": 0},
                         timeout=30).json()["results"]["rollups"]
    # Steam agrupa por mes o por semana según la edad del juego: lo juntamos todo por mes ("2025-03")
    meses = {}
    for punto in datos:
        mes = datetime.fromtimestamp(punto["date"], timezone.utc).strftime("%Y-%m")
        a_favor, en_contra = meses.get(mes, (0, 0))
        meses[mes] = (a_favor + punto["recommendations_up"], en_contra + punto["recommendations_down"])
    return [[mes, *votos] for mes, votos in sorted(meses.items())][-MESES:]


resultado = {}
for appid, (nombre, _) in JUEGOS.items():
    try:
        resultado[nombre] = historial(appid)
    except Exception as error:  # Si Steam no responde para un juego, ese juego se queda sin gráfico
        print(f"Sin historial para {nombre}: {error}")

destino = Path(__file__).resolve().parent.parent / "data" / "historial.json"
destino.write_text(json.dumps(resultado, ensure_ascii=False), encoding="utf-8")
print(f"Historial de {len(resultado)} juegos guardado")
