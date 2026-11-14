# Junta las reseñas descargadas de todos los juegos en una sola tabla y la limpia.
# Quita las repetidas, las demasiado cortas y el spam, y clasifica a cada jugador por horas.
# Uso: python src/limpiar.py

from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parent.parent
MIN_CARACTERES = 20


def es_spam(texto):
    # Spam = casi sin letras (dibujos hechos con símbolos)
    # o la misma palabra repetida muchas veces ("good good good good...")
    letras = sum(c.isalpha() for c in texto) / len(texto)
    palabras = texto.lower().split()
    repetitivo = len(palabras) >= 10 and len(set(palabras)) / len(palabras) < 0.3
    return letras < 0.5 or repetitivo


def limpiar():
    # Juntamos los CSV de todos los juegos en una sola tabla
    df = pd.concat(pd.read_csv(f) for f in (RAIZ / "data" / "raw").glob("*.csv"))
    antes = df.groupby("juego").size()

    # Fuera las repetidas, los espacios sobrantes, las muy cortas y el spam
    df = df.drop_duplicates("id")
    df["texto"] = df["texto"].fillna("").str.strip()
    df = df[df["texto"].str.len() >= MIN_CARACTERES]
    df = df[~df["texto"].map(es_spam)]

    # Pasamos los minutos a horas y la fecha a un formato que se lee
    df["horas"] = (df.pop("minutos_jugados") / 60).round(1)
    df["fecha"] = pd.to_datetime(df["fecha"], unit="s").dt.date

    # Etiqueta según lo jugado: novato (<10 h), medio o veterano (100 h o más)
    df["perfil"] = pd.cut(df["horas"], [0, 10, 100, float("inf")], right=False,
                          labels=["novato", "medio", "veterano"])

    # Si ya teníamos reseñas de otros juegos, las conservamos tal cual (y así no se pierde su clasificación)
    salida = RAIZ / "data" / "resenas.csv"
    if salida.exists():
        previas = pd.read_csv(salida, dtype={"id": str})
        previas = previas[~previas["juego"].isin(df["juego"].unique())]
        df = pd.concat([previas, df.astype({"id": str})])
    df.to_csv(salida, index=False)
    # Resumen: cuántas había y cuántas quedan de cada juego
    print(pd.DataFrame({"antes": antes, "despues": df.groupby("juego").size()}))


if __name__ == "__main__":
    limpiar()
