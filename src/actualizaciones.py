# Descarga los anuncios oficiales de cada juego en Steam (parches, temporadas, eventos) y guarda
# su fecha y título en data/actualizaciones.json. Sirve para ver si la valoración sube o baja tras ellos.
import json
from datetime import datetime, timezone
from pathlib import Path

import requests
from juegos import JUEGOS

URL = "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/"
# Solo nos interesan los anuncios que suenan a actualización de verdad, no las ofertas ni los directos
CLAVES = ("update", "patch", "season", "hotfix", "chapter", "expansion", "version", "release notes")

resultado = {}
for appid, (nombre, _) in JUEGOS.items():
    try:
        noticias = requests.get(URL, params={"appid": appid, "count": 300, "feeds": "steam_community_announcements"},
                                timeout=30).json()["appnews"]["newsitems"]
        resultado[nombre] = [
            {"fecha": datetime.fromtimestamp(n["date"], timezone.utc).strftime("%Y-%m-%d"), "titulo": n["title"], "url": n["url"]}
            for n in noticias if any(c in n["title"].lower() for c in CLAVES)]
    except Exception as error:  # Si Steam falla con un juego, ese juego se queda sin anuncios
        print(f"Sin anuncios para {nombre}: {error}")

destino = Path(__file__).resolve().parent.parent / "data" / "actualizaciones.json"
destino.write_text(json.dumps(resultado, ensure_ascii=False), encoding="utf-8")
print(f"Anuncios de {len(resultado)} juegos: {sum(map(len, resultado.values()))} actualizaciones")
