
// draw.io / diagrams.net plugin
Draw.loadPlugin(function (ui) {
  const graph = ui.editor.graph;
  const model = graph.getModel();

  // Configuración de estilos de resaltado (ajústalos a tu gusto)
  const EDGE_HIGHLIGHT = { strokeColor: '#ff3b30', strokeWidth: '3' };
  const VERTEX_HIGHLIGHT = { fillColor: '#fff1f0', strokeColor: '#ff3b30', strokeWidth: '2' };

  // Mapa para recordar el estilo original y poder restaurarlo (cellId -> styleString)
  const originalStyles = new Map();

  // Aplica pares estilo-valor sobre el estilo actual del cell, guardando el original
  function markCell(cell, kv) {
    const id = cell.getId ? cell.getId() : cell.id;
    const prev = model.getStyle(cell); // string (puede ser null)
    if (!originalStyles.has(id)) originalStyles.set(id, prev);

    let newStyle = prev || '';
    Object.keys(kv).forEach((k) => {
      newStyle = mxUtils.setStyle(newStyle, k, kv[k]);
    });
    model.setStyle(cell, newStyle);
  }

  // Revierte todos los estilos modificados
  function clearHighlight() {
    if (originalStyles.size === 0) return;

    model.beginUpdate();
    try {
      originalStyles.forEach((style, id) => {
        const cell = model.getCell(id);
        if (cell) {
          model.setStyle(cell, style != null ? style : null);
        }
      });
      originalStyles.clear();
    } finally {
      model.endUpdate();
    }
  }

  // Resalta orígenes (nodos fuente) y edges entrantes del target
  function highlightSources(target) {
    clearHighlight();
    if (!target || !model.isVertex(target)) return;

    // Edges entrantes: incoming=true, outgoing=false
    // Nota: getEdges existe en mxGraph y variantes; si tu diagrama usa capas, pasa parent adecuado
    const parent = graph.getDefaultParent();
    const incomingEdges = graph.getEdges(target, parent, /*incoming=*/true, /*outgoing=*/false, /*includeLoops=*/true);
    // En algunos entornos alternativos, usa target.edges o model.getEdges(target).
    // Luego obtenemos el terminal fuente de cada edge.
    model.beginUpdate();
    try {
      (incomingEdges || []).forEach((e) => {
        const src = model.getTerminal(e, /*isSource=*/true);
        if (src) {
          markCell(src, VERTEX_HIGHLIGHT);
        }
        markCell(e, EDGE_HIGHLIGHT);
      });
    } finally {
      model.endUpdate();
    }
  }

  // Escucha cambios de selección y aplica/quita resaltado temporal
  graph.getSelectionModel().addListener(mxEvent.CHANGE, function (sender, evt) {
    const sel = graph.getSelectionCell();
    if (!sel) {
      // Sin selección: restaurar
      clearHighlight();
    } else {
      // Con selección: resaltar orígenes conectados
      highlightSources(sel);
    }
  });
});
