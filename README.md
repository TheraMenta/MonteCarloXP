# MonteCarloXP
**Simulación de Monte Carlo para el Análisis de Concentración de Mercados**  
Organización Industrial · Grupo E · Universidad Católica del Norte

---

## Descripción

MonteCarloXP es una aplicación web de una sola página que permite analizar la concentración de un mercado mediante simulación de Monte Carlo. El usuario define un caso particular (un vector de cuotas de mercado para N empresas), ejecuta un número configurable de iteraciones que generan mercados aleatorios bajo la misma dimensión, y compara su caso contra la distribución empírica resultante usando cuatro indicadores estándar de concentración industrial.

La aplicación corre íntegramente en el navegador: no requiere servidor, instalación de dependencias ni conexión a internet tras la carga inicial.

---

## Ejecución local

### Requisitos

- Un navegador moderno con soporte para HTML5 Canvas y ES6+ (Chrome 90+, Firefox 88+, Edge 90+, Safari 14+).
- Los archivos de audio en `assets/` deben estar presentes para la reproducción de sonido. Si el navegador bloquea audio sin interacción del usuario, el sonido simplemente no se reproduce sin afectar la funcionalidad.

### Pasos

1. Descarga o clona el repositorio:
```bash
   git clone https://github.com/<usuario>/MonteCarloXP.git
   cd MonteCarloXP
```

2. Verifica que la estructura de archivos sea la siguiente:

```{text}
MonteCarloXP/
├── index.html
├── style.css
├── script.js
└── assets/
   ├── wallpaper.jpg
   ├── doggo.jpg
   ├── startup.flac
   ├── error.flac
   ├── tada.flac
   ├── ding.flac
   └── exclamation.flac
```

3. Abre `index.html` directamente en el navegador:
   - En Linux/macOS: `xdg-open index.html` o `open index.html`
   - En Windows: doble clic sobre `index.html`
   - O arrastra el archivo a una ventana del navegador

> **Nota técnica:** algunos navegadores restringen la reproducción de audio en páginas abiertas como `file://` por su política de autoplay. Si los sonidos no se reproducen, sirve la aplicación desde un servidor local ligero:
> ```bash
> # Python 3
> python3 -m http.server 8080
> # Luego abre http://localhost:8080 en el navegador
> ```

---

## Guía de navegación

### Pantalla de inicio

Al abrir la aplicación se muestra una pantalla de inicio de sesión estilo Windows XP. Haz clic en cualquier parte de la pantalla para ingresar al escritorio. Al hacerlo suena el audio de bienvenida y aparece la interfaz principal con dos paneles de trabajo.

### Panel izquierdo — Configuración y caso particular

#### Sección: Configuración

| Control | Descripción |
|---|---|
| **Número de empresas (N)** | Define cuántas firmas componen el mercado simulado. Rango válido: 2 a 100. |
| **Iteraciones** | Número de mercados aleatorios que se generarán. Mínimo: 100. Máximo: 10.000. Valor por defecto: 1.000. El tope existe porque la simulación corre en el hilo principal del navegador: valores mayores bloquean la interfaz y pueden provocar el diálogo "La página no responde". |
| **Indicador de concentración** | Selecciona el índice con el que se calculará y graficará la distribución (IHH, CRk, IE o ID). |
| **Número de firmas líderes (k)** | Aparece solo al seleccionar CRk. Permite elegir libremente cuántas firmas líderes considera el ratio, entre 1 y 100 (no puede superar N al ejecutar la simulación). |
| **Generar caso puntual** | Genera un vector aleatorio de N cuotas de mercado que suman exactamente 100 %, usando una distribución Dirichlet asimétrica (α = 0,5). Muestra un preview con las tres cuotas más grandes. |
| **Ejecutar Simulación MonteCarloXP** | Lanza la simulación completa. Si no se generó un caso puntual previamente, lo crea de forma automática. |

> Si se configuran más de 1.000 iteraciones aparecerá una advertencia de rendimiento la primera vez. Esta advertencia se muestra una sola vez por sesión.

