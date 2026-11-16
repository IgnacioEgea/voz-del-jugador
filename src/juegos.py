# Lista única de juegos del proyecto: su número en la tienda, nombre, género y portada.
# La usan descargar.py, limpiar.py y resumir.py, así que para añadir un juego basta con tocar este archivo.
import json
from pathlib import Path

# appid: (nombre, género)
JUEGOS = {
    # Los 6 shooters del análisis inicial
    2767030: ("Marvel Rivals", "Hero shooter"),
    2357570: ("Overwatch 2", "Hero shooter"),
    1172470: ("Apex Legends", "Battle royale"),
    2073850: ("THE FINALS", "Shooter"),
    440: ("Team Fortress 2", "Hero shooter"),
    444090: ("Paladins", "Hero shooter"),
    # 9 free-to-play famosos añadidos después (Genshin y Fortnite no están en Steam)
    578080: ("PUBG: BATTLEGROUNDS", "Battle royale"),
    730: ("Counter-Strike 2", "Shooter"),
    570: ("Dota 2", "MOBA"),
    230410: ("Warframe", "Acción y RPG"),
    1085660: ("Destiny 2", "Shooter"),
    2507950: ("Delta Force", "Shooter"),
    4732690: ("Arknights: Endfield", "Gacha y RPG"),
    3513350: ("Wuthering Waves", "Gacha y RPG"),
    4162040: ("Zenless Zone Zero", "Gacha y RPG"),
    # 4 más de Steam
    2694490: ("Path of Exile 2", "Acción y RPG"),
    1599340: ("Lost Ark", "MMORPG"),
    236390: ("War Thunder", "Simulación"),
    1203220: ("NARAKA: BLADEPOINT", "Battle royale"),
    # 9 más de Steam (noviembre de 2026)
    3393110: ("AION 2", "MMORPG"),
    3564740: ("Where Winds Meet", "Acción y RPG"),
    359550: ("Rainbow Six Siege", "Shooter"),
    238960: ("Path of Exile", "Acción y RPG"),
    2437170: ("SMITE 2", "MOBA"),
    2074920: ("The First Descendant", "Shooter"),
    2429640: ("Throne and Liberty", "MMORPG"),
    291550: ("Brawlhalla", "Lucha"),
    4128260: ("Highguard", "Hero shooter"),  # Cerró sus servidores: el ejemplo de lanzamiento fallido
}

# Juegos cuyos servidores ya están cerrados: la web los marca como "fuera de servicio"
CERRADOS = {4128260: "2026-03-12"}

# Juegos que no están en Steam: sus reseñas salen de la App Store (móvil, con estrellas en vez de "recomiendo")
# número en la App Store: (nombre, género, icono oficial de la tienda)
APPSTORE = {
    1517783697: ("Genshin Impact", "Gacha y RPG", "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/15/9e/b1/"
                 "159eb1a7-fc58-2b43-b330-c5e619a77e2d/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg"),
    1599719154: ("Honkai: Star Rail", "Gacha y RPG", "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/b9/19/0a/"
                 "b9190ac1-9dfc-6d88-5ac4-96dd4e6d6ff4/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg"),
    # 5 de móvil añadidos en noviembre de 2026: su icono lo busca fechas.py en la App Store al publicar
    1619254071: ("Honor of Kings", "MOBA", ""),
    1229016807: ("Brawl Stars", "Arena", ""),
    1053012308: ("Clash Royale", "Estrategia", ""),
    1330123889: ("PUBG MOBILE", "Battle royale", ""),
    6479970832: ("Pokémon TCG Pocket", "Cartas", ""),
}

# Portada oficial vertical de la tienda de Steam (la web la enlaza, no se copia).
# Casi todos los juegos la tienen en la ruta estándar; los más nuevos usan una ruta propia.
CDN = "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/"
RUTAS_ESPECIALES = {
    4732690: "eafa0bcd71aa11a86a5d512be6e390d03c08ae1b/library_capsule_2x.jpg",
    3513350: "075494dcac9d43280880c549c9c0c783020ae7e1/library_capsule_2x.jpg",
    4162040: "bae92fe95e33651e06bf6fdaa877bcf44ac11918/library_capsule_2x.jpg",
    3393110: "145d58f9f8ffa48e6333b1dc3dd2ad7e9bf2b2b4/library_capsule_2x.jpg",
    4128260: "720b71240c14e3b5773a6370170a4aeabcb21cf9/library_capsule_2x.jpg",
}


# Iconos de la App Store que fechas.py descarga al publicar (data/iconos.json)
_RUTA_ICONOS = Path(__file__).resolve().parent.parent / "data" / "iconos.json"
ICONOS_APPSTORE = json.loads(_RUTA_ICONOS.read_text(encoding="utf-8")) if _RUTA_ICONOS.exists() else {}


def portada(appid):
    return f"{CDN}{appid}/{RUTAS_ESPECIALES.get(appid, 'library_600x900_2x.jpg')}"


def ficha(nombre):
    # Todo lo que la web necesita saber de un juego a partir de su nombre, venga de Steam o de la App Store
    for appid, (n, genero) in JUEGOS.items():
        if n == nombre:
            return {"appid": appid, "genero": genero, "fuente": "Steam", "portada": portada(appid),
                    "tienda": f"https://store.steampowered.com/app/{appid}", "cerrado": CERRADOS.get(appid)}
    for appid, (n, genero, icono) in APPSTORE.items():
        if n == nombre:
            icono = icono or ICONOS_APPSTORE.get(nombre, "")  # Si no está escrito aquí, el que bajó fechas.py
            return {"appid": appid, "genero": genero, "fuente": "App Store", "portada": icono,
                    "tienda": f"https://apps.apple.com/app/id{appid}"}
