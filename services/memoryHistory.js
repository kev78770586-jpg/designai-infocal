/**
 * Almacenamiento seguro de historial en memoria para contingencia offline
 * DesignAI - INFOCAL Santa Cruz
 * Permite que el historial persista y esté disponible incluso si MySQL se reconecta
 */

const memoryStore = {
  analisis: [],
  paletas: [],
  tipografias: [],
  ideas: [],
  uiux: []
};

module.exports = {
  addAnalisis(item) {
    memoryStore.analisis.unshift(item);
    if (memoryStore.analisis.length > 50) memoryStore.analisis.pop();
  },
  getAnalisis(usuarioId) {
    if (!usuarioId) return memoryStore.analisis;
    const filtrados = memoryStore.analisis.filter(a => a.usuario_id === usuarioId);
    return filtrados.length > 0 ? filtrados : memoryStore.analisis;
  },

  addPaleta(item) {
    memoryStore.paletas.unshift(item);
    if (memoryStore.paletas.length > 50) memoryStore.paletas.pop();
  },
  getPaletas(usuarioId) {
    if (!usuarioId) return memoryStore.paletas;
    const filtrados = memoryStore.paletas.filter(p => p.usuario_id === usuarioId);
    return filtrados.length > 0 ? filtrados : memoryStore.paletas;
  },

  addTipografia(item) {
    memoryStore.tipografias.unshift(item);
    if (memoryStore.tipografias.length > 50) memoryStore.tipografias.pop();
  },
  getTipografias(usuarioId) {
    if (!usuarioId) return memoryStore.tipografias;
    const filtrados = memoryStore.tipografias.filter(t => t.usuario_id === usuarioId);
    return filtrados.length > 0 ? filtrados : memoryStore.tipografias;
  },

  addIdea(item) {
    memoryStore.ideas.unshift(item);
    if (memoryStore.ideas.length > 50) memoryStore.ideas.pop();
  },
  getIdeas(usuarioId) {
    if (!usuarioId) return memoryStore.ideas;
    const filtrados = memoryStore.ideas.filter(i => i.usuario_id === usuarioId);
    return filtrados.length > 0 ? filtrados : memoryStore.ideas;
  },

  addUIUX(item) {
    memoryStore.uiux.unshift(item);
    if (memoryStore.uiux.length > 50) memoryStore.uiux.pop();
  },
  getUIUX(usuarioId) {
    if (!usuarioId) return memoryStore.uiux;
    const filtrados = memoryStore.uiux.filter(u => u.usuario_id === usuarioId);
    return filtrados.length > 0 ? filtrados : memoryStore.uiux;
  }
};
