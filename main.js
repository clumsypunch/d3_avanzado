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
const HEIGHT_VIS_2 = 2100;
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

const containerYAxis = SVG1.append("g").attr(
  "transform",
  `translate(${MARGIN.left}, ${MARGIN.top})`
);
const containerXAxis = SVG1.append("g").attr(
  "transform",
  `translate(${MARGIN.left}, ${MARGIN.top})`
);
const containerBars = SVG1.append("g")
  .attr("width", WIDTH_VIS_1)
  .attr("height", HEIGHT_VIS_1);

const containerCharacters = SVG2.append("g")
  .attr("width", WIDTH_VIS_2)
  .attr("height", HEIGHT_VIS_2)
  .attr("transform", `translate(-${WIDTH_VIS_2 * 0.4},0)`);

function updateSeriesInfo(d) {
  d3.select("#detailName").text(d.serie);
  d3.select("#detailCaps").text(d.cantidad_caps);
  d3.select("#detailAventuras").text(d.aventuras);
  d3.select("#detailPersRecurrent").text(d.personajes_recurrentes);
  d3.select("#detailPersExtras").text(d.personajes_extras);
  d3.select("#detailPersManga").text(d.manga);
}

// tooltip
let tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

crearSeries();

function crearSeries() {
  /* 
    Esta función utiliza el dataset indicado en SERIES_URL para crear 
    la primeva visualización.
    En esta visualización están las 3 series que deben ser dibujadas aplicando data-join 
    */
  d3.csv(SERIES_URL, d3.autoType).then((series) => {
    console.log(series);

    // Definir escalas y ejes
    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(series, (d) =>
          Math.max(d.personajes_extras, d.personajes_recurrentes)
        ) * 1.1,
      ])
      .range([HEIGHT_VIS_1, 0]);

    const yAxis = d3.axisLeft(yScale);
    containerYAxis.transition().duration(500).attr("opacity", 0).call(yAxis);

    const xScale = d3
      .scaleBand()
      .domain(series.map((d) => d.serie))
      .range([0, WIDTH_VIS_1]);

    const xAxis = d3.axisTop(xScale);
    containerXAxis
      .transition()
      .duration(1000)
      .attr("transform", `translate(0, ${HEIGHT_VIS_1})`)
      .call(xAxis);

    containerXAxis.select(".domain").style("display", "none");
    containerXAxis.selectAll(".tick line").style("display", "none");
    containerXAxis
      .selectAll(".tick text")

      .style("font-size", "15px")
      .style("font-weight", "700")
      .style("fill", (d) => {
        switch (d) {
          case "Dragon Ball":
            return "#a655c6";
          case "Dragon Ball Z":
            return "#1b7301";
          case "Dragon Ball GT":
            return "#0000fe";
          default:
            return "#000";
        }
      });

    // Seleccionar y unir datos con los elementos rect
    const bars = containerBars
      .selectAll("g.book")
      .data(series)
      .join(
        (enter) => {
          const g = enter
            .append("g")
            .attr("class", "book")
            .attr("transform", (d) => `translate(${xScale(d.serie)}, 0)`);

          const tejueloHeight = 10;
          const tejueloColor = "#5a98d5";
          const middleRectWidth = (d) =>
            Math.min(
              xScale.bandwidth() *
                (d.aventuras / d3.max(series, (d) => d.aventuras)),
              (xScale.bandwidth() * 1.8) / 5
            );
          const withPos = xScale.bandwidth() / 5;

          // Barra 1
          g.append("rect")
            .attr("x", withPos * 0.9)
            .attr("y", (d) => yScale(d.personajes_extras))
            .attr("width", withPos)
            .attr(
              "height",
              (d) => HEIGHT_VIS_1 - yScale(d.personajes_extras) - 30
            )
            .attr("id", (d) =>
              d.manga ? "legendMangaTrue" : "legendMangaFalse"
            );

          // Tejuelo 1
          g.append("rect")
            .attr("x", withPos * 0.9)
            .attr("y", (d) => yScale(d.personajes_extras) + tejueloHeight)
            .attr("width", withPos)
            .attr("height", tejueloHeight)
            .attr("fill", tejueloColor);

          // Barra 2
          g.append("rect")
            .attr("x", withPos * 1.9)
            .attr("y", HEIGHT_VIS_1 - 80)
            .attr("width", middleRectWidth)
            .attr("height", 50)
            .attr("fill", (d) =>
              d3.interpolateGreys(
                d.cantidad_caps / d3.max(series, (d) => d.cantidad_caps)
              )
            );

          // Tejuelo 2
          g.append("rect")
            .attr("x", withPos * 1.9)
            .attr("y", HEIGHT_VIS_1 - 80 + tejueloHeight)
            .attr("width", middleRectWidth)
            .attr("height", tejueloHeight)
            .attr("fill", tejueloColor);

          // Barra 3
          g.append("rect")
            .attr("x", (d) => withPos * 1.9 + middleRectWidth(d))
            .attr("y", (d) => yScale(d.personajes_recurrentes) - 30)
            .attr("width", withPos)
            .attr(
              "height",
              (d) => HEIGHT_VIS_1 - yScale(d.personajes_recurrentes)
            )
            .attr("id", (d) => {
              switch (d.serie) {
                case "Dragon Ball":
                  return "legendDB";
                case "Dragon Ball GT":
                  return "legendDBGT";
                case "Dragon Ball Z":
                  return "legendDBZ";
                default:
                  return "";
              }
            });

          // Tejuelo 3
          g.append("rect")
            .attr("x", (d) => withPos * 1.9 + middleRectWidth(d))
            .attr(
              "y",
              (d) => yScale(d.personajes_recurrentes) - 30 + tejueloHeight
            )
            .attr("width", withPos)
            .attr("height", tejueloHeight)
            .attr("fill", tejueloColor);

          return g;
        },
        (update) => update,
        (exit) => exit
      );

    // update series info on load
    updateSeriesInfo(series[0]);
    preprocesarPersonajes(series[0].serie, false);

    // Event listeners ----------------------------------------------------
    bars.on("click", function (event, d) {
      bars.transition().duration(500).attr("opacity", 0.2);
      d3.select(this).transition().duration(500).attr("opacity", 1);
      preprocesarPersonajes(d.serie, false);
    });

    // mouse over, update class="textStart" with the corresponding serie
    bars.on("mouseover", (event, d) => {
      d3.select(event.currentTarget).style("cursor", "pointer");
      updateSeriesInfo(d);
    });

    // ----------------------------------------------------

    const parentNodeSeriesSelectionButton = "#vis-1 > svg > g:nth-child(3)";

    function addButtonClickHandler(
      parentNode,
      buttonId,
      childIndex,
      seriesIndex
    ) {
      d3.select(buttonId).on("click", function () {
        preprocesarPersonajes(d3.select(buttonId).text(), false);
        bars.transition().duration(500).attr("opacity", 0.2);
        d3.select(`${parentNode} > g:nth-child(${childIndex})`)
          .transition()
          .duration(500)
          .attr("opacity", 1);
        updateSeriesInfo(series[seriesIndex]);
      });
    }

    addButtonClickHandler(parentNodeSeriesSelectionButton, "#DragonBall", 1, 0);
    addButtonClickHandler(
      parentNodeSeriesSelectionButton,
      "#DragonBallGT",
      2,
      1
    );
    addButtonClickHandler(
      parentNodeSeriesSelectionButton,
      "#DragonBallZ",
      3,
      2
    );
    // ----------------------------------------------------

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
  // console.log(filtrar_dataset);

  datos = filtrar_dataset ? datos.filter((d) => d.poder_aumenta > 10) : datos;

  // 2. Ordenar, según corresponda, los personajes. Completar aquí
  // alfabético, poder_aumenta
  console.log(ordenar_dataset);
  // console.log(filteredData);

  datos.sort((a, b) => {
    if (a.personaje && b.personaje) {
      switch (ordenar_dataset) {
        case "alfabético":
          return a.personaje.localeCompare(b.personaje);
        case "poder_aumenta":
          return a.poder_aumenta - b.poder_aumenta;
        default:
          return 0;
      }
    } else {
      return 0;
    }
  });

  console.log(datos);

  // 3. Confeccionar la visualización
  // Todas las escalas deben estar basadas en la información de "datos"
  // y NO en "dataset".
  // No olvides que está prohibido el uso de loop (no son necesarios)
  // Y debes aplicar correctamente data-join
  // ¡Mucho éxito 😁 !

  // -------------------- Escalas --------------------
  const rightArmLengthScale = d3
    .scaleLog()
    .domain([1, d3.max(datos, (d) => d.poder_minimo)])
    .range([10, 50]);

    const leftArmLengthScale = d3
    .scaleLog()
    .domain([1, d3.max(datos, (d) => d.poder_minimo)])
    .range([2, 10]);

  const bodyHeightScale = d3
    .scaleLog()
    .domain([1, d3.max(datos, (d) => d.poder_promedio)])
    .range([30, 100]);

  const aventurasScale = d3
    .scaleDiverging(d3.interpolatePRGn)
    .domain([
      d3.min(datos, (d) => d.aventuras),
      d3.median(datos, (d) => d.aventuras),
      d3.max(datos, (d) => d.aventuras),
    ]);

  const NUMBER_OF_COLUMNS = 5;

  // viz 2
  containerCharacters
    .selectAll("g.character")
    .data(datos, (d) => d.personaje)
    .join(
      (enter) => {
        const character = enter
          .append("g")
          .attr("class", "character")
          .attr("opacity", 0)
          .attr("transform", (_, i) => {
            let x = (i % NUMBER_OF_COLUMNS) * (WIDTH_VIS_2 / NUMBER_OF_COLUMNS);
            let y =
              Math.floor(i / NUMBER_OF_COLUMNS) *
              (WIDTH_VIS_2 / NUMBER_OF_COLUMNS + 40);
            return `translate(${x}, ${y})`;
          });

        character.transition("fade-in").duration(500).attr("opacity", 1);

        // -------------------- char gliph --------------------

        // char head
        character
          .append("circle")
          .attr("cx", WIDTH_VIS_2 / 2)
          .attr("cy", 60)
          .attr("r", 15)
          .attr("id", (d) => {
            switch (d.primera_serie) {
              case "Dragon Ball":
                return "legendDB";
              case "Dragon Ball GT":
                return "legendDBGT";
              case "Dragon Ball Z":
                return "legendDBZ";
              default:
                return "";
            }
          });

        // char torso
        character
          .append("circle")
          .attr("cx", WIDTH_VIS_2 / 2)
          .attr("cy", 100)
          .attr("r", 30)
          .attr("id", (d) => {
            switch (d.serie_recurrente) {
              case "Dragon Ball":
                return "legendDB";
              case "Dragon Ball GT":
                return "legendDBGT";
              case "Dragon Ball Z":
                return "legendDBZ";
              default:
                return "";
            }
          });

        // char lower body
        character
          .append("rect")
          .attr("x", WIDTH_VIS_2 / 2 - 30)
          .attr("y", 100) // Adjust this value as needed to position the body below the head
          .attr("width", 60) // width equal to upper body size
          .attr("height", (d) => bodyHeightScale(d.poder_promedio))
          .style("fill", (d) => aventurasScale(d.aventuras));

        // char right arm
        character
          .append("ellipse")
          .attr("cx", WIDTH_VIS_2 / 2 + 60) 
          .attr("cy", 20) //position
          .attr("rx", 8) // constant arm width
          .attr("ry", (d) => rightArmLengthScale(d.poder_minimo)) // arm length proportional
          .attr("transform", `rotate(120, ${WIDTH_VIS_2 / 2 + 20}, 60)`)
          .style("fill", "#f24f6d");

        // char left arm
        character
          .append("ellipse")
          .attr("cx", WIDTH_VIS_2 / 2 - 60)
          .attr("cy", 20) //position
          .attr("rx", 8) // constant arm width
          .attr("ry", (d) => leftArmLengthScale(d.poder_maximo)) 
          .attr("transform", `rotate(240, ${WIDTH_VIS_2 / 2 - 20}, 60)`)
          .style("fill", "#f24fbe");

        // char name text
        character
          .append("text")
          .attr("x", WIDTH_VIS_2 / 2) // center text
          .attr("y", 30) // position above the head
          .attr("text-anchor", "middle") // center the text
          .text((d) => d.personaje)
          .style("fill", "#8cf2ff")
          .style("font-style", "900")
          .style("font-size", "25px");

        // -------------------- eventos --------------------

        character
          .on("mouseenter", (event, d) => {
            containerCharacters
              .selectAll("g.character")
              .filter((data) => data.personaje !== d.personaje)
              .transition("hide-characters")
              .duration(500)
              .attr("opacity", 0.1);

            // Show the tooltip
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip
              .html(
                `Nombre: ${d.personaje}<br>Primera Serie: ${d.primera_serie}<br>Serie Recurrente: ${d.serie_recurrente}<br>N Aventuras: ${d.aventuras}<br>N Poder Aumenta: ${d.poder_aumenta}<br>Poder Maximo: ${d.poder_maximo}<br>Poder Minimo: ${d.poder_minimo}<br>Poder Promedio: ${d.poder_promedio}`
              )
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 28 + "px");
          })
          .on("mousemove", (event, d) => {
            tooltip
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 28 + "px");
          })
          .on("mouseleave", (_) => {
            // Restore the opacity of other characters
            containerCharacters
              .selectAll("g.character")
              .transition("show-characters")
              .duration(500)
              .attr("opacity", 1);

            // Hide the tooltip
            tooltip.transition().duration(500).style("opacity", 0);
          });

        return character;
      },
      (update) => {
        // move characters
        update.transition(500).attr("transform", (_, i) => {
          let x = (i % NUMBER_OF_COLUMNS) * (WIDTH_VIS_2 / NUMBER_OF_COLUMNS);
          let y =
            Math.floor(i / NUMBER_OF_COLUMNS) *
            (WIDTH_VIS_2 / NUMBER_OF_COLUMNS + 40);
          return `translate(${x}, ${y})`;
        });
        return update;
      },
      (exit) => {
        // Le cambiamos la clase para que luego el selectAll("g.glifo") no pesque estos
        // G que deseamos eliminar
        exit.attr("class", "delete");

        // Hacemos una transición en el exit
        exit
          .transition("exit_glifoChar")
          .duration(500)
          .style("opacity", 0)
          .attr("transform", (_, i) => {
            let x = (i % NUMBER_OF_COLUMNS) * (WIDTH_VIS_2 / NUMBER_OF_COLUMNS);
            let y =
              Math.floor(i / NUMBER_OF_COLUMNS) *
              (WIDTH_VIS_2 / NUMBER_OF_COLUMNS + 40);
            return `translate(${x + 30}, ${y + 100}) scale(10)`;
          });
        // Luego, eliminamos los elementos de la visualización
        exit.transition("delete").delay(500).remove();

        // Finalmente retornamos exit
        return exit;
      }
    );
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
