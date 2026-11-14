# Lista única de juegos del proyecto: su número en la tienda, nombre, género y portada.
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
    # 4 más de Steam
    2694490: ("Path of Exile 2", "Acción y RPG"),
    1599340: ("Lost Ark", "MMORPG"),
    236390: ("War Thunder", "Simulación"),
    1203220: ("NARAKA: BLADEPOINT", "Battle royale"),
}

# Juegos que no están en Steam: sus reseñas salen de la App Store (móvil, con estrellas en vez de "recomiendo")
# número en la App Store: (nombre, género, icono oficial de la tienda)
APPSTORE = {
    1517783697: ("Genshin Impact", "Gacha y RPG", "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/15/9e/b1/"
                 "159eb1a7-fc58-2b43-b330-c5e619a77e2d/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg"),
    1599719154: ("Honkai: Star Rail", "Gacha y RPG", "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/b9/19/0a/"
                 "b9190ac1-9dfc-6d88-5ac4-96dd4e6d6ff4/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/512x512bb.jpg"),
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


def ficha(nombre):
    # Todo lo que la web necesita saber de un juego a partir de su nombre, venga de Steam o de la App Store
    for appid, (n, genero) in JUEGOS.items():
        if n == nombre:
            return {"appid": appid, "genero": genero, "fuente": "Steam", "portada": portada(appid),
                    "tienda": f"https://store.steampowered.com/app/{appid}"}
    for appid, (n, genero, icono) in APPSTORE.items():
        if n == nombre:
            return {"appid": appid, "genero": genero, "fuente": "App Store", "portada": icono,
                    "tienda": f"https://apps.apple.com/app/id{appid}"}
