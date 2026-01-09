
// Plugin: resalta orígenes y edges entrantes del nodo seleccionado, y restaura al cambiar/quitar selección
Draw.loadPlugin(function (ui) {
  const graph = ui.editor.graph;
  const model = graph.getModel();

  const EDGE_HIGHLIGHT = { strokeColor: '#ff3b30', strokeWidth: '3' };
  const VERTEX_HIGHLIGHT = { fillColor: '#fff1f0', strokeColor: '#ff3b30', strokeWidth: '2' };

  // Recordamos estilos originales para restaurar
  const originalStyles = new Map();

  function markCell(cell, kv) {
    const id = cell.id || (cell.getId && cell.getId());
    const prev = model.getStyle(cell) || '';
    if (!originalStyles.has(id)) originalStyles.set(id, prev);
    let updated = prev;
    Object.keys(kv).forEach((k) => {
      updated = mxUtils.setStyle(updated, k, kv[k]);
    });
    model.setStyle(cell, updated);
  }

  function clearHighlight() {
    if (originalStyles.size === 0) return;
    model.beginUpdate();
    try {
      originalStyles.forEach((style, id) => {
        const cell = model.getCell(id);
        if (cell) model.setStyle(cell, style != null ? style : null);
      });
      originalStyles.clear();
    } finally {
      model.endUpdate();
    }
  }

  function highlightSources(target) {
    clearHighlight();
    if (!target || !model.isVertex(target)) return;

    // parent=null para abarcar todas las capas y grupos
    const parent = null;
    const incomingEdges = graph.getEdges(
      target,
      parent,
      /*incoming=*/true,
      /*outgoing=*/false,
      /*includeLoops=*/true,
      /*recurse=*/true
    ) || [];

    if (incomingEdges.length === 0) {
      // Como fallback, usamos la lista de edges conectados y filtramos por target
      const allEdges = target.edges || [];
      incomingEdges.push(
        ...allEdges.filter((e) => model.getTerminal(e, false) === target)
      );
    }

    model.beginUpdate();
    try {
      incomingEdges.forEach((e) => {
        const src = model.getTerminal(e, /*isSource=*/true);
        if (src) markCell(src, VERTEX_HIGHLIGHT);
        markCell(e, EDGE_HIGHLIGHT);
      });
    } finally {
      model.endUpdate();
    }
  }

  // Escuchamos cambios de selección en ambos sitios por compatibilidad
  function onSelectionChanged() {
    const sel = graph.getSelectionCell();
    if (!sel) clearHighlight();
    else highlightSources(sel);
  }

  graph.getSelectionModel().addListener(mxEvent.CHANGE, onSelectionChanged);
  graph.addListener(mxEvent.CHANGE, function (sender, evt) {
    // Algunos builds disparan el CHANGE en graph con {added, removed}
    // Si la selección cambió, esto lo capturará igual
    onSelectionChanged();
  });

  console.log('[highlight-plugin] listo');
});
