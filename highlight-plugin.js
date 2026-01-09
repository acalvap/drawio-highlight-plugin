
// Prueba mínima: colorea la celda seleccionada para verificar carga del plugin
Draw.loadPlugin(function (ui) {
  const graph = ui.editor.graph;
  console.log('[highlight-plugin] Plugin cargado');

  graph.getSelectionModel().addListener(mxEvent.CHANGE, function () {
    const sel = graph.getSelectionCell();
    if (!sel) return;

    // Colorea la celda seleccionada con borde y relleno llamativo
    const model = graph.getModel();
    const prev = model.getStyle(sel) || '';
    let newStyle = mxUtils.setStyle(prev, mxConstants.STYLE_STROKECOLOR, '#ff9500');
    newStyle = mxUtils.setStyle(newStyle, mxConstants.STYLE_STROKEWIDTH, '3');
    newStyle = mxUtils.setStyle(newStyle, mxConstants.STYLE_FILLCOLOR, '#fff3cd');
    model.setStyle(sel, newStyle);

    console.log('[highlight-plugin] Selección:', sel && sel.id);
  });
});
