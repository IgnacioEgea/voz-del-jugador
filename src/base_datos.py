# Mete todos los datos del proyecto en una base de datos SQLite (un solo archivo: data/voz.db)
# y después ejecuta cada consulta de la carpeta sql/, guardando su resultado como CSV para el dashboard.
#
# Tablas:
#   juegos             un juego por fila (tienda, género, fechas)
#   resenas            una reseña por fila (texto, si recomienda, horas, fecha…)
#   temas_ia           lo que dijo la IA: una fila por reseña y tema mencionado, con su sentimiento
#   historial_mensual  votos a favor y en contra de Steam cada mes (historial oficial)
#   actualizaciones    fecha y título de los parches y temporadas anunciados en Steam
import json
import sqlite3
from pathlib import Path

import pandas as pd
from juegos import JUEGOS, APPSTORE, ficha

RAIZ = Path(__file__).resolve().parent.parent
DATOS, SQL, SALIDA = RAIZ / "data", RAIZ / "sql", RAIZ / "web" / "datos"
leer_json = lambda nombre: json.loads((DATOS / nombre).read_text(encoding="utf-8")) if (DATOS / nombre).exists() else {}

# 1) Juegos: sale del catálogo de juegos.py y de las fechas que buscó fechas.py
fechas = leer_json("fechas.json")
nombres = [d[0] for d in JUEGOS.values()] + [d[0] for d in APPSTORE.values()]
juegos = pd.DataFrame([{"id": f["appid"], "nombre": n, "genero": f["genero"], "tienda": f["fuente"],
                        "fecha_salida": fechas.get(n), "fecha_cierre": f.get("cerrado")}
                       for n in nombres for f in [ficha(n)]])
id_de = dict(zip(juegos["nombre"], juegos["id"]))

# 2) Reseñas: cambiamos el nombre del juego por su número (id) y marcamos el idioma
resenas = pd.read_csv(DATOS / "resenas.csv", dtype={"id": str})
resenas = resenas.assign(juego_id=resenas["juego"].map(id_de), idioma="en", recomienda=resenas["recomienda"].astype(int))
resenas = resenas[["id", "juego_id", "texto", "recomienda", "fecha", "horas", "perfil", "votos_util", "idioma"]]

# 3) Temas de la IA: de "una columna por tema" a "una fila por tema mencionado" (formato largo, mejor para SQL)
# Si una tanda cortada guardó dos veces la misma reseña, nos quedamos con la última
ia = pd.read_csv(DATOS / "resenas_clasificadas.csv", dtype=str).drop_duplicates("id", keep="last")
temas = (ia.melt(id_vars="id", var_name="tema", value_name="sentimiento").dropna()
         .rename(columns={"id": "resena_id"}))

# 4) Historial mensual y 5) actualizaciones (si se descargaron antes con historial.py y actualizaciones.py)
historial = pd.DataFrame([{"juego_id": id_de[n], "mes": m, "positivos": s, "negativos": no}
                          for n, filas in leer_json("historial.json").items() for m, s, no in filas])
parches = pd.DataFrame([{"juego_id": id_de[n], **a} for n, lista in leer_json("actualizaciones.json").items() for a in lista])

# Creamos la base de datos desde cero, con claves para que las tablas se unan bien
ruta = DATOS / "voz.db"
ruta.unlink(missing_ok=True)
with sqlite3.connect(ruta) as con:
    con.executescript("""
      CREATE TABLE juegos (id INTEGER PRIMARY KEY, nombre TEXT UNIQUE, genero TEXT, tienda TEXT,
                           fecha_salida TEXT, fecha_cierre TEXT);
      CREATE TABLE resenas (id TEXT PRIMARY KEY, juego_id INTEGER REFERENCES juegos(id), texto TEXT,
                            recomienda INTEGER, fecha TEXT, horas REAL, perfil TEXT, votos_util INTEGER, idioma TEXT);
      CREATE TABLE temas_ia (resena_id TEXT REFERENCES resenas(id), tema TEXT,
                             sentimiento TEXT CHECK (sentimiento IN ('pos', 'neu', 'neg')), PRIMARY KEY (resena_id, tema));
      CREATE TABLE historial_mensual (juego_id INTEGER REFERENCES juegos(id), mes TEXT, positivos INTEGER, negativos INTEGER);
      CREATE TABLE actualizaciones (juego_id INTEGER REFERENCES juegos(id), fecha TEXT, titulo TEXT, url TEXT);
      CREATE INDEX i_resenas_juego ON resenas(juego_id);
      CREATE INDEX i_temas_tema ON temas_ia(tema);""")
    for nombre, tabla in [("juegos", juegos), ("resenas", resenas), ("temas_ia", temas),
                          ("historial_mensual", historial), ("actualizaciones", parches)]:
        if len(tabla):
            tabla.to_sql(nombre, con, if_exists="append", index=False)
        print(f"{nombre}: {len(tabla)} filas")

    # Cada consulta de sql/ se ejecuta y su resultado se guarda como CSV (lo que lee el dashboard)
    SALIDA.mkdir(parents=True, exist_ok=True)
    for consulta in sorted(SQL.glob("*.sql")):
        resultado = pd.read_sql_query(consulta.read_text(encoding="utf-8"), con)
        resultado.to_csv(SALIDA / f"{consulta.stem}.csv", index=False)
        print(f"{consulta.name}: {len(resultado)} filas")
