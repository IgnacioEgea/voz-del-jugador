# Lista única de juegos del proyecto: su número en Steam (appid), nombre, género y portada.
# La usan descargar.py, limpiar.py y resumir.py, así que para añadir un juego basta con tocar este archivo.

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
}

# Portada oficial vertical de la tienda de Steam (la web la enlaza, no se copia).
# Casi todos los juegos la tienen en la ruta estándar; los más nuevos usan una ruta propia.
CDN = "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/"
RUTAS_ESPECIALES = {
    4732690: "eafa0bcd71aa11a86a5d512be6e390d03c08ae1b/library_capsule_2x.jpg",
    3513350: "075494dcac9d43280880c549c9c0c783020ae7e1/library_capsule_2x.jpg",
    4162040: "bae92fe95e33651e06bf6fdaa877bcf44ac11918/library_capsule_2x.jpg",
}


def portada(appid):
    return f"{CDN}{appid}/{RUTAS_ESPECIALES.get(appid, 'library_600x900_2x.jpg')}"