#### Sección: Definición de Caso Particular

Permite definir el vector de cuotas que se usará como caso particular en el gráfico y en el módulo evaluador.

- **Modo Manual:** aparece un campo por cada empresa (Empresa 1 hasta Empresa N). Ingresa los porcentajes individualmente. La aplicación valida que cada cuota esté entre 0 y 100 y que la suma total sea exactamente 100 %.
- **Modo Aleatorio:** usa el botón *Rellenar aleatoriamente* para que la aplicación genere y complete los campos. Los valores pueden ajustarse a mano antes de calcular. La suma está garantizada en exactamente 100 % mediante el algoritmo de Largest Remainder.
- **Calcular y graficar caso particular:** toma los valores ingresados, calcula el indicador seleccionado y actualiza la línea verde sobre el histograma. Requiere que la simulación haya sido ejecutada previamente.

#### Sección: Distribución de Cuotas del Caso Particular

Muestra gráficamente las cuotas del caso particular con dos vistas:

- **Barras por empresa:** barras ordenadas de mayor a menor cuota, con la empresa en el eje X y el porcentaje de participación en el eje Y.
- **Curva de cuotas:** estimación de densidad KDE sobre los valores de cuota. En esta vista aparece una línea vertical verde que marca la cuota media del vector (μ).

Debajo del gráfico se muestra una nota con el valor del indicador calculado para ese caso, su percentil dentro de la distribución de Monte Carlo y el listado completo de cuotas ordenadas de mayor a menor.

### Panel derecho — Gráfico y evaluación

#### Sección: Gráfico

Muestra la distribución empírica del indicador seleccionado sobre los mercados simulados.

- **Histograma:** barras de frecuencia con número de bins calculado por la regla ⌈√n⌉.
- **Curva de densidad:** estimación de densidad por kernel gaussiano con ancho de banda de Silverman (h = 1,06 σ n⁻¹/⁵).
- **Línea verde vertical:** marca el valor del indicador del caso particular. La etiqueta muestra el nombre del indicador, el valor exacto y el percentil dentro de la distribución simulada. Puede mostrarse u ocultarse con el botón *Mostrar/Ocultar línea del caso*.

Bajo el canvas aparecen dos líneas de información:

- **Distribución simulada:** media, desviación estándar, mínimo y máximo de la distribución empírica.
- **Caso particular:** valor del indicador y percentil que ocupa dentro de la distribución, destacados en verde.

Los botones *Histograma* y *Curva de densidad* permiten cambiar el modo de visualización en cualquier momento sin perder los resultados.

#### Sección: Evaluación

Pregunta al usuario cuál es el nivel de concentración del mercado definido por el caso particular, con tres opciones posibles:

- Mercado poco concentrado
- Mercado moderadamente concentrado
- Mercado altamente concentrado

Al hacer clic en *Verificar respuesta* la aplicación indica si la respuesta es correcta o incorrecta, y muestra en ambos casos el valor exacto del indicador, el percentil dentro de la distribución simulada, la clasificación correcta y la fuente del umbral utilizado. Si la respuesta es correcta suena un efecto de celebración; si es incorrecta suena el efecto de error.

El botón *Reiniciar* limpia la selección para intentar de nuevo sin perder la simulación ni el gráfico.

Al pie de la sección se incluye una tabla de referencia con los umbrales de todos los indicadores y sus fuentes.

---

## Indicadores de concentración

### IHH — Índice Herfindahl-Hirschman

$$IHH = \sum_{i=1}^{N} (s_i \cdot 100)^2$$

donde $s_i$ es la cuota de mercado de la empresa $i$ expresada como fracción. El resultado está en el rango (0, 10.000].

| Nivel | Umbral |
|---|---|
| Poco concentrado | IHH < 1.500 |
| Moderadamente concentrado | 1.500 ≤ IHH < 2.500 |
| Altamente concentrado | IHH ≥ 2.500 |

