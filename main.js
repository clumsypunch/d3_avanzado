// El archivo incluye reproducciónn de música.
// Al final se explica como apagarlo por si acaso 😅

const SERIES_URL =
  "https://raw.githubusercontent.com/Hernan4444/public_files/main/db_series.csv";

const SVG1 = d3.select("#vis-1").append("svg");
const SVG2 = d3.select("#vis-2").append("svg");

// Editar tamaños como estime conveniente
const WIDTH_VIS_1 = 800;
const HEIGHT_VIS_1 = 250;

const WIDTH_VIS_2 = 800;
const HEIGHT_VIS_2 = 1600;
const MARGIN = {
  top: 10,
  bottom: 70,
  right: 30,
  left: 30,
};

// Ajustar tamaño de los SVG
SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);
SVG2.attr("width", WIDTH_VIS_2).attr("height", HEIGHT_VIS_2);

// Contenedores de la visualización
function createContainer(svg) {
    return svg.append("g").attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);
  }
  
const contaninerYAxis = createContainer(SVG1);
const contaninerXAxis = createContainer(SVG1);
const contaninerBars = createContainer(SVG1);
const containerCharacters = createContainer(SVG2);

crearSeries();

function crearSeries() {
  /* 
    Esta función utiliza el dataset indicado en SERIES_URL para crear 
    la primeva visualización.
    En esta visualización están las 3 series que deben ser dibujadas aplicando data-join 
    */
  d3.csv(SERIES_URL, d3.autoType).then((series) => {
    console.log(series);
    console.log(series.map((d) => d.serie));

    // No olvides actualizar los <span> con el "style" de background-color
    // según el color categóricos elegidos. Cada span tiene un ID único.

    // yScale is only the height of the viz and its the max value between series.personajes_extras and series.personajes_recurrentes

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(series, (d) => d.personajes_extras + d.personajes_recurrentes)*1.1])
        .range([HEIGHT_VIS_1, 0]);

    const yAxis = d3.axisLeft(yScale);
    contaninerYAxis.transition().duration(500).call(yAxis).selectAll("rect");


    const xScale = d3.scaleBand()
        .domain(series.map((d) => d.serie))
        .range([0, WIDTH_VIS_1 - MARGIN.left - MARGIN.right])
        .padding(1);

    const xAxis = d3.axisBottom(xScale);
    contaninerXAxis.transition().duration(500).call(xAxis).selectAll("rect");

    const bars = contaninerBars
        .selectAll("g")
        .data(series)
        .join(books => {
            const bookLeft = books
              .append("rect")
              .attr("class", d => d.manga ? "legendMangaTrue" : "legendMangaFalse")

            bookLeft
              .attr("x", (d) => xScale(d.serie))
              .attr("y", (d) => yScale(d.personajes_extras))
              .attr("width", xScale.bandwidth() / 3)
              .attr("height", (d) => HEIGHT_VIS_1 - yScale(d.personajes_extras));

            const bookMiddle = books
              .append("rect");
              

            bookMiddle
              .attr("x", (d) => xScale(d.serie) + xScale.bandwidth() / 3)
              .attr("y", HEIGHT_VIS_1 - 50)
              .attr("width", xScale.bandwidth() / 3)
              .attr("height", 50)
              .attr("fill", (d) => d3.interpolateTurbo(d.capitulos / 200));

            const bookRight = books
              .append("rect")
              .attr("class", d => d.serie);

            bookRight
              .attr("x", (d) => xScale(d.serie) + 2 * xScale.bandwidth() / 3)
              .attr("y", (d) => yScale(d.personajes_recurrentes))
              .attr("width", xScale.bandwidth() / 3)
              .attr("height", (d) => HEIGHT_VIS_1 - yScale(d.personajes_recurrentes));

            return books;
          },
          update => update,
          exit => exit
        )

        // escalas a partir de los datos
        positionScale = d3.scaleBand(
          d3.extend(series, d => d.serie),
          ["Dragon Ball", "Dragon Ball Z", "Dragon Ball GT"]
        )

        // escala de los personajes
        characterCategory = d3.scaleOrdinal(d3.schemaDark2)
        .domain(d3.map(series, d => d.serie)) 

        console.log(characterCategory.domain())

        bars.on("click", (event, d) => {
          bars.selectAll("rect").transition().duration(500).attr("opacity", 0.5);
          bars.select(`.${d.serie}`).transition().duration(500).attr("opacity", 1);
          preprocesarPersonajes(d.serie, false);
        });
    /* 
        Cada vez que se haga click en un conjunto de libros. Debes llamar a
        preprocesarPersonajes(serie, false) donde "serie" 
        corresponde al nombre de la serie presionada.
    
        preprocesarPersonajes se encargará de ejecutar a crearPersonajes(...)
        */
  });
}

function crearPersonajes(dataset, serie, filtrar_dataset, ordenar_dataset) {
  // Actualizo nombre de un H4 para saber qué hacer con el dataset
  let texto = `Serie: ${serie} - Filtrar: ${filtrar_dataset} - Orden: ${ordenar_dataset}`;
  d3.selectAll("#selected").text(texto);

  // Nos quedamos con los personajes asociados a la serie seleccionada
  let datos = dataset.filter((d) => {
    if (serie == "Dragon Ball") {
      return d.Dragon_ball == true;
    } else if (serie == "Dragon Ball Z") {
      return d.Dragon_ball_z == true;
    } else if (serie == "Dragon Ball GT") {
      return d.Dragon_ball_gt == true;
    }
  });

  // 1. Filtrar, cuando corresponde, por poder_aumenta > 10
  // Completar aquí
  console.log(filtrar_dataset);

  // 2. Ordenar, según corresponda, los personajes. Completar aquí
  console.log(ordenar_dataset);

  // 3. Confeccionar la visualización
  // Todas las escalas deben estar basadas en la información de "datos"
  // y NO en "dataset".

  console.log(datos);
  // No olvides que está prohibido el uso de loop (no son necesarios)
  // Y debes aplicar correctamente data-join
  // ¡Mucho éxito 😁 !
}

/* 
Código extra para reproducir música acorde a la tarea.
Si no quieres escuchar cuando se carga la página, solo cambia la línea:
let playAudio = true; por let playAudio = false;
O bien elimina todo el código que está a continuación 😅 
*/
try {
  const audio = new Audio(
    "https://github.com/Hernan4444/public_files/raw/main/dbgt.mp3"
  );
  audio.volume = 0.3;
  audio.loop = true;
  let playAudio = false;
  if (playAudio) {
    audio.play();
    d3.select("#sound").text("OFF Music 🎵");
  }
  d3.select("#sound").on("click", (d) => {
    playAudio = !playAudio;
    if (playAudio) {
      audio.play();
      d3.select("#sound").text("OFF Music 🎵");
    } else {
      audio.pause();
      d3.select("#sound").text("ON Music 🎵");
    }
  });
} catch (error) {}
