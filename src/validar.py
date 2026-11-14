# Comprueba si la IA clasifica bien, comparándola con etiquetas puestas a mano.
# Paso 1: python src/validar.py muestra  → crea una hoja con 200 reseñas al azar para etiquetar.
# Paso 2: python src/validar.py          → compara tus etiquetas con las de la IA (% de acierto).

import sys
from pathlib import Path

import pandas as pd

from clasificar import ASPECTOS

RAIZ = Path(__file__).resolve().parent.parent
IA = RAIZ / "data" / "resenas_clasificadas.csv"
MANUAL = RAIZ / "data" / "validacion_manual.csv"
EXCEL = {"sep": ";", "encoding": "utf-8-sig"}  # Así Excel en español lo abre bien por columnas


def crear_muestra():
    # 200 reseñas al azar; la semilla fija (42) hace que siempre salgan las mismas
    ya_clasificadas = pd.read_csv(IA, dtype={"id": str})["id"]
    resenas = pd.read_csv(RAIZ / "data" / "resenas.csv", dtype={"id": str})
    muestra = resenas[resenas["id"].isin(ya_clasificadas)].sample(200, random_state=42)
    # Dejamos una columna vacía por aspecto para que la rellenes con pos, neg o neu
    muestra = muestra[["id", "juego", "texto"]].assign(**{a: "" for a in ASPECTOS})
    muestra.to_csv(MANUAL, index=False, **EXCEL)
    print(f"Listo: rellena {MANUAL.name} con pos, neg o neu en los aspectos que mencione")


def comparar():
    # Leemos tus etiquetas (sin mayúsculas ni espacios de más) y las de la IA, en el mismo orden
    humano = pd.read_csv(MANUAL, dtype=str, **EXCEL).fillna("").set_index("id")
    humano[ASPECTOS] = humano[ASPECTOS].apply(lambda col: col.str.strip().str.lower())
    ia = pd.read_csv(IA, dtype=str).fillna("").set_index("id").loc[humano.index, ASPECTOS]
    iguales = humano[ASPECTOS] == ia

    # Dos notas por aspecto: acierto total y acierto solo cuando la reseña sí habla de él
    menciona = humano[ASPECTOS] != ""
    tabla = pd.DataFrame({"acierto_%": iguales.mean() * 100,
                          "acierto_si_lo_menciona_%": (iguales & menciona).sum() / menciona.sum() * 100,
                          "menciones": menciona.sum()})
    print(tabla.round(1))
    print(f"Reseñas con todo bien: {iguales.all(axis=1).mean() * 100:.1f} %")

    # Guardamos las reseñas en las que no coincidimos, para estudiar dónde falla
    fallos = humano[~iguales.all(axis=1)].join(ia, rsuffix="_ia")
    fallos.to_csv(RAIZ / "data" / "fallos.csv", **EXCEL)


if __name__ == "__main__":
    crear_muestra() if "muestra" in sys.argv else comparar()
