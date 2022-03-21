class Graph {
  vertices: Vertex[];
  edges: Edge[];

  constructor() {
    this.vertices = [];
    this.edges = [];
  }

  hasVertex(vertex: Vertex) {
    return this.vertices.filter((v) => v.id === vertex.id).length > 0;
  }

  addVertex(vertex: Vertex) {
    if (!this.hasVertex(vertex)) {
      this.vertices.push(vertex);
    }
  }

  removeVertex(vertex: Vertex) {
    this.vertices = this.vertices.filter((v) => v.id !== vertex.id);
  }

  getVertex(vertexId: Vertex["id"]): Vertex {
    const vertex = this.vertices.filter((v) => v.id === vertexId)[0];
    if (!vertex) throw Error(`Vertex ${vertexId} does not exist in graph`);
    return vertex;
  }

  _compareEdges(edge1: Edge, edge2: Edge) {
    return edge1.from === edge2.from && edge1.to === edge2.to;
  }

  hasEdge(edge: Edge) {
    return this.edges.filter((e) => this._compareEdges(e, edge)).length > 0;
  }

  addEdge(edge: Edge) {
    if (this.hasEdge(edge)) return;
    if (!this.vertices.map((v) => v.id).includes(edge.from))
      throw Error(`Edge ${edge.from} does not exist on graph`);
    if (!this.vertices.map((v) => v.id).includes(edge.to))
      throw Error(`Edge ${edge.to} does not exist on graph`);

    this.edges.push(edge);
  }

  removeEdge(edge: Edge) {
    this.edges = this.edges.filter((e) => !this._compareEdges(e, edge));
  }

  outDegree(vertex: Vertex) {
    return this.edges.filter((e) => e.from === vertex.id).length;
  }

  inDegree(vertex: Vertex) {
    return this.edges.filter((e) => e.to === vertex.id).length;
  }

  children(vertex: Vertex | Vertex["id"]): Vertex[] {
    if (typeof vertex === "string") {
      return this.edges
        .filter((e) => e.from === vertex)
        .map((e) => this.getVertex(e.to));
    } else {
      return this.edges
        .filter((e) => e.from === vertex.id)
        .map((e) => this.getVertex(e.to));
    }
  }

  resetTopologicalGenerations() {
    this.vertices = this.vertices.map((v) => {
      return { id: v.id };
    });
  }

  getTopologicalGenerations() {
    let indegreeMap = this.vertices.map((v) => {
      return { id: v.id, inDegree: this.inDegree(v) };
    });
    let zeroIndegree = indegreeMap
      .filter((m) => m.inDegree === 0)
      .map((m) => m.id);
    indegreeMap = indegreeMap.filter((m) => m.inDegree > 0);
    let generationIdx = 0;
    while (zeroIndegree.length > 0) {
      const currentGeneration = zeroIndegree;
      zeroIndegree = [];
      for (let vertexId of currentGeneration) {
        for (let child of this.children(vertexId)) {
          const childIdx = indegreeMap.findIndex((m) => m.id === child.id);
          indegreeMap[childIdx].inDegree -= 1;
          if (indegreeMap[childIdx].inDegree === 0) {
            zeroIndegree.push(child.id);
            indegreeMap.splice(childIdx, 1);
          }
        }
      }

      for (let vertexId of currentGeneration) {
        const vertex = this.getVertex(vertexId);
        vertex.topologicalGeneration = generationIdx;   
      }
      generationIdx++;
    }
  }

  checkForCycles() {
    return;
  }
}

interface Vertex {
  id: string;
  topologicalGeneration?: number;
}

interface Edge {
  from: Vertex["id"];
  to: Vertex["id"];
}

export { Graph };
