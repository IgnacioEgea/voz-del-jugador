# Resume las reseñas clasificadas en un archivo pequeño (web/data.json) que lee la web.
# Solo guarda porcentajes y unas pocas frases reales: así la web carga rápido.
# Uso: python src/resumir.py

import json
import re
from pathlib import Path

import pandas as pd

from clasificar import ASPECTOS
from juegos import ficha

RAIZ = Path(__file__).resolve().parent.parent
RAREZAS = [(80, "legendaria"), (65, "epica"), (50, "rara"), (0, "comun")]
MIN_MENCIONES = 20  # Con menos menciones, el porcentaje no es fiable y no lo enseñamos
CACHE = RAIZ / "data" / "traducciones.json"  # Traducciones al español que guarda traducir.py


def pct(condicion):
    # Porcentaje de casos que cumplen algo, sin decimales
    return int(round(condicion.mean() * 100))


TRADUCCIONES = {}


def recortar(texto, limite=240):
    # Quitamos las etiquetas de formato de Steam ([b], [h2]…) y los espacios de más
    texto = " ".join(re.sub(r"\[/?[a-z0-9*]+[^\]]*\]", "", texto).split())
    # Cortamos al final de una palabra, para no dejar palabras a medias
    return texto if len(texto) <= limite else texto[:limite].rsplit(" ", 1)[0] + "…"


def resumir_aspecto(resenas, aspecto, usadas):
    # De las reseñas que hablan de este aspecto, ¿cuántas lo hacen bien y cuántas mal?
    hablan = resenas[resenas[aspecto] != ""]
    if len(hablan) < MIN_MENCIONES:
        return None
    # La "voz real" es la reseña más votada como útil que no hayamos enseñado ya en otro tema:
    # así cada persona aparece una sola vez por juego
    ordenadas = hablan.sort_values("votos_util", ascending=False)
    libres = ordenadas[~ordenadas["id"].astype(str).isin(usadas)]
    voz = (libres if len(libres) else ordenadas).iloc[0]
    usadas.add(str(voz["id"]))
    return {"menciones": len(hablan), "pos": pct(hablan[aspecto] == "pos"),
            "neg": pct(hablan[aspecto] == "neg"),
            "voz": {"texto": recortar(voz["texto"]), "es": TRADUCCIONES.get(recortar(voz["texto"])),
                    "recomienda": bool(voz["recomienda"]),
                    "horas": float(voz["horas"])}}


def resumir_juego(nombre, todas, clasificadas):
    # La rareza de la carta sale del % de jugadores que recomiendan el juego
    recomienda = pct(todas["recomienda"])
    usadas = set()  # Reseñas ya elegidas como "voz real" de este juego
    return {"juego": nombre, **ficha(nombre), "resenas": len(todas), "recomienda": recomienda,
            "rareza": next(r for minimo, r in RAREZAS if recomienda >= minimo),
            "perfiles": {p: pct(g["recomienda"]) for p, g in todas.groupby("perfil") if len(g)},  # App Store: sin horas
            "clasificadas": len(clasificadas),
            "aspectos": {a: resumir_aspecto(clasificadas, a, usadas) for a in ASPECTOS}}


def muestra_resenas(clasificadas, por_juego=150):
    # Para el explorador de la web: las reseñas más votadas como útiles de cada juego, con sus aspectos
    muestra = clasificadas.sort_values("votos_util", ascending=False).groupby("juego").head(por_juego)
    return [{"j": r["juego"], "t": recortar(r["texto"], 320), "e": TRADUCCIONES.get(recortar(r["texto"], 320)),
             "r": bool(r["recomienda"]),
             "h": round(float(r["horas"])), "v": int(r["votos_util"]),
             "a": {a: r[a] for a in ASPECTOS if r[a]}} for _, r in muestra.iterrows()]


def resumir():
    # Cargamos las traducciones que ya existan (si no hay, la web enseña el texto en inglés)
    global TRADUCCIONES
    TRADUCCIONES = json.loads(CACHE.read_text(encoding="utf-8")) if CACHE.exists() else {}
    resenas = pd.read_csv(RAIZ / "data" / "resenas.csv", dtype={"id": str})
    ia = pd.read_csv(RAIZ / "data" / "resenas_clasificadas.csv", dtype=str).fillna("")
    clasificadas = resenas.merge(ia, on="id")
    # Fechas de salida (las busca src/fechas.py antes de publicar; si faltan, la web no las enseña)
    ruta_fechas = RAIZ / "data" / "fechas.json"
    fechas = json.loads(ruta_fechas.read_text(encoding="utf-8")) if ruta_fechas.exists() else {}
    ruta_historial = RAIZ / "data" / "historial.json"  # Votos por mes de Steam (src/historial.py)
    historial = json.loads(ruta_historial.read_text(encoding="utf-8")) if ruta_historial.exists() else {}

    # Un resumen por juego, de más a menos recomendado
    juegos = [resumir_juego(nombre, grupo, clasificadas[clasificadas["juego"] == nombre])
              for nombre, grupo in resenas.groupby("juego")]
    for j in juegos:
        j["salida"] = fechas.get(j["juego"])
        j["historial"] = historial.get(j["juego"], [])
    juegos.sort(key=lambda j: -j["recomienda"])

    datos = {"total": len(resenas), "clasificadas": len(clasificadas), "juegos": juegos}
    (RAIZ / "web" / "data.json").write_text(json.dumps(datos, ensure_ascii=False), encoding="utf-8")
    # Las 200 reseñas de control, sin las etiquetas de la IA, para etiquetarlas a mano en la web (#/validar)
    manual = pd.read_csv(RAIZ / "data" / "validacion_manual.csv", sep=";", encoding="utf-8-sig", dtype=str)
    (RAIZ / "web" / "validacion.json").write_text(
        manual[["id", "juego", "texto"]].to_json(orient="records", force_ascii=False), encoding="utf-8")
    # El explorador carga este archivo aparte, solo cuando alguien entra en esa pantalla
    (RAIZ / "web" / "resenas.json").write_text(
        json.dumps(muestra_resenas(clasificadas), ensure_ascii=False), encoding="utf-8")
    print(f"data.json listo: {len(clasificadas)} de {len(resenas)} reseñas clasificadas")


if __name__ == "__main__":
    resumir()
