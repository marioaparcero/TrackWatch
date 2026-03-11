# TrackWatch
Este es un bot de Discord que recupera las notas del parche y la información de la tienda de Overwatch.

## Funciones
Obtener datos de la tienda de Overwatch.
Obtener datos de la tienda de la Liga Overwatch.
Verificar automáticamente las actualizaciones de las notas del parche de Overwatch.
## Uso
Primero, cambie el nombre del archivo de configuración a `config.json` y ábralo para modificar cada entrada según corresponda. Las entradas son las siguientes:

* token - Valor del token del bot de Discord.
* clientId - Valor del ID del cliente del bot de Discord.
* guildId - Valor del ID del servidor de Discord.
* shopchannel - Valor del ID del canal donde se enviarán los mensajes de información de la tienda.
* patchchannel - Valor del ID del canal donde se enviarán los mensajes de información de las notas del parche.
Después de eso, simplemente ejecute el comando `node index.js` y estará listo.

# Próximamente
- [ ] Añadir soporte para la tienda de la Liga Overwatch.
- [ ] Nuevo formato para la plantilla de las noticias de Overwatch.

# Ejemplo de plantilla de noticias de héroes de Overwatch

### ACTUALIZACIONES DE HÉROES
**TANQUE 🛡️**
🐰 **D.Va**
Pistola de luz
- Se ha reducido el tamaño base de los proyectiles de 0,25 a 0,2 metros. Ahora el tamaño en total de los proyectiles es de 0,3 metros.    

🐷 **Roadhog**
Inhalador
- Se ha aumentado la reducción de daño del 40 al 50 %.

💪 **Zarya**
Cañón de partículas
- Se ha aumentado el daño mínimo del disparo principal de 85 a 95 por segundo.
- Se ha aumentado el daño máximo del disparo principal de 170 a 190 por segundo.

**DAÑO ⚔️**
🏹 **Hanzo**
- Se ha reducido el tamaño base de los proyectiles de 0,1 a 0,075 metros. Ahora el tamaño en total de los proyectiles es de 0,175 metros. 

💣 **Junkrat**
Mina de conmoción
- Se ha reducido el tiempo de reutilización de 8 s a 7 s.
- Se ha aumentado el daño máximo de 110 a 120.
- Se ha aumentado el daño mínimo de 20 a 55.
--------------------------------------------------------------
# Ejemplo de plantilla de noticias de Overwatch

10 DE MARZO DE 2026
# NOTAS DEL PARCHE DE OVERWATCH: 10 DE MARZO DE 2026
## ACTUALIZACIONES DE HÉROES
**TANQUE**
D.VA
Pistola de luz
Se redujo el tamaño del proyectil base de 0.25 a 0.2 metros. El tamaño total del proyectil ahora es de 0.3 metros.
**DAÑO**
HANZO
Se redujo el tamaño de los proyectiles base de 0.1 a 0.075 metros. El tamaño total del proyectil ahora es de 0.175 metros.
**APOYO**
ILLARI
Torre de sanación
• Se redujo el tiempo de reutilización de 8 a 6 segundos. • Se redujo el tiempo de reutilización cuando la destruye el enemigo de 15 a 12 segundos.
Sol cautivo
Se aumentó el daño de explosión de Insolación de 100 a 160.
El daño de Insolación vuelve a tener la mecánica de declive de daño, que puede reducir el daño hasta un 25%.
 
- y luego se añadiría un índice -
# TE DAMOS LA BIENVENIDA A LA TEMPORADA 9: CAMPEONES
- NUEVO EVENTO: CRISIS CÓSMICA
- ACTUALIZACIONES DE JUEGO COMPETITIVO
 - Restablecimiento de rangos de habilidad
 - Partidas de colocación
 - etc
- ACTUALIZACIONES GLOBALES
  - PROGRESIÓN DE JUGADORES 
- ACTUALIZACIONES DE HÉROES