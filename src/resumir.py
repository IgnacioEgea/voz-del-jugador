# Resume las reseñas clasificadas en un archivo pequeño (web/data.json) que lee la web.
# Solo guarda porcentajes y unas pocas frases reales: así la web carga rápido.
# Uso: python src/resumir.py

import json
from pathlib import Path

import pandas as pd

from clasificar import ASPECTOS

RAIZ = Path(__file__).resolve().parent.parent
RAREZAS = [(80, "legendaria"), (65, "epica"), (50, "rara"), (0, "comun")]
MIN_MENCIONES = 20  # Con menos menciones, el porcentaje no es fiable y no lo enseñamos


def pct(condicion):
    # Porcentaje de casos que cumplen algo, sin decimales
    return int(round(condicion.mean() * 100))


def recortar(texto, limite=240):
    # Cortamos la reseña al final de una palabra, para no dejar palabras a medias
    return texto if len(texto) <= limite else texto[:limite].rsplit(" ", 1)[0] + "…"


def resumir_aspecto(resenas, aspecto):
    # De las reseñas que hablan de este aspecto, ¿cuántas lo hacen bien y cuántas mal?
    hablan = resenas[resenas[aspecto] != ""]
    if len(hablan) < MIN_MENCIONES:
        return None
    # La "voz real" es la reseña que más gente ha votado como útil
    voz = hablan.sort_values("votos_util", ascending=False).iloc[0]
    return {"menciones": len(hablan), "pos": pct(hablan[aspecto] == "pos"),
            "neg": pct(hablan[aspecto] == "neg"),
            "voz": {"texto": recortar(voz["texto"]), "recomienda": bool(voz["recomienda"]),
                    "horas": float(voz["horas"])}}


def resumir_juego(nombre, todas, clasificadas):
    # La rareza de la carta sale del % de jugadores que recomiendan el juego
    recomienda = pct(todas["recomienda"])
    return {"juego": nombre, "resenas": len(todas), "recomienda": recomienda,
            "rareza": next(r for minimo, r in RAREZAS if recomienda >= minimo),
            "perfiles": {p: pct(g["recomienda"]) for p, g in todas.groupby("perfil")},
            "clasificadas": len(clasificadas),
            "aspectos": {a: resumir_aspecto(clasificadas, a) for a in ASPECTOS}}


def resumir():
    resenas = pd.read_csv(RAIZ / "data" / "resenas.csv", dtype={"id": str})
    ia = pd.read_csv(RAIZ / "data" / "resenas_clasificadas.csv", dtype=str).fillna("")
    clasificadas = resenas.merge(ia, on="id")

    # Un resumen por juego, de más a menos recomendado
    juegos = [resumir_juego(nombre, grupo, clasificadas[clasificadas["juego"] == nombre])
              for nombre, grupo in resenas.groupby("juego")]
    juegos.sort(key=lambda j: -j["recomienda"])

    datos = {"total": len(resenas), "clasificadas": len(clasificadas), "juegos": juegos}
    (RAIZ / "web" / "data.json").write_text(json.dumps(datos, ensure_ascii=False), encoding="utf-8")
    print(f"data.json listo: {len(clasificadas)} de {len(resenas)} reseñas clasificadas")


if __name__ == "__main__":
    resumir()
