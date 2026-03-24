# =============================================================
# CONFIGURACIÓN DEL PROYECTO JWF
# =============================================================
# Archivo de referencia para comandos y configuraciones reutilizables.
# Cargar variables: source .claude-config.sh

# -------------------------------------------------------------
# POSTGRESQL
# -------------------------------------------------------------
export PGPASSWORD=12345
export PG_HOST=localhost
export PG_PORT=5432
export PG_USER=postgres
export PG_DB=JWF
export PSQL='"/c/Program Files/PostgreSQL/18/bin/psql.exe"'

# Alias de conexión rápida
alias psql-jwf='PGPASSWORD=$PGPASSWORD "/c/Program Files/PostgreSQL/18/bin/psql.exe" -U $PG_USER -h $PG_HOST -p $PG_PORT -d $PG_DB'

# -------------------------------------------------------------
# COMANDOS ÚTILES POSTGRESQL
# -------------------------------------------------------------

# Listar usuarios que pueden iniciar sesión
# PGPASSWORD=$PGPASSWORD "/c/Program Files/PostgreSQL/18/bin/psql.exe" -U $PG_USER -h $PG_HOST -p $PG_PORT -d $PG_DB \
#   -c "SELECT usename, usesuper, usecreatedb, valuntil FROM pg_user ORDER BY usename;"

# Listar todas las bases de datos
# PGPASSWORD=$PGPASSWORD "/c/Program Files/PostgreSQL/18/bin/psql.exe" -U $PG_USER -h $PG_HOST -p $PG_PORT \
#   -c "\l"

# Listar tablas de la BD JWF
# PGPASSWORD=$PGPASSWORD "/c/Program Files/PostgreSQL/18/bin/psql.exe" -U $PG_USER -h $PG_HOST -p $PG_PORT -d $PG_DB \
#   -c "\dt"

# Listar schemas
# PGPASSWORD=$PGPASSWORD "/c/Program Files/PostgreSQL/18/bin/psql.exe" -U $PG_USER -h $PG_HOST -p $PG_PORT -d $PG_DB \
#   -c "\dn"

# -------------------------------------------------------------
# CONVENCIÓN IMPORTANTE - PostgreSQL
# -------------------------------------------------------------
# Las tablas y columnas fueron creadas con nombres en MAYÚSCULAS.
# PostgreSQL requiere comillas dobles para preservarlas:
#   CORRECTO:   SELECT "OPER_CODIGO" FROM "GEN_OPERADOR"
#   INCORRECTO: SELECT OPER_CODIGO FROM "GEN_OPERADOR"  (falla en runtime)

# -------------------------------------------------------------
# SCRIPTS ÚTILES
# -------------------------------------------------------------

# Crear/resetear usuario admin (login: admin / pass: admin123)
# cd backend && node src/scripts/seed-admin.js

# Iniciar backend en desarrollo
# cd backend && npm run dev