**Fuente:** Fiscalía Nacional Económica de Chile (FNE), *Guía para el Análisis de Operaciones de Concentración Horizontales*, mayo 2022. Estos umbrales son equivalentes a los utilizados por el U.S. Department of Justice y la Federal Trade Commission en sus *Horizontal Merger Guidelines* (2010).

---

### CRk — Ratio de Concentración de orden k

$$CR_k = \sum_{i=1}^{k} s_{(i)} \cdot 100$$

donde $s_{(i)}$ son las cuotas ordenadas de mayor a menor. El valor de k es configurable por el usuario entre 1 y 100 (sin superar N). El resultado es un porcentaje en el rango (0, 100].

| Nivel | Umbral |
|---|---|
| Poco concentrado | CRk < 40 % |
| Moderadamente concentrado | 40 % ≤ CRk < 60 % |
| Altamente concentrado | CRk ≥ 60 % |

**Fuente:** Convención académica ampliamente utilizada en organización industrial. Referenciada en Carlton, D. y Perloff, J., *Modern Industrial Organization* (4ª ed., 2005) y Tirole, J., *The Theory of Industrial Organization* (1988). No tiene respaldo regulatorio oficial en Chile.

---

### IE — Índice de Entropía de Shannon (normalizado)

$$IE_{norm} = \frac{-\sum_{i=1}^{N} s_i \ln(s_i)}{\ln(N)}$$

El resultado está en el rango [0, 1]. A diferencia de los demás indicadores, **un valor alto de IE indica menor concentración** (mayor dispersión del mercado entre las firmas).

| Nivel | Umbral |
|---|---|
| Poco concentrado | IE ≥ 0,67 |
| Moderadamente concentrado | 0,33 ≤ IE < 0,67 |
| Altamente concentrado | IE < 0,33 |

**Fuente:** Shannon, C., *A Mathematical Theory of Communication*, Bell System Technical Journal (1948); Theil, H., *Economics and Information Theory* (1967). Los umbrales son orientativos y de uso académico; no cuentan con respaldo regulatorio oficial.

---

### ID — Índice de Dominancia

$$ID = \frac{HHI_{norm} - \frac{1}{N}}{1 - \frac{1}{N}}, \quad HHI_{norm} = \frac{IHH}{10.000}$$

El resultado está en el rango [0, 1]. Mide qué tan lejos está la distribución de cuotas del caso de competencia perfecta (todas iguales), relativo al caso de monopolio absoluto.

| Nivel | Umbral |
|---|---|
| Poco concentrado | ID < 0,25 |
| Moderadamente concentrado | 0,25 ≤ ID < 0,50 |
| Altamente concentrado | ID ≥ 0,50 |

**Fuente:** García Alba Idunate, P., *A Dominance Index for the Measurement of Market Power*, Economía Mexicana (1994). Los umbrales son orientativos; no cuentan con respaldo regulatorio oficial.

---

## Generación de cuotas aleatorias

Los vectores de cuotas se generan mediante una distribución **Dirichlet(α)** con α = 0,5. Este valor subunitario produce distribuciones asimétricas donde una o pocas firmas tienden a concentrar la mayor parte del mercado, lo que resulta más representativo de mercados reales que una distribución uniforme. La implementación usa el algoritmo de Marsaglia-Tsang (2000) para el muestreo Gamma.

La representación en pantalla de los porcentajes utiliza el algoritmo de **Largest Remainder (Hamilton)**: cada cuota se redondea al piso y los decimales faltantes se distribuyen a los elementos con mayor parte fraccionaria, garantizando que la suma visible sea siempre exactamente 100 % independientemente de N.

---

## Tecnologías utilizadas

- HTML5 / CSS3 / JavaScript (ES6+) — sin frameworks ni dependencias de runtime
- HTML5 Canvas API — renderizado de ambos gráficos (Monte Carlo y cuotas del caso particular)
- MathJax 3 (CDN) — renderizado de fórmulas matemáticas
- Audio API del navegador — efectos de sonido en formato FLAC

---

*Proyecto académico — Organización Industrial · Grupo E · 2026*
